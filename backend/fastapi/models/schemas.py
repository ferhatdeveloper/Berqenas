"""
Pydantic models for Berqenas Platform
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


# Enums
class TenantStatus(str, Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    DELETED = "deleted"


class AccessMode(str, Enum):
    VPN_ONLY = "vpn_only"
    PUBLIC_API = "public_api"
    HYBRID = "hybrid"


class FirewallAction(str, Enum):
    ALLOW = "allow"
    DENY = "deny"
    REJECT = "reject"


class Protocol(str, Enum):
    TCP = "tcp"
    UDP = "udp"
    ICMP = "icmp"
    ANY = "any"


# Tenant Models
class TenantCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=50, pattern="^[a-z0-9_]+$")
    database_type: str = Field(default="postgresql", pattern="^(postgresql|mssql)$")
    disk_quota_gb: int = Field(default=5, ge=1, le=1000)
    max_connections: int = Field(default=20, ge=1, le=1000)
    vpn_enabled: bool = Field(default=False)
    public_api_enabled: bool = Field(default=True)
    subdomain: Optional[str] = Field(None, pattern="^[a-z0-9-]+$")
    
    @validator('name')
    def name_must_be_lowercase(cls, v):
        return v.lower()


class TenantUpdate(BaseModel):
    disk_quota_gb: Optional[int] = Field(None, ge=1, le=1000)
    max_connections: Optional[int] = Field(None, ge=1, le=1000)
    vpn_enabled: Optional[bool] = None
    public_api_enabled: Optional[bool] = None
    status: Optional[TenantStatus] = None


class TenantResponse(BaseModel):
    id: int
    name: str
    schema_name: str
    role_name: str
    disk_quota_gb: int
    max_connections: int
    vpn_enabled: bool
    public_api_enabled: bool
    api_key: str
    subdomain: Optional[str]
    vpn_subnet: Optional[str]
    status: TenantStatus
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Network Models
class VPNClientCreate(BaseModel):
    tenant: str
    device_name: str = Field(..., min_length=3, max_length=50)
    description: Optional[str] = None


class VPNClientResponse(BaseModel):
    id: int
    tenant: str
    device_name: str
    public_key: str
    ip_address: str
    created_at: datetime
    last_handshake: Optional[datetime]
    
    class Config:
        from_attributes = True


class FirewallRuleCreate(BaseModel):
    tenant: str
    source_ip: Optional[str] = None
    destination_port: Optional[int] = Field(None, ge=1, le=65535)
    protocol: Protocol = Protocol.TCP
    action: FirewallAction = FirewallAction.ALLOW
    comment: Optional[str] = None


class FirewallRuleResponse(BaseModel):
    id: int
    tenant: str
    source_ip: Optional[str]
    destination_port: Optional[int]
    protocol: Protocol
    action: FirewallAction
    comment: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


# Security Models
class AuditLogEntry(BaseModel):
    tenant: str
    event_type: str
    actor: str
    action: str
    resource: str
    source_ip: Optional[str]
    user_agent: Optional[str]
    metadata: Optional[Dict[str, Any]]
    severity: str = "info"


class AuditLogResponse(BaseModel):
    id: str
    timestamp: datetime
    tenant: str
    event_type: str
    actor: str
    action: str
    resource: str
    source_ip: Optional[str]
    severity: str
    
    class Config:
        from_attributes = True


# Realtime Models
class RealtimeEvent(BaseModel):
    device_id: str
    event_type: str
    payload: Dict[str, Any]


class RealtimeEventResponse(BaseModel):
    id: str
    device_id: str
    event_type: str
    payload: Dict[str, Any]
    timestamp: datetime
    processed: bool
    
    class Config:
        from_attributes = True


class DeviceRegister(BaseModel):
    tenant: str
    device_id: str
    device_name: str
    device_type: Optional[str] = None


class DeviceResponse(BaseModel):
    id: int
    tenant: str
    device_id: str
    device_name: str
    device_type: Optional[str]
    token: str
    created_at: datetime
    last_seen: Optional[datetime]
    
    class Config:
        from_attributes = True


# Billing Models
class UsageMetrics(BaseModel):
    disk_usage_gb: float
    connection_hours: float
    event_count: int
    api_call_count: int
    vpn_data_gb: float
    backup_storage_gb: float


class UsageResponse(BaseModel):
    tenant: str
    period_start: datetime
    period_end: datetime
    metrics: UsageMetrics
    total_amount: float
    currency: str = "USD"
    
    class Config:
        from_attributes = True


class QuotaUpdate(BaseModel):
    disk_quota_gb: Optional[int] = Field(None, ge=1, le=1000)
    max_connections: Optional[int] = Field(None, ge=1, le=1000)
    events_per_hour: Optional[int] = Field(None, ge=100, le=1000000)
    api_calls_per_day: Optional[int] = Field(None, ge=1000, le=10000000)


class QuotaResponse(BaseModel):
    tenant: str
    disk_quota_gb: int
    max_connections: int
    events_per_hour: int
    api_calls_per_day: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Auth Models
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class UserBase(BaseModel):
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = True


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: Optional[str] = None
    full_name: Optional[str] = None
    password: Optional[str] = None


class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True


# API Response Models
class SuccessResponse(BaseModel):
    success: bool = True
    message: str
    data: Optional[Any] = None


class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    detail: Optional[str] = None
