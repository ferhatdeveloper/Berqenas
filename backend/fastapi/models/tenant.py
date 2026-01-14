from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from database import Base

class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    schema_name = Column(String, unique=True, nullable=False)
    role_name = Column(String, unique=True, nullable=False)
    disk_quota_gb = Column(Integer, default=5)
    max_connections = Column(Integer, default=20)
    vpn_enabled = Column(Boolean, default=False)
    public_api_enabled = Column(Boolean, default=True)
    api_key = Column(String, unique=True, index=True, nullable=False)
    subdomain = Column(String, unique=True, index=True, nullable=True)
    vpn_subnet = Column(String, nullable=True)
    status = Column(String, default="active") # active, suspended, deleted
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
