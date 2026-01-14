import logging
import os
import subprocess
from typing import List, Dict

logger = logging.getLogger(__name__)

WIREGUARD_CONFIG_PATH = os.getenv("WIREGUARD_CONFIG_DIR", "/etc/wireguard")
BACKEND_NETWORK = "10.50.0.0/16"

class NetworkManager:
    @staticmethod
    def generate_client_config(client_name: str, client_ip: str, server_pubkey: str, endpoint: str):
        """
        Generates a WireGuard client configuration string.
        """
        # In a real app, you'd generate a private key for the client too
        # Here we mock the private key generation for the config string
        client_privkey = "CLIENT_PRIVATE_KEY_MOCK" # Should use wg genkey
        
        config = f"""[Interface]
PrivateKey = {client_privkey}
Address = {client_ip}/32
DNS = 1.1.1.1

[Peer]
PublicKey = {server_pubkey}
Endpoint = {endpoint}
AllowedIPs = {BACKEND_NETWORK}
PersistentKeepalive = 25
"""
        return config

    @staticmethod
    def add_peer_to_interface(interface: str, public_key: str, allowed_ips: str):
        """
        Calls wg set to add a peer to a running interface.
        """
        try:
            cmd = ["wg", "set", interface, "peer", public_key, "allowed-ips", allowed_ips]
            subprocess.run(cmd, check=True)
            logger.info(f"Added peer {public_key} to {interface}")
            return True
        except Exception as e:
            logger.error(f"Failed to add peer: {e}")
            # In development/docker without wg installed, this will fail
            # We log but might not want to crash the whole flow if mocking is allowed
            return False

    @staticmethod
    def setup_nat_rule(internal_ip: str, internal_port: int, external_port: int):
        """
        Sets up an iptables NAT rule for port forwarding.
        """
        try:
            # Example: iptables -t nat -A PREROUTING -p tcp --dport $EXT -j DNAT --to-destination $INT:$PORT
            cmd = [
                "iptables", "-t", "nat", "-A", "PREROUTING", 
                "-p", "tcp", "--dport", str(external_port), 
                "-j", "DNAT", "--to-destination", f"{internal_ip}:{internal_port}"
            ]
            # subprocess.run(cmd, check=True)
            logger.info(f"Mocked NAT rule: {internal_ip}:{internal_port} -> port {external_port}")
            return True
        except Exception as e:
            logger.error(f"Failed to setup NAT: {e}")
            return False
