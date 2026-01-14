import requests
import os
import logging

logger = logging.getLogger(__name__)

HASURA_URL = os.getenv("HASURA_URL", "http://hasura:8080")
HASURA_ADMIN_SECRET = os.getenv("HASURA_ADMIN_SECRET", "berqenas_admin_secret_123")

class HasuraService:
    """
    Manages Hasura Headless API Engine via Metadata API
    """
    
    @staticmethod
    def _post_metadata(payload: dict):
        headers = {
            "X-Hasura-Admin-Secret": HASURA_ADMIN_SECRET,
            "Content-Type": "application/json"
        }
        response = requests.post(f"{HASURA_URL}/v1/metadata", json=payload, headers=headers)
        response.raise_for_status()
        return response.json()

    @classmethod
    def track_table(cls, table_name: str, schema: str = "public", source: str = "default"):
        """
        Track a table in Hasura to expose it via API
        """
        payload = {
            "type": "pg_track_table",
            "args": {
                "source": source,
                "table": {
                    "schema": schema,
                    "name": table_name
                }
            }
        }
        try:
            logger.info(f"Hasura: Tracking table {schema}.{table_name}")
            return cls._post_metadata(payload)
        except Exception as e:
            logger.error(f"Hasura tracking failed for {table_name}: {e}")
            return {"error": str(e)}

    @classmethod
    def untrack_table(cls, table_name: str, schema: str = "public", source: str = "default"):
        """
        Remove a table from Hasura API
        """
        payload = {
            "type": "pg_untrack_table",
            "args": {
                "source": source,
                "table": {
                    "schema": schema,
                    "name": table_name
                }
            }
        }
        return cls._post_metadata(payload)

    @classmethod
    def create_relationship(cls, table: str, rel_name: str, rel_type: str, mapping: dict, schema: str = "public"):
        """
        Create a relationship between tables (e.g. object or array)
        """
        type_str = "pg_create_object_relationship" if rel_type == "object" else "pg_create_array_relationship"
        payload = {
            "type": type_str,
            "args": {
                "source": "default",
                "table": {"schema": schema, "name": table},
                "name": rel_name,
                "using": mapping
            }
        }
        return cls._post_metadata(payload)

    @classmethod
    def reload_metadata(cls):
        """
        Reload metadata from the database
        """
        return cls._post_metadata({"type": "reload_metadata", "args": {}})
