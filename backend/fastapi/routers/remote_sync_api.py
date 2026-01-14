"""
Remote Database Sync API
Connects to on-premise databases via WireGuard and syncs data to Berqenas Cloud
"""

from fastapi import APIRouter, HTTPException, status, BackgroundTasks, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import logging

from database import get_db, engine, Base
from models.remote import RemoteDatabase, SyncJob
from pydantic import BaseModel

# Create tables if not exist
Base.metadata.create_all(bind=engine)

router = APIRouter()
logger = logging.getLogger(__name__)


# Pydantic Models for Request/Response
class RemoteDatabaseCreate(BaseModel):
    name: str
    database_type: str
    wireguard_ip: str
    database_host: str
    database_port: int
    database_name: str
    username: str
    password: str
    schema: str = "public"

class RemoteDatabaseResponse(BaseModel):
    id: int
    name: str
    database_type: str
    wireguard_ip: str
    last_sync: Optional[datetime]
    api_enabled: bool
    public_endpoint: Optional[str]
    is_active: bool

    class Config:
        orm_mode = True

# --- API Endpoints ---

@router.post("/remote-db/register", response_model=RemoteDatabaseResponse)
async def register_remote_database(
    config: RemoteDatabaseCreate, 
    db: Session = Depends(get_db)
):
    """Register a remote on-premise database"""
    try:
        # Check if exists
        existing = db.query(RemoteDatabase).filter(RemoteDatabase.name == config.name).first()
        if existing:
            raise HTTPException(status_code=400, detail="Database with this name already exists")

        new_db = RemoteDatabase(
            name=config.name,
            database_type=config.database_type,
            wireguard_ip=config.wireguard_ip,
            database_host=config.database_host,
            database_port=config.database_port,
            database_name=config.database_name,
            username=config.username,
            password=config.password,  # In prod: Encrypt this!
            schema=config.schema
        )
        db.add(new_db)
        db.commit()
        db.refresh(new_db)
        
        logger.info(f"Registered remote database: {new_db.name}")
        return new_db
        
    except Exception as e:
        logger.error(f"Failed to register remote database: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/remote-db/list", response_model=List[RemoteDatabaseResponse])
async def list_remote_databases(db: Session = Depends(get_db)):
    """List all registered remote databases"""
    return db.query(RemoteDatabase).filter(RemoteDatabase.is_active == True).all()


@router.post("/remote-db/{db_id}/sync")
async def sync_remote_database(
    db_id: int, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Trigger sync for a remote database"""
    remote_db = db.query(RemoteDatabase).filter(RemoteDatabase.id == db_id).first()
    if not remote_db:
        raise HTTPException(status_code=404, detail="Database not found")

    # Create Sync Job record
    job = SyncJob(remote_db_id=db_id, status="running")
    db.add(job)
    db.commit()

    def sync_task(job_id: int):
        # Simulation of sync logic
        # In real code, connect to remote_db using connection details
        import time
        try:
            time.sleep(5) # Simulate work
            
            # Update job status
            with Session(engine) as session:
                j = session.query(SyncJob).filter(SyncJob.id == job_id).first()
                if j:
                    j.status = "completed"
                    j.completed_at = datetime.utcnow()
                    j.records_synced = 42
                    
                    # Update DB last sync
                    r = session.query(RemoteDatabase).filter(RemoteDatabase.id == j.remote_db_id).first()
                    if r: r.last_sync = datetime.utcnow()
                    
                    session.commit()
            logger.info(f"Sync job {job_id} completed")
            
        except Exception as e:
             with Session(engine) as session:
                j = session.query(SyncJob).filter(SyncJob.id == job_id).first()
                if j:
                    j.status = "failed"
                    j.error_message = str(e)
                    session.commit()

    background_tasks.add_task(sync_task, job.id)
    
    return {"message": "Sync started", "job_id": job.id}


@router.post("/remote-db/{db_id}/generate-api")
async def generate_api(db_id: int, db: Session = Depends(get_db)):
    """Generate Public API"""
    remote_db = db.query(RemoteDatabase).filter(RemoteDatabase.id == db_id).first()
    if not remote_db:
        raise HTTPException(status_code=404, detail="Database not found")
        
    remote_db.api_enabled = True
    remote_db.public_endpoint = f"https://api.berqenas.com/remote/{db_id}"
    db.commit()
    
    return {"success": True, "public_endpoint": remote_db.public_endpoint}
