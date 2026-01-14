import logging
import psycopg2
from sqlalchemy import text
from database import engine

logger = logging.getLogger(__name__)

class DbProvisioner:
    @staticmethod
    def create_tenant_resources(tenant_name: str, password: str):
        """
        Creates a dedicated PostgreSQL schema and a restricted role for a tenant.
        """
        schema_name = f"tenant_{tenant_name}"
        role_name = f"role_{tenant_name}"
        
        # We use a raw connection because role/schema creation usually requires superuser
        # or special privileges not easily managed by ORM sessions
        try:
            with engine.connect() as conn:
                # 1. Create Role
                logger.info(f"Creating role: {role_name}")
                conn.execute(text(f"DROP ROLE IF EXISTS {role_name}"))
                conn.execute(text(f"CREATE ROLE {role_name} WITH LOGIN PASSWORD '{password}'"))
                
                # 2. Create Schema
                logger.info(f"Creating schema: {schema_name}")
                conn.execute(text(f"CREATE SCHEMA IF NOT EXISTS {schema_name} AUTHORIZATION {role_name}"))
                
                # 3. Grant usage on schema to the role
                conn.execute(text(f"GRANT ALL PRIVILEGES ON SCHEMA {schema_name} TO {role_name}"))
                
                # 4. Set search path (optional)
                conn.execute(text(f"ALTER ROLE {role_name} SET search_path TO {schema_name}, public"))
                
                conn.commit()
                logger.info(f"Provisioned resources for tenant: {tenant_name}")
                return True
        except Exception as e:
            logger.error(f"Failed to provision resources for tenant {tenant_name}: {e}")
            raise e

    @staticmethod
    def delete_tenant_resources(tenant_name: str):
        """
        Cleans up resources (Caution: Destructive)
        """
        schema_name = f"tenant_{tenant_name}"
        role_name = f"role_{tenant_name}"
        
        try:
            with engine.connect() as conn:
                conn.execute(text(f"DROP SCHEMA IF EXISTS {schema_name} CASCADE"))
                conn.execute(text(f"DROP ROLE IF EXISTS {role_name}"))
                conn.commit()
                return True
        except Exception as e:
            logger.error(f"Failed to delete resources for tenant {tenant_name}: {e}")
            return False
