"""
Auto-API Generator for MSSQL
Analyzes MSSQL database tables and automatically generates CRUD APIs
"""

import pyodbc
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)


@dataclass
class ColumnInfo:
    """Database column information"""
    name: str
    data_type: str
    is_nullable: bool
    max_length: Optional[int]
    is_primary_key: bool
    is_identity: bool


@dataclass
class TableInfo:
    """Database table information"""
    schema: str
    name: str
    columns: List[ColumnInfo]
    primary_keys: List[str]


class MSSQLIntrospector:
    """Introspects MSSQL database schema"""
    
    def __init__(self, connection_string: str):
        self.connection_string = connection_string
    
    def get_connection(self):
        """Get database connection"""
        return pyodbc.connect(self.connection_string)
    
    def get_tables(self, schema: str = 'dbo') -> List[str]:
        """Get all tables in schema"""
        query = """
        SELECT TABLE_NAME
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE'
        ORDER BY TABLE_NAME
        """
        
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, schema)
            return [row.TABLE_NAME for row in cursor.fetchall()]
    
    def get_table_info(self, table_name: str, schema: str = 'dbo') -> TableInfo:
        """Get detailed table information"""
        
        # Get columns
        columns_query = """
        SELECT 
            c.COLUMN_NAME,
            c.DATA_TYPE,
            c.IS_NULLABLE,
            c.CHARACTER_MAXIMUM_LENGTH,
            CASE WHEN pk.COLUMN_NAME IS NOT NULL THEN 1 ELSE 0 END as IS_PRIMARY_KEY,
            COLUMNPROPERTY(OBJECT_ID(c.TABLE_SCHEMA + '.' + c.TABLE_NAME), c.COLUMN_NAME, 'IsIdentity') as IS_IDENTITY
        FROM INFORMATION_SCHEMA.COLUMNS c
        LEFT JOIN (
            SELECT ku.TABLE_SCHEMA, ku.TABLE_NAME, ku.COLUMN_NAME
            FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
            JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE ku
                ON tc.CONSTRAINT_NAME = ku.CONSTRAINT_NAME
            WHERE tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
        ) pk ON c.TABLE_SCHEMA = pk.TABLE_SCHEMA 
            AND c.TABLE_NAME = pk.TABLE_NAME 
            AND c.COLUMN_NAME = pk.COLUMN_NAME
        WHERE c.TABLE_SCHEMA = ? AND c.TABLE_NAME = ?
        ORDER BY c.ORDINAL_POSITION
        """
        
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(columns_query, schema, table_name)
            
            columns = []
            primary_keys = []
            
            for row in cursor.fetchall():
                col = ColumnInfo(
                    name=row.COLUMN_NAME,
                    data_type=row.DATA_TYPE,
                    is_nullable=row.IS_NULLABLE == 'YES',
                    max_length=row.CHARACTER_MAXIMUM_LENGTH,
                    is_primary_key=bool(row.IS_PRIMARY_KEY),
                    is_identity=bool(row.IS_IDENTITY)
                )
                columns.append(col)
                
                if col.is_primary_key:
                    primary_keys.append(col.name)
            
            return TableInfo(
                schema=schema,
                name=table_name,
                columns=columns,
                primary_keys=primary_keys
            )
    
    def get_all_tables_info(self, schema: str = 'dbo') -> List[TableInfo]:
        """Get information for all tables"""
        tables = self.get_tables(schema)
        return [self.get_table_info(table, schema) for table in tables]


