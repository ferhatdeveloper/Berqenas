"""
Auto-API Generator API
Endpoint for generating APIs from MSSQL tables
"""

from fastapi import APIRouter, HTTPException, status, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional
import logging

from services.auto_api_generator import generate_api_for_database, MSSQLIntrospector

from services.auth import get_current_active_user

router = APIRouter(dependencies=[Depends(get_current_active_user)])
logger = logging.getLogger(__name__)


class DatabaseConnection(BaseModel):
    server: str
    database: str
    username: str
    password: str
    schema: str = "dbo"
    driver: str = "ODBC Driver 17 for SQL Server"


class TableSchema(BaseModel):
    name: str
    schema: str
    column_count: int
    primary_keys: List[str]


class GenerateAPIRequest(BaseModel):
    connection: DatabaseConnection
    tables: Optional[List[str]] = None  # If None, generate for all tables
    output_dir: str = "./generated_api"


@router.post("/introspect")
async def introspect_database(connection: DatabaseConnection):
    """
    Introspect MSSQL database and return table information
    
    This endpoint analyzes the database structure without generating APIs
    """
    try:
        connection_string = (
            f"DRIVER={{{connection.driver}}};"
            f"SERVER={connection.server};"
            f"DATABASE={connection.database};"
            f"UID={connection.username};"
            f"PWD={connection.password}"
        )
        
        introspector = MSSQLIntrospector(connection_string)
        tables_info = introspector.get_all_tables_info(connection.schema)
        
        result = []
        for table in tables_info:
            result.append(TableSchema(
                name=table.name,
                schema=table.schema,
                column_count=len(table.columns),
                primary_keys=table.primary_keys
            ))
        
        return {
            "success": True,
            "database": connection.database,
            "schema": connection.schema,
            "table_count": len(result),
            "tables": result
        }
        
    except Exception as e:
        logger.error(f"Failed to introspect database: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to introspect database: {str(e)}"
        )


@router.post("/generate")
async def generate_api(request: GenerateAPIRequest, background_tasks: BackgroundTasks):
    """
    Generate complete CRUD API for MSSQL database tables
    
    This will:
    1. Analyze database schema
    2. Generate Pydantic models
    3. Generate FastAPI routers with CRUD operations
    4. Create main router file
    
    Example:
    ```json
    {
      "connection": {
        "server": "localhost",
        "database": "tenant_acme",
        "username": "tenant_acme_user",
        "password": "password",
        "schema": "dbo"
      },
      "output_dir": "./generated_api/acme"
    }
    ```
    """
    try:
        connection_string = (
            f"DRIVER={{{request.connection.driver}}};"
            f"SERVER={request.connection.server};"
            f"DATABASE={request.connection.database};"
            f"UID={request.connection.username};"
            f"PWD={request.connection.password}"
        )
        
        logger.info(f"Generating API for database: {request.connection.database}")
        
        # Generate API (run in background for large databases)
        def generate_task():
            tables = generate_api_for_database(
                connection_string,
                request.connection.schema,
                request.output_dir
            )
            logger.info(f"API generation complete: {len(tables)} tables processed")
        
        background_tasks.add_task(generate_task)
        
        return {
            "success": True,
            "message": "API generation started",
            "database": request.connection.database,
            "output_dir": request.output_dir,
            "status": "processing"
        }
        
    except Exception as e:
        logger.error(f"Failed to generate API: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate API: {str(e)}"
        )


@router.get("/status/{database}")
async def get_generation_status(database: str):
    """Get API generation status"""
    # TODO: Implement status tracking
    return {
        "database": database,
        "status": "completed",
        "message": "API generation completed successfully"
    }


@router.post("/tenant/{tenant_name}/generate")
async def generate_api_for_tenant(tenant_name: str, background_tasks: BackgroundTasks):
    """
    Generate API for a specific tenant's database
    
    This automatically:
    1. Retrieves tenant database connection info
    2. Analyzes tenant's database schema
    3. Generates complete CRUD API
    4. Saves to tenant-specific directory
    
    Example:
    ```
    POST /api/v1/autogen/tenant/acme/generate
    ```
    
    Generated API will be saved to: `./generated_api/tenant_acme/`
    """
    try:
        logger.info(f"Generating API for tenant: {tenant_name}")
        
        # TODO: Get tenant database connection from database
        # For now, use mock data
        # In production, query: SELECT * FROM tenants WHERE name = tenant_name
        
        # Mock tenant info
        tenant_info = {
            "name": tenant_name,
            "database_type": "mssql",  # or "postgresql"
            "database_name": f"tenant_{tenant_name}",
            "server": "localhost",
            "username": f"tenant_{tenant_name}_user",
            "password": "RETRIEVE_FROM_VAULT"  # Use secret manager in production
        }
        
        if tenant_info["database_type"] != "mssql":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Auto-API generation only supports MSSQL. Tenant {tenant_name} uses {tenant_info['database_type']}"
            )
        
        connection_string = (
            f"DRIVER={{ODBC Driver 17 for SQL Server}};"
            f"SERVER={tenant_info['server']};"
            f"DATABASE={tenant_info['database_name']};"
            f"UID={tenant_info['username']};"
            f"PWD={tenant_info['password']}"
        )
        
        output_dir = f"./generated_api/tenant_{tenant_name}"
        
        # Generate API in background
        def generate_task():
            tables = generate_api_for_database(
                connection_string,
                "dbo",
                output_dir
            )
            logger.info(f"API generation complete for tenant {tenant_name}: {len(tables)} tables processed")
        
        background_tasks.add_task(generate_task)
        
        return {
            "success": True,
            "message": f"API generation started for tenant: {tenant_name}",
            "tenant": tenant_name,
            "database": tenant_info["database_name"],
            "output_dir": output_dir,
            "status": "processing"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to generate API for tenant {tenant_name}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate API: {str(e)}"
        )


@router.get("/tenant/{tenant_name}/tables")
async def get_tenant_tables(tenant_name: str):
    """
    Get list of tables in tenant's database
    
    Useful for previewing what APIs will be generated
    """
    try:
        # TODO: Get tenant database connection
        tenant_info = {
            "database_name": f"tenant_{tenant_name}",
            "server": "localhost",
            "username": f"tenant_{tenant_name}_user",
            "password": "RETRIEVE_FROM_VAULT"
        }
        
        connection_string = (
            f"DRIVER={{ODBC Driver 17 for SQL Server}};"
            f"SERVER={tenant_info['server']};"
            f"DATABASE={tenant_info['database_name']};"
            f"UID={tenant_info['username']};"
            f"PWD={tenant_info['password']}"
        )
        
        introspector = MSSQLIntrospector(connection_string)
        tables_info = introspector.get_all_tables_info("dbo")
        
        result = []
        for table in tables_info:
            result.append({
                "name": table.name,
                "schema": table.schema,
                "column_count": len(table.columns),
                "primary_keys": table.primary_keys,
                "columns": [
                    {
                        "name": col.name,
                        "type": col.data_type,
                        "nullable": col.is_nullable,
                        "is_primary_key": col.is_primary_key
                    }
                    for col in table.columns
                ]
            })
        
        return {
            "success": True,
            "tenant": tenant_name,
            "database": tenant_info["database_name"],
            "table_count": len(result),
            "tables": result
        }
        
    except Exception as e:
        logger.error(f"Failed to get tables for tenant {tenant_name}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get tables: {str(e)}"
        )
