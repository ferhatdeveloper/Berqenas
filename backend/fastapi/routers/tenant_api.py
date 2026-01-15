"""
Tenant Management API
Handles tenant onboarding, configuration, and lifecycle
"""

from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
import logging
import subprocess
import uuid

from models.schemas import (
    TenantCreate, TenantUpdate, TenantResponse,
    SuccessResponse, ErrorResponse
)

from services.auth import get_current_active_user
from models.user import User
from sqlalchemy.orm import Session
from database import get_db

router = APIRouter(dependencies=[Depends(get_current_active_user)])
logger = logging.getLogger(__name__)


@router.post("/", response_model=TenantResponse, status_code=status.HTTP_201_CREATED)
async def create_tenant(tenant_in: TenantCreate, db: Session = Depends(get_db)):
    """
    Create a new tenant with isolated schema, VPN, and firewall
    """
    from services.provisioner import DbProvisioner
    from models.tenant import Tenant as TenantModel
    
    try:
        logger.info(f"Creating tenant: {tenant_in.name}")
        
        # 1. Check if tenant exists
        existing = db.query(TenantModel).filter(TenantModel.name == tenant_in.name).first()
        if existing:
            raise HTTPException(status_code=400, detail="Tenant name already taken")

        # 2. Provision DB resources
        tenant_password = str(uuid.uuid4())[:12]
        api_key = f"bk_{uuid.uuid4().hex}"
        vpn_subnet = f"10.50.{100 + db.query(TenantModel).count()}.0/24" if tenant_in.vpn_enabled else None
        
        DbProvisioner.create_tenant_resources(tenant_in.name, tenant_password)
        
        # 3. Save to Metadata DB
        new_tenant = TenantModel(
            name=tenant_in.name,
            schema_name=f"tenant_{tenant_in.name}",
            role_name=f"role_{tenant_in.name}",
            disk_quota_gb=tenant_in.disk_quota_gb,
            max_connections=tenant_in.max_connections,
            vpn_enabled=tenant_in.vpn_enabled,
            public_api_enabled=tenant_in.public_api_enabled,
            api_key=api_key,
            subdomain=tenant_in.subdomain,
            vpn_subnet=vpn_subnet,
            status="active"
        )
        db.add(new_tenant)
        db.commit()
        db.refresh(new_tenant)
        
        logger.info(f"Tenant {tenant_in.name} created and provisioned successfully")
        return new_tenant
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create tenant: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create tenant: {str(e)}"
        )


@router.get("/{tenant_name}", response_model=TenantResponse)
async def get_tenant(tenant_name: str, db: Session = Depends(get_db)):
    """Get tenant information"""
    from models.tenant import Tenant as TenantModel
    tenant = db.query(TenantModel).filter(TenantModel.name == tenant_name).first()
    if not tenant:
        raise HTTPException(status_code=404, detail=f"Tenant {tenant_name} not found")
    return tenant


@router.get("/", response_model=List[TenantResponse])
async def list_tenants(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all tenants"""
    from models.tenant import Tenant as TenantModel
    return db.query(TenantModel).offset(skip).limit(limit).all()


@router.patch("/{tenant_name}", response_model=TenantResponse)
async def update_tenant(tenant_name: str, update: TenantUpdate):
    """Update tenant configuration"""
    try:
        logger.info(f"Updating tenant: {tenant_name}")
        
        # TODO: Update tenant in database
        # TODO: Apply quota changes
        # TODO: Update VPN/firewall if needed
        
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tenant {tenant_name} not found"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update tenant: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/{tenant_name}", response_model=SuccessResponse)
async def delete_tenant(tenant_name: str, permanent: bool = False):
    """
    Delete tenant
    
    - If permanent=False: Soft delete (mark as deleted, keep data)
    - If permanent=True: Hard delete (drop schema, revoke access)
    """
    try:
        logger.info(f"Deleting tenant: {tenant_name} (permanent={permanent})")
        
        if permanent:
            # TODO: Create final backup
            # TODO: Drop schema
            # TODO: Revoke VPN access
            # TODO: Remove firewall rules
            pass
        else:
            # TODO: Mark as deleted in database
            # TODO: Disable API access
            # TODO: Disable VPN access
            pass
        
        return SuccessResponse(
            message=f"Tenant {tenant_name} deleted successfully"
        )
        
    except Exception as e:
        logger.error(f"Failed to delete tenant: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/{tenant_name}/regenerate-api-key", response_model=SuccessResponse)
async def regenerate_api_key(tenant_name: str):
    """Regenerate API key for tenant"""
    try:
        logger.info(f"Regenerating API key for tenant: {tenant_name}")
        
        # TODO: Generate new API key
        # TODO: Update database
        # TODO: Audit log
        
        new_api_key = str(uuid.uuid4())
        
        return SuccessResponse(
            message="API key regenerated successfully",
            data={"api_key": new_api_key}
        )
        
    except Exception as e:
        logger.error(f"Failed to regenerate API key: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