class PydanticModelGenerator:
    """Generates Pydantic models from table info"""
    
    TYPE_MAPPING = {
        'int': 'int',
        'bigint': 'int',
        'smallint': 'int',
        'tinyint': 'int',
        'bit': 'bool',
        'decimal': 'float',
        'numeric': 'float',
        'money': 'float',
        'float': 'float',
        'real': 'float',
        'varchar': 'str',
        'nvarchar': 'str',
        'char': 'str',
        'nchar': 'str',
        'text': 'str',
        'ntext': 'str',
        'datetime': 'datetime',
        'datetime2': 'datetime',
        'date': 'date',
        'time': 'time',
        'uniqueidentifier': 'str',
    }
    
    @classmethod
    def get_python_type(cls, sql_type: str, is_nullable: bool) -> str:
        """Convert SQL type to Python type"""
        python_type = cls.TYPE_MAPPING.get(sql_type.lower(), 'str')
        
        if is_nullable:
            return f'Optional[{python_type}]'
        return python_type
    
    @classmethod
    def generate_model(cls, table_info: TableInfo, model_name: str = None) -> str:
        """Generate Pydantic model code"""
        if not model_name:
            model_name = cls._to_pascal_case(table_info.name)
        
        imports = set(['from pydantic import BaseModel', 'from typing import Optional'])
        
        # Check if datetime types are used
        if any(col.data_type in ['datetime', 'datetime2', 'date', 'time'] for col in table_info.columns):
            imports.add('from datetime import datetime, date, time')
        
        fields = []
        for col in table_info.columns:
            python_type = cls.get_python_type(col.data_type, col.is_nullable)
            
            # Skip identity columns in create model
            if col.is_identity:
                continue
            
            default = ' = None' if col.is_nullable else ''
            fields.append(f'    {col.name}: {python_type}{default}')
        
        model_code = '\n'.join(imports) + '\n\n'
        model_code += f'class {model_name}(BaseModel):\n'
        model_code += '\n'.join(fields) if fields else '    pass'
        model_code += '\n\n    class Config:\n        from_attributes = True\n'
        
        return model_code
    
    @staticmethod
    def _to_pascal_case(snake_str: str) -> str:
        """Convert snake_case to PascalCase"""
        return ''.join(word.capitalize() for word in snake_str.split('_'))


class FastAPIRouterGenerator:
    """Generates FastAPI router code for CRUD operations"""
    
    @classmethod
    def generate_router(cls, table_info: TableInfo, model_name: str = None) -> str:
        """Generate FastAPI router code"""
        if not model_name:
            model_name = PydanticModelGenerator._to_pascal_case(table_info.name)
        
        table_name = table_info.name
        pk_field = table_info.primary_keys[0] if table_info.primary_keys else 'id'
        
        router_code = f'''"""
Auto-generated API for {table_name}
"""

from fastapi import APIRouter, HTTPException, status
from typing import List
import pyodbc
from models.{table_name}_models import {model_name}, {model_name}Create, {model_name}Update

router = APIRouter()

# Database connection (replace with your connection string)
CONNECTION_STRING = "DRIVER={{ODBC Driver 17 for SQL Server}};SERVER=localhost;DATABASE=tenant_db;UID=user;PWD=password"


def get_connection():
    return pyodbc.connect(CONNECTION_STRING)


@router.get("/{table_name}", response_model=List[{model_name}])
async def list_{table_name}(skip: int = 0, limit: int = 100):
    """Get all {table_name} records"""
    query = "SELECT * FROM {table_info.schema}.{table_name} ORDER BY {pk_field} OFFSET ? ROWS FETCH NEXT ? ROWS ONLY"
    
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(query, skip, limit)
        
        columns = [column[0] for column in cursor.description]
        results = []
        
        for row in cursor.fetchall():
            results.append(dict(zip(columns, row)))
        
        return results


@router.get("/{table_name}/{{item_id}}", response_model={model_name})
async def get_{table_name}(item_id: int):
    """Get single {table_name} by ID"""
    query = "SELECT * FROM {table_info.schema}.{table_name} WHERE {pk_field} = ?"
    
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(query, item_id)
        
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="{table_name} not found")
        
        columns = [column[0] for column in cursor.description]
        return dict(zip(columns, row))


@router.post("/{table_name}", response_model={model_name}, status_code=status.HTTP_201_CREATED)
async def create_{table_name}(item: {model_name}Create):
    """Create new {table_name}"""
    # Build INSERT query dynamically
    fields = [k for k, v in item.dict().items() if v is not None]
    placeholders = ', '.join(['?' for _ in fields])
    columns = ', '.join(fields)
    
    query = f"INSERT INTO {table_info.schema}.{table_name} ({{columns}}) OUTPUT INSERTED.* VALUES ({{placeholders}})"
    
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(query, *[getattr(item, f) for f in fields])
        
        row = cursor.fetchone()
        columns = [column[0] for column in cursor.description]
        conn.commit()
        
        return dict(zip(columns, row))


@router.put("/{table_name}/{{item_id}}", response_model={model_name})
async def update_{table_name}(item_id: int, item: {model_name}Update):
    """Update {table_name}"""
    # Build UPDATE query dynamically
    updates = [f"{{k}} = ?" for k, v in item.dict(exclude_unset=True).items()]
    
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    query = f"UPDATE {table_info.schema}.{table_name} SET {{', '.join(updates)}} OUTPUT INSERTED.* WHERE {pk_field} = ?"
    
    with get_connection() as conn:
        cursor = conn.cursor()
        values = list(item.dict(exclude_unset=True).values()) + [item_id]
        cursor.execute(query, *values)
        
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="{table_name} not found")
        
        columns = [column[0] for column in cursor.description]
        conn.commit()
        
        return dict(zip(columns, row))


@router.delete("/{table_name}/{{item_id}}")
async def delete_{table_name}(item_id: int):
    """Delete {table_name}"""
    query = "DELETE FROM {table_info.schema}.{table_name} WHERE {pk_field} = ?"
    
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(query, item_id)
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="{table_name} not found")
        
        conn.commit()
        
        return {{"success": True, "message": "{table_name} deleted"}}
'''
        
        return router_code


