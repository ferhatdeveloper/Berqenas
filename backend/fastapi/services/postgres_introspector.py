"""
PostgreSQL Auto-API Generator
Analyzes PostgreSQL database tables and automatically generates CRUD APIs
"""

import psycopg2
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


class PostgreSQLIntrospector:
    """Introspects PostgreSQL database schema"""
    
    def __init__(self, connection_string: str):
        self.connection_string = connection_string
    
    def get_connection(self):
        """Get database connection"""
        return psycopg2.connect(self.connection_string)
    
    def get_tables(self, schema: str = 'public') -> List[str]:
        """Get all tables in schema"""
        query = """
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = %s AND table_type = 'BASE TABLE'
        ORDER BY table_name
        """
        
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, (schema,))
                return [row[0] for row in cursor.fetchall()]
    
    def get_table_info(self, table_name: str, schema: str = 'public') -> TableInfo:
        """Get detailed table information"""
        
        # Get columns with primary key info
        columns_query = """
        SELECT 
            c.column_name,
            c.data_type,
            c.is_nullable,
            c.character_maximum_length,
            CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary_key,
            CASE WHEN c.column_default LIKE 'nextval%' THEN true ELSE false END as is_identity
        FROM information_schema.columns c
        LEFT JOIN (
            SELECT ku.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage ku
                ON tc.constraint_name = ku.constraint_name
                AND tc.table_schema = ku.table_schema
            WHERE tc.constraint_type = 'PRIMARY KEY'
                AND tc.table_schema = %s
                AND tc.table_name = %s
        ) pk ON c.column_name = pk.column_name
        WHERE c.table_schema = %s AND c.table_name = %s
        ORDER BY c.ordinal_position
        """
        
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(columns_query, (schema, table_name, schema, table_name))
                
                columns = []
                primary_keys = []
                
                for row in cursor.fetchall():
                    col = ColumnInfo(
                        name=row[0],
                        data_type=row[1],
                        is_nullable=row[2] == 'YES',
                        max_length=row[3],
                        is_primary_key=row[4],
                        is_identity=row[5]
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
    
    def get_all_tables_info(self, schema: str = 'public') -> List[TableInfo]:
        """Get information for all tables"""
        tables = self.get_tables(schema)
        return [self.get_table_info(table, schema) for table in tables]


# Type mapping for PostgreSQL
POSTGRESQL_TYPE_MAPPING = {
    'integer': 'int',
    'bigint': 'int',
    'smallint': 'int',
    'serial': 'int',
    'bigserial': 'int',
    'boolean': 'bool',
    'numeric': 'float',
    'decimal': 'float',
    'real': 'float',
    'double precision': 'float',
    'money': 'float',
    'character varying': 'str',
    'varchar': 'str',
    'character': 'str',
    'char': 'str',
    'text': 'str',
    'timestamp without time zone': 'datetime',
    'timestamp with time zone': 'datetime',
    'date': 'date',
    'time': 'time',
    'uuid': 'str',
    'json': 'dict',
    'jsonb': 'dict',
}
