from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class RemoteDatabase(Base):
    __tablename__ = "remote_databases"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    database_type = Column(String, nullable=False)  # mssql, postgresql
    wireguard_ip = Column(String, nullable=False)
    
    # Connection Details
    database_host = Column(String, nullable=False)
    database_port = Column(Integer, nullable=False)
    database_name = Column(String, nullable=False)
    username = Column(String, nullable=False)
    password = Column(String, nullable=False)  # Should be encrypted in real app
    schema = Column(String, default="public")
    
    # Status
    api_enabled = Column(Boolean, default=False)
    public_endpoint = Column(String, nullable=True)
    last_sync = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    sync_jobs = relationship("SyncJob", back_populates="remote_db")


class SyncJob(Base):
    __tablename__ = "sync_jobs"

    id = Column(Integer, primary_key=True, index=True)
    remote_db_id = Column(Integer, ForeignKey("remote_databases.id"))
    status = Column(String, default="pending")  # pending, running, completed, failed
    sync_mode = Column(String, default="full")
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    records_synced = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)

    remote_db = relationship("RemoteDatabase", back_populates="sync_jobs")


class SyncConflict(Base):
    __tablename__ = "sync_conflicts"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("sync_jobs.id"), nullable=False)
    table_name = Column(String, nullable=False)
    primary_key_value = Column(String, nullable=False)
    cloud_data = Column(Text)  # JSON string
    local_data = Column(Text)  # JSON string
    resolution = Column(String, nullable=True)  # cloud_wins, local_wins, manual
    resolved_at = Column(DateTime, nullable=True)


class SyncLog(Base) :
    __tablename__ = "sync_logs"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("sync_jobs.id"), nullable=False)
    level = Column(String, default="info")  # info, warning, error
    message = Column(String, nullable=False)
    timestamp = Column(DateTime, server_default=func.now())