def generate_api_for_database(connection_string: str, schema: str = 'dbo', output_dir: str = './generated_api'):
    """
    Main function to generate complete API for all tables in database
    
    Args:
        connection_string: MSSQL connection string
        schema: Database schema (default: dbo)
        output_dir: Output directory for generated files
    """
    import os
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(f'{output_dir}/models', exist_ok=True)
    os.makedirs(f'{output_dir}/routers', exist_ok=True)
    
    # Introspect database
    introspector = MSSQLIntrospector(connection_string)
    tables = introspector.get_all_tables_info(schema)
    
    logger.info(f"Found {len(tables)} tables in schema '{schema}'")
    
    # Generate models and routers for each table
    for table in tables:
        model_name = PydanticModelGenerator._to_pascal_case(table.name)
        
        # Generate Pydantic models
        model_code = PydanticModelGenerator.generate_model(table, model_name)
        
        with open(f'{output_dir}/models/{table.name}_models.py', 'w') as f:
            f.write(model_code)
        
        # Generate FastAPI router
        router_code = FastAPIRouterGenerator.generate_router(table, model_name)
        
        with open(f'{output_dir}/routers/{table.name}_router.py', 'w') as f:
            f.write(router_code)
        
        logger.info(f"Generated API for table: {table.name}")
    
    # Generate main router file
    main_router = generate_main_router(tables)
    with open(f'{output_dir}/main_router.py', 'w') as f:
        f.write(main_router)
    
    logger.info(f"API generation complete! Files saved to: {output_dir}")
    
    return tables


def generate_main_router(tables: List[TableInfo]) -> str:
    """Generate main router that includes all table routers"""
    imports = []
    includes = []
    
    for table in tables:
        imports.append(f"from routers import {table.name}_router")
        includes.append(f'    app.include_router({table.name}_router.router, prefix="/api/{table.name}", tags=["{table.name}"])')
    
    code = '''"""
Auto-generated main router
"""

from fastapi import FastAPI

'''
    code += '\n'.join(imports)
    code += '''

def register_auto_generated_routes(app: FastAPI):
    """Register all auto-generated routes"""
'''
    code += '\n'.join(includes)
    code += '\n'
    
    return code
