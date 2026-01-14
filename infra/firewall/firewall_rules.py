#!/usr/bin/env python3
"""
Berqenas Firewall Management
Automates UFW/iptables rules for tenant isolation and security
"""

import subprocess
import json
from typing import List, Dict, Optional
from dataclasses import dataclass
from enum import Enum


class RuleAction(Enum):
    ALLOW = "allow"
    DENY = "deny"
    REJECT = "reject"


class Protocol(Enum):
    TCP = "tcp"
    UDP = "udp"
    ICMP = "icmp"
    ANY = "any"


@dataclass
class FirewallRule:
    tenant: str
    source_ip: Optional[str] = None
    destination_port: Optional[int] = None
    protocol: Protocol = Protocol.TCP
    action: RuleAction = RuleAction.ALLOW
    comment: Optional[str] = None


class FirewallManager:
    """Manages firewall rules for Berqenas tenants"""
    
    def __init__(self):
        self.ensure_ufw_installed()
    
    def ensure_ufw_installed(self):
        """Check if UFW is installed"""
        try:
            subprocess.run(["ufw", "version"], check=True, capture_output=True)
        except (subprocess.CalledProcessError, FileNotFoundError):
            raise RuntimeError("UFW is not installed. Please install: apt-get install ufw")
    
    def add_rule(self, rule: FirewallRule) -> bool:
        """Add a firewall rule for a tenant"""
        try:
            cmd = ["ufw"]
            
            # Build UFW command
            if rule.action == RuleAction.ALLOW:
                cmd.append("allow")
            elif rule.action == RuleAction.DENY:
                cmd.append("deny")
            elif rule.action == RuleAction.REJECT:
                cmd.append("reject")
            
            # Add source IP if specified
            if rule.source_ip:
                cmd.extend(["from", rule.source_ip])
            
            # Add port and protocol
            if rule.destination_port:
                cmd.extend(["to", "any", "port", str(rule.destination_port)])
            
            if rule.protocol != Protocol.ANY:
                cmd.extend(["proto", rule.protocol.value])
            
            # Add comment
            if rule.comment:
                cmd.extend(["comment", f"'{rule.tenant}: {rule.comment}'"])
            
            # Execute command
            result = subprocess.run(cmd, check=True, capture_output=True, text=True)
            print(f"✅ Rule added: {' '.join(cmd)}")
            return True
            
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to add rule: {e.stderr}")
            return False
    
    def remove_rule(self, rule_number: int) -> bool:
        """Remove a firewall rule by number"""
        try:
            subprocess.run(["ufw", "delete", str(rule_number)], check=True)
            print(f"✅ Rule {rule_number} removed")
            return True
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to remove rule: {e.stderr}")
            return False
    
    def list_rules(self) -> List[str]:
        """List all firewall rules"""
        try:
            result = subprocess.run(
                ["ufw", "status", "numbered"],
                check=True,
                capture_output=True,
                text=True
            )
            return result.stdout.split("\n")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to list rules: {e.stderr}")
            return []
    
    def enable_public_access(self, tenant: str, port: int = 5432) -> bool:
        """Enable public access to tenant database"""
        rule = FirewallRule(
            tenant=tenant,
            destination_port=port,
            protocol=Protocol.TCP,
            action=RuleAction.ALLOW,
            comment="Public database access"
        )
        return self.add_rule(rule)
    
    def disable_public_access(self, tenant: str, port: int = 5432) -> bool:
        """Disable public access to tenant database"""
        rule = FirewallRule(
            tenant=tenant,
            destination_port=port,
            protocol=Protocol.TCP,
            action=RuleAction.DENY,
            comment="Block public database access"
        )
        return self.add_rule(rule)
    
    def allow_vpn_subnet(self, tenant: str, tenant_id: int) -> bool:
        """Allow access from tenant's VPN subnet"""
        subnet = f"10.50.{tenant_id}.0/24"
        rule = FirewallRule(
            tenant=tenant,
            source_ip=subnet,
            action=RuleAction.ALLOW,
            comment="VPN subnet access"
        )
        return self.add_rule(rule)
    
    def block_ip(self, tenant: str, ip_address: str) -> bool:
        """Block specific IP address for a tenant"""
        rule = FirewallRule(
            tenant=tenant,
            source_ip=ip_address,
            action=RuleAction.DENY,
            comment="Blocked IP"
        )
        return self.add_rule(rule)
    
    def allow_ip_to_port(self, tenant: str, ip_address: str, port: int) -> bool:
        """Allow specific IP to access a port"""
        rule = FirewallRule(
            tenant=tenant,
            source_ip=ip_address,
            destination_port=port,
            protocol=Protocol.TCP,
            action=RuleAction.ALLOW,
            comment="Whitelisted IP"
        )
        return self.add_rule(rule)


def main():
    """Example usage"""
    fw = FirewallManager()
    
    # Example: Setup firewall for tenant 'acme' with ID 1
    tenant_name = "acme"
    tenant_id = 1
    
    print(f"🔒 Setting up firewall for tenant: {tenant_name}")
    
    # Allow VPN subnet
    fw.allow_vpn_subnet(tenant_name, tenant_id)
    
    # Block public access to database by default
    fw.disable_public_access(tenant_name, port=5432)
    
    # Allow specific IP to API (example)
    fw.allow_ip_to_port(tenant_name, "203.0.113.50", port=8000)
    
    # List all rules
    print("\n📋 Current firewall rules:")
    for line in fw.list_rules():
        print(line)


if __name__ == "__main__":
    main()
