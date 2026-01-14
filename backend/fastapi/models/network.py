from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base

class VPNClient(Base):
    __tablename__ = "vpn_clients"

    id = Column(Integer, primary_key=True, index=True)
    tenant_name = Column(String, ForeignKey("tenants.name"), nullable=False)
    device_name = Column(String, nullable=False)
    public_key = Column(String, nullable=False)
    ip_address = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_handshake = Column(DateTime(timezone=True), nullable=True)

class FirewallRule(Base):
    __tablename__ = "firewall_rules"

    id = Column(Integer, primary_key=True, index=True)
    tenant_name = Column(String, ForeignKey("tenants.name"), nullable=False)
    source_ip = Column(String, nullable=True)
    destination_port = Column(Integer, nullable=True)
    protocol = Column(String, default="tcp")
    action = Column(String, default="allow") # allow, deny, reject
    comment = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
