import logging
import subprocess
import os
import docker
from typing import Tuple

logger = logging.getLogger(__name__)

class NetworkManager:
    WG_CONFIG_PATH = "/etc/wireguard/wg0.conf"
    WG_INTERFACE = "wg0"
    WG_CONTAINER_NAME = "berqenas-wireguard-1" # Based on docker-compose service name

    @staticmethod
    def generate_keypair() -> Tuple[str, str]:
        """Generate a WireGuard private/public key pair using wg command"""
        try:
            # Generate private key
            priv_key = subprocess.check_output("wg genkey", shell=True).decode('utf-8').strip()
            # Generate public key from private key
            pub_key = subprocess.check_output(f"echo '{priv_key}' | wg pubkey", shell=True).decode('utf-8').strip()
            return priv_key, pub_key
        except Exception as e:
            logger.error(f"Failed to generate keys: {e}")
            raise

    @staticmethod
    def _get_docker_client():
        return docker.from_env()

    @staticmethod
    def _reload_wireguard():
        """Reload WireGuard configuration in the container"""
        try:
            client = NetworkManager._get_docker_client()
            # Find the container
            containers = client.containers.list(filters={"name": "berqenas-wireguard"})
            if not containers:
                logger.error("WireGuard container not found")
                return
            
            wg_container = containers[0]
            # We can restart the container (easiest way to apply config changes without breaking state too much)
            # Or use wg syncconf if we want zerodowntime, but restart is safer for ensuring config consistency.
            wg_container.restart() 
            logger.info("WireGuard container restarted to apply changes")
            
        except Exception as e:
            logger.error(f"Failed to reload WireGuard: {e}")
            # Don't raise here, as we might be running in dev where no docker socket exists
            pass

    @staticmethod
    def ensure_config_exists():
        """Initialize wg0.conf if it doesn't exist"""
        if not os.path.exists(NetworkManager.WG_CONFIG_PATH):
            logger.info(f"Initializing {NetworkManager.WG_CONFIG_PATH}")
            # Generate server keys
            priv, pub = NetworkManager.generate_keypair()
            
            config_content = f"""[Interface]
Address = 10.50.0.1/24
ListenPort = 51820
PrivateKey = {priv}
PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -A FORWARD -o %i -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -D FORWARD -o %i -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE

# Server Public Key: {pub}
# Clients follow below:
"""
            with open(NetworkManager.WG_CONFIG_PATH, "w") as f:
                f.write(config_content)
            
            return pub
        return None

    @staticmethod
    def add_peer_to_interface(interface: str, public_key: str, allowed_ips: str):
        """Add a peer to the configuration file"""
        try:
            # Append peer to file
            peer_block = f"\n[Peer]\nPublicKey = {public_key}\nAllowedIPs = {allowed_ips}\n"
            
            with open(NetworkManager.WG_CONFIG_PATH, "a") as f:
                f.write(peer_block)
            
            logger.info(f"Added peer {public_key} ({allowed_ips}) to {NetworkManager.WG_CONFIG_PATH}")
            
            # Application
            NetworkManager._reload_wireguard()
            
        except Exception as e:
            logger.error(f"Failed to add peer: {e}")
            raise
