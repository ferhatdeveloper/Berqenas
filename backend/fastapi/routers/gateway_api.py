"""
Gateway & NAT Management API
Handles public exposure of VPN subnet services
"""

from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel, Field
import logging
import subprocess

router = APIRouter()
logger = logging.getLogger(__name__)


class PublicServiceCreate(BaseModel):
    tenant: str
    tenant_id: int
    service_ip: str = Field(..., description="VPN subnet IP (e.g., 10.60.5.10)")
    service_port: int = Field(..., ge=1, le=65535)
    public_port: int = Field(..., ge=1024, le=65535)
    allowed_ips: Optional[List[str]] = Field(None, description="IP whitelist (optional)")
    description: Optional[str] = None


class PublicServiceResponse(BaseModel):
    id: int
    tenant: str
    tenant_id: int
    service_ip: str
    service_port: int
    public_port: int
    gateway_public_ip: str
    enabled: bool
    allowed_ips: Optional[List[str]]
    description: Optional[str]
    created_at: str
    
    class Config:
        from_attributes = True


class PublicServiceToggle(BaseModel):
    enabled: bool


@router.post("/{tenant}/public-service", response_model=PublicServiceResponse, status_code=status.HTTP_201_CREATED)
async def create_public_service(tenant: str, service: PublicServiceCreate):
    """
    Expose a VPN subnet service to public via NAT Gateway
    
    Example:
    - Tenant has PostgreSQL at 10.60.5.10:5432 (VPN subnet)
    - Expose it publicly at gateway_ip:15432
    - Traffic: Internet → 72.60.182.107:15432 → NAT → 10.60.5.10:5432
    """
    try:
        logger.info(f"Creating public service for tenant {tenant}: {service.service_ip}:{service.service_port} → :{service.public_port}")
        
        # TODO: Call nat_gateway.sh script
        # subprocess.run([
        #     "/infra/firewall/nat_gateway.sh",
        #     tenant,
        #     str(service.tenant_id),
        #     str(service.service_port),
        #     str(service.public_port),
        #     "enable"
        # ], check=True)
        
        # TODO: Save to database
        # TODO: Apply IP whitelist if provided
        # TODO: Audit log
        
        # Mock response
        response = PublicServiceResponse(
            id=1,
            tenant=tenant,
            tenant_id=service.tenant_id,
            service_ip=service.service_ip,
            service_port=service.service_port,
            public_port=service.public_port,
            gateway_public_ip="72.60.182.107",
            enabled=True,
            allowed_ips=service.allowed_ips,
            description=service.description,
            created_at="2026-01-14T15:00:00"
        )
        
        logger.info(f"Public service created: {response.gateway_public_ip}:{response.public_port} → {response.service_ip}:{response.service_port}")
        return response
        
    except Exception as e:
        logger.error(f"Failed to create public service: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create public service: {str(e)}"
        )


@router.get("/{tenant}/public-services", response_model=List[PublicServiceResponse])
async def list_public_services(tenant: str):
    """List all public services for tenant"""
    try:
        logger.info(f"Listing public services for tenant: {tenant}")
        
        # TODO: Query database
        
        return []
        
    except Exception as e:
        logger.error(f"Failed to list public services: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.patch("/{tenant}/public-service/{service_id}/toggle", response_model=PublicServiceResponse)
async def toggle_public_service(tenant: str, service_id: int, toggle: PublicServiceToggle):
    """
    Enable or disable public access to a service
    
    - Enabled: NAT rules active, service accessible from internet
    - Disabled: NAT rules removed, service VPN-only
    """
    try:
        logger.info(f"Toggling public service {service_id} for tenant {tenant}: {toggle.enabled}")
        
        # TODO: Get service details from database
        # TODO: Call nat_gateway.sh with enable/disable
        # TODO: Update database
        # TODO: Audit log
        
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Public service {service_id} not found"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to toggle public service: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/{tenant}/public-service/{service_id}")
async def delete_public_service(tenant: str, service_id: int):
    """Remove public service and NAT rules"""
    try:
        logger.info(f"Deleting public service {service_id} for tenant {tenant}")
        
        # TODO: Get service details
        # TODO: Call nat_gateway.sh disable
        # TODO: Remove from database
        # TODO: Audit log
        
        return {"success": True, "message": f"Public service {service_id} deleted"}
        
    except Exception as e:
        logger.error(f"Failed to delete public service: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/{tenant}/public-service/{service_id}/stats")
async def get_service_stats(tenant: str, service_id: int):
    """
    Get traffic statistics for public service
    
    Returns:
    - Total connections
    - Bytes transferred
    - Top source IPs
    - Connection timeline
    """
    try:
        logger.info(f"Fetching stats for public service {service_id}")
        
        # TODO: Query iptables counters
        # TODO: Query audit logs
        # TODO: Aggregate metrics
        
        return {
            "service_id": service_id,
            "total_connections": 0,
            "bytes_in": 0,
            "bytes_out": 0,
            "top_source_ips": [],
            "last_24h_connections": []
        }
        
    except Exception as e:
        logger.error(f"Failed to fetch service stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/{tenant}/public-service/{service_id}/whitelist")
async def update_ip_whitelist(tenant: str, service_id: int, allowed_ips: List[str]):
    """
    Update IP whitelist for public service
    
    Only specified IPs will be able to access the public endpoint
    """
    try:
        logger.info(f"Updating IP whitelist for service {service_id}: {allowed_ips}")
        
        # TODO: Validate IPs
        # TODO: Update iptables rules
        # TODO: Update database
        # TODO: Audit log
        
        return {
            "success": True,
            "message": "IP whitelist updated",
            "allowed_ips": allowed_ips
        }
        
    except Exception as e:
        logger.error(f"Failed to update IP whitelist: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
