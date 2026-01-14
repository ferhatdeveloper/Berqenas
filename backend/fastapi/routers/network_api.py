"""
Network & VPN Management API
Handles WireGuard VPN and firewall configuration
"""

from fastapi import APIRouter, HTTPException, status
from typing import List
import logging

from models.schemas import (
    VPNClientCreate, VPNClientResponse,
    FirewallRuleCreate, FirewallRuleResponse,
    SuccessResponse
)

from services.auth import get_current_active_user
router = APIRouter(dependencies=[Depends(get_current_active_user)])
logger = logging.getLogger(__name__)


# VPN Management
@router.post("/{tenant}/vpn/enable", response_model=SuccessResponse)
async def enable_vpn(tenant: str):
    """Enable VPN for tenant"""
    try:
        logger.info(f"Enabling VPN for tenant: {tenant}")
        
        # TODO: Call wg_provision.sh script
        # TODO: Update tenant record
        # TODO: Audit log
        
        return SuccessResponse(
            message=f"VPN enabled for tenant {tenant}",
            data={"vpn_subnet": "10.50.1.0/24"}
        )
        
    except Exception as e:
        logger.error(f"Failed to enable VPN: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/{tenant}/vpn/disable", response_model=SuccessResponse)
async def disable_vpn(tenant: str):
    """Disable VPN for tenant"""
    try:
        logger.info(f"Disabling VPN for tenant: {tenant}")
        
        # TODO: Stop WireGuard interface
        # TODO: Update tenant record
        # TODO: Audit log
        
        return SuccessResponse(
            message=f"VPN disabled for tenant {tenant}"
        )
        
    except Exception as e:
        logger.error(f"Failed to disable VPN: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/{tenant}/vpn/client", response_model=VPNClientResponse, status_code=status.HTTP_201_CREATED)
async def create_vpn_client(tenant: str, client_in: VPNClientCreate, db: Session = Depends(get_db)):
    """Create new VPN client for tenant"""
    from services.network_manager import NetworkManager
    from models.network import VPNClient as VPNClientModel
    from models.tenant import Tenant as TenantModel
    
    try:
        logger.info(f"Creating VPN client for tenant {tenant}: {client_in.device_name}")
        
        # 1. Fetch tenant to get subnet info
        tenant_db = db.query(TenantModel).filter(TenantModel.name == tenant).first()
        if not tenant_db:
            raise HTTPException(status_code=404, detail="Tenant not found")
            
        # 2. Determine next IP
        client_count = db.query(VPNClientModel).filter(VPNClientModel.tenant_name == tenant).count()
        next_ip = tenant_db.vpn_subnet.replace(".0/24", f".{client_count + 2}")
        
        # 3. Provision in System
        # Mocking keys for now since we don't have wg CLI in this env
        mock_pubkey = f"pub_{uuid.uuid4().hex[:10]}"
        NetworkManager.add_peer_to_interface("wg0", mock_pubkey, f"{next_ip}/32")
        
        # 4. Save to DB
        new_client = VPNClientModel(
            tenant_name=tenant,
            device_name=client_in.device_name,
            public_key=mock_pubkey,
            ip_address=next_ip
        )
        db.add(new_client)
        db.commit()
        db.refresh(new_client)
        
        return new_client
        
    except Exception as e:
        logger.error(f"Failed to create VPN client: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/{tenant}/vpn/clients", response_model=List[VPNClientResponse])
async def list_vpn_clients(tenant: str, db: Session = Depends(get_db)):
    """List all VPN clients for tenant"""
    from models.network import VPNClient as VPNClientModel
    return db.query(VPNClientModel).filter(VPNClientModel.tenant_name == tenant).all()


@router.delete("/{tenant}/vpn/client/{client_id}", response_model=SuccessResponse)
async def revoke_vpn_client(tenant: str, client_id: int):
    """Revoke VPN client access"""
    try:
        logger.info(f"Revoking VPN client {client_id} for tenant {tenant}")
        
        # TODO: Remove peer from WireGuard
        # TODO: Reload WireGuard
        # TODO: Update database
        
        return SuccessResponse(
            message=f"VPN client {client_id} revoked successfully"
        )
        
    except Exception as e:
        logger.error(f"Failed to revoke VPN client: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# Firewall Management
@router.post("/{tenant}/firewall/rule", response_model=FirewallRuleResponse, status_code=status.HTTP_201_CREATED)
async def add_firewall_rule(tenant: str, rule_in: FirewallRuleCreate, db: Session = Depends(get_db)):
    """Add firewall rule for tenant"""
    from models.network import FirewallRule as FirewallRuleModel
    
    try:
        logger.info(f"Adding firewall rule for tenant {tenant}: {rule_in.protocol}:{rule_in.destination_port}")
        
        # 1. Save to database
        new_rule = FirewallRuleModel(
            tenant_name=tenant,
            source_ip=rule_in.source_ip,
            destination_port=rule_in.destination_port,
            protocol=rule_in.protocol.value if hasattr(rule_in.protocol, 'value') else str(rule_in.protocol),
            action=rule_in.action.value if hasattr(rule_in.action, 'value') else str(rule_in.action),
            comment=rule_in.comment
        )
        db.add(new_rule)
        db.commit()
        db.refresh(new_rule)
        
        # 2. In production, we would call a system script here
        # logger.info(f"UFW rule applied for {tenant}")
        
        return new_rule
        
    except Exception as e:
        logger.error(f"Failed to add firewall rule: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/{tenant}/firewall/rules", response_model=List[FirewallRuleResponse])
async def list_firewall_rules(tenant: str, db: Session = Depends(get_db)):
    """List all firewall rules for tenant"""
    from models.network import FirewallRule as FirewallRuleModel
    return db.query(FirewallRuleModel).filter(FirewallRuleModel.tenant_name == tenant).all()


@router.delete("/{tenant}/firewall/rule/{rule_id}", response_model=SuccessResponse)
async def remove_firewall_rule(tenant: str, rule_id: int):
    """Remove firewall rule"""
    try:
        logger.info(f"Removing firewall rule {rule_id} for tenant {tenant}")
        
        # TODO: Remove UFW rule
        # TODO: Update database
        # TODO: Audit log
        
        return SuccessResponse(
            message=f"Firewall rule {rule_id} removed successfully"
        )
        
    except Exception as e:
        logger.error(f"Failed to remove firewall rule: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.patch("/{tenant}/firewall/public-access", response_model=SuccessResponse)
async def toggle_public_access(tenant: str, enabled: bool):
    """Toggle public API access for tenant"""
    try:
        logger.info(f"Toggling public access for tenant {tenant}: {enabled}")
        
        # TODO: Update firewall rules
        # TODO: Update tenant record
        # TODO: Audit log
        
        return SuccessResponse(
            message=f"Public access {'enabled' if enabled else 'disabled'} for tenant {tenant}"
        )
        
    except Exception as e:
        logger.error(f"Failed to toggle public access: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
