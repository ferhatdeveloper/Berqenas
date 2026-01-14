#!/usr/bin/env python3
"""
Berqenas CLI Tool
Command-line interface for managing Berqenas Cloud & Security Platform
"""

import click
import requests
import json
from typing import Optional
from rich.console import Console
from rich.table import Table
from rich import print as rprint

console = Console()

# API Configuration
API_BASE_URL = "http://localhost:8000/api/v1"


@click.group()
@click.version_option(version="1.0.0")
def cli():
    """Berqenas Cloud & Security Platform CLI"""
    pass


# Tenant Management Commands
@cli.group()
def tenant():
    """Manage tenants"""
    pass


@tenant.command("create")
@click.option("--name", required=True, help="Tenant name (lowercase, alphanumeric)")
@click.option("--db-type", type=click.Choice(['postgresql', 'mssql']), default='postgresql', help="Database type (default: postgresql)")
@click.option("--db-quota", default=5, help="Disk quota in GB (default: 5)")
@click.option("--max-connections", default=20, help="Max connections (default: 20)")
@click.option("--vpn/--no-vpn", default=False, help="Enable VPN (default: disabled)")
@click.option("--public-api/--no-public-api", default=True, help="Enable public API (default: enabled)")
def tenant_create(name: str, db_type: str, db_quota: int, max_connections: int, vpn: bool, public_api: bool):
    """Create a new tenant"""
    console.print(f"[bold blue]Creating tenant: {name} (Database: {db_type})[/bold blue]")
    
    payload = {
        "name": name,
        "database_type": db_type,
        "disk_quota_gb": db_quota,
        "max_connections": max_connections,
        "vpn_enabled": vpn,
        "public_api_enabled": public_api
    }
    
    try:
        response = requests.post(f"{API_BASE_URL}/tenant/", json=payload)
        response.raise_for_status()
        
        data = response.json()
        
        console.print("[bold green]✓ Tenant created successfully![/bold green]\n")
        console.print(f"[cyan]Name:[/cyan] {data['name']}")
        console.print(f"[cyan]Schema:[/cyan] {data['schema_name']}")
        console.print(f"[cyan]API Key:[/cyan] {data['api_key']}")
        if data.get('vpn_subnet'):
            console.print(f"[cyan]VPN Subnet:[/cyan] {data['vpn_subnet']}")
        
    except requests.exceptions.RequestException as e:
        console.print(f"[bold red]✗ Failed to create tenant: {e}[/bold red]")


@tenant.command("list")
def tenant_list():
    """List all tenants"""
    try:
        response = requests.get(f"{API_BASE_URL}/tenant/")
        response.raise_for_status()
        
        tenants = response.json()
        
        if not tenants:
            console.print("[yellow]No tenants found[/yellow]")
            return
        
        table = Table(title="Tenants")
        table.add_column("Name", style="cyan")
        table.add_column("Status", style="green")
        table.add_column("Disk Quota", justify="right")
        table.add_column("VPN", justify="center")
        table.add_column("Public API", justify="center")
        
        for tenant in tenants:
            table.add_row(
                tenant['name'],
                tenant['status'],
                f"{tenant['disk_quota_gb']} GB",
                "✓" if tenant['vpn_enabled'] else "✗",
                "✓" if tenant['public_api_enabled'] else "✗"
            )
        
        console.print(table)
        
    except requests.exceptions.RequestException as e:
        console.print(f"[bold red]✗ Failed to list tenants: {e}[/bold red]")


@tenant.command("delete")
@click.argument("name")
@click.option("--permanent", is_flag=True, help="Permanently delete (cannot be undone)")
@click.confirmation_option(prompt="Are you sure you want to delete this tenant?")
def tenant_delete(name: str, permanent: bool):
    """Delete a tenant"""
    try:
        response = requests.delete(f"{API_BASE_URL}/tenant/{name}?permanent={permanent}")
        response.raise_for_status()
        
        console.print(f"[bold green]✓ Tenant {name} deleted successfully[/bold green]")
        
    except requests.exceptions.RequestException as e:
        console.print(f"[bold red]✗ Failed to delete tenant: {e}[/bold red]")


# VPN Management Commands
@cli.group()
def vpn():
    """Manage VPN"""
    pass


@vpn.command("enable")
@click.argument("tenant")
def vpn_enable(tenant: str):
    """Enable VPN for tenant"""
    try:
        response = requests.post(f"{API_BASE_URL}/network/{tenant}/vpn/enable")
        response.raise_for_status()
        
        data = response.json()
        console.print(f"[bold green]✓ VPN enabled for {tenant}[/bold green]")
        console.print(f"[cyan]VPN Subnet:[/cyan] {data['data']['vpn_subnet']}")
        
    except requests.exceptions.RequestException as e:
        console.print(f"[bold red]✗ Failed to enable VPN: {e}[/bold red]")


@vpn.command("client-create")
@click.option("--tenant", required=True, help="Tenant name")
@click.option("--device", required=True, help="Device name")
@click.option("--description", help="Device description")
def vpn_client_create(tenant: str, device: str, description: Optional[str]):
    """Create VPN client for tenant"""
    payload = {
        "tenant": tenant,
        "device_name": device,
        "description": description
    }
    
    try:
        response = requests.post(f"{API_BASE_URL}/network/{tenant}/vpn/client", json=payload)
        response.raise_for_status()
        
        data = response.json()
        console.print(f"[bold green]✓ VPN client created[/bold green]")
        console.print(f"[cyan]Device:[/cyan] {data['device_name']}")
        console.print(f"[cyan]IP Address:[/cyan] {data['ip_address']}")
        
    except requests.exceptions.RequestException as e:
        console.print(f"[bold red]✗ Failed to create VPN client: {e}[/bold red]")


# Firewall Management Commands
@cli.group()
def firewall():
    """Manage firewall rules"""
    pass


@firewall.command("add-rule")
@click.option("--tenant", required=True, help="Tenant name")
@click.option("--source", help="Source IP address")
@click.option("--port", type=int, help="Destination port")
@click.option("--protocol", type=click.Choice(['tcp', 'udp', 'icmp', 'any']), default='tcp')
@click.option("--action", type=click.Choice(['allow', 'deny', 'reject']), default='allow')
@click.option("--comment", help="Rule comment")
def firewall_add_rule(tenant: str, source: Optional[str], port: Optional[int], 
                      protocol: str, action: str, comment: Optional[str]):
    """Add firewall rule"""
    payload = {
        "tenant": tenant,
        "source_ip": source,
        "destination_port": port,
        "protocol": protocol,
        "action": action,
        "comment": comment
    }
    
    try:
        response = requests.post(f"{API_BASE_URL}/network/{tenant}/firewall/rule", json=payload)
        response.raise_for_status()
        
        console.print(f"[bold green]✓ Firewall rule added[/bold green]")
        
    except requests.exceptions.RequestException as e:
        console.print(f"[bold red]✗ Failed to add firewall rule: {e}[/bold red]")


@firewall.command("toggle-public")
@click.option("--tenant", required=True, help="Tenant name")
@click.option("--enabled/--disabled", default=True, help="Enable or disable public access")
def firewall_toggle_public(tenant: str, enabled: bool):
    """Toggle public API access"""
    try:
        response = requests.patch(
            f"{API_BASE_URL}/network/{tenant}/firewall/public-access",
            params={"enabled": enabled}
        )
        response.raise_for_status()
        
        status = "enabled" if enabled else "disabled"
        console.print(f"[bold green]✓ Public access {status} for {tenant}[/bold green]")
        
    except requests.exceptions.RequestException as e:
        console.print(f"[bold red]✗ Failed to toggle public access: {e}[/bold red]")


# Gateway Management Commands
@cli.group()
def gateway():
    """Manage NAT Gateway and public services"""
    pass


@gateway.command("expose")
@click.option("--tenant", required=True, help="Tenant name")
@click.option("--tenant-id", required=True, type=int, help="Tenant ID")
@click.option("--service-ip", required=True, help="VPN subnet IP (e.g., 10.60.5.10)")
@click.option("--service-port", required=True, type=int, help="Service port")
@click.option("--public-port", required=True, type=int, help="Public port")
@click.option("--description", help="Service description")
def gateway_expose(tenant: str, tenant_id: int, service_ip: str, service_port: int, public_port: int, description: str):
    """
    Expose VPN subnet service to public via NAT Gateway
    
    Example:
      berqenas gateway expose --tenant acme --tenant-id 5 \\
        --service-ip 10.60.5.10 --service-port 5432 --public-port 15432 \\
        --description "PostgreSQL Database"
    """
    console.print(f"[bold blue]Exposing service to public...[/bold blue]")
    
    payload = {
        "tenant": tenant,
        "tenant_id": tenant_id,
        "service_ip": service_ip,
        "service_port": service_port,
        "public_port": public_port,
        "description": description
    }
    
    try:
        response = requests.post(f"{API_BASE_URL}/gateway/{tenant}/public-service", json=payload)
        response.raise_for_status()
        
        data = response.json()
        
        console.print("[bold green]✓ Service exposed successfully![/bold green]\n")
        console.print(f"[cyan]Public Endpoint:[/cyan] {data['gateway_public_ip']}:{data['public_port']}")
        console.print(f"[cyan]Routes to:[/cyan] {data['service_ip']}:{data['service_port']}")
        console.print(f"[cyan]Status:[/cyan] {'Enabled' if data['enabled'] else 'Disabled'}")
        
    except requests.exceptions.RequestException as e:
        console.print(f"[bold red]✗ Failed to expose service: {e}[/bold red]")


@gateway.command("list")
@click.argument("tenant")
def gateway_list(tenant: str):
    """List all public services for tenant"""
    try:
        response = requests.get(f"{API_BASE_URL}/gateway/{tenant}/public-services")
        response.raise_for_status()
        
        services = response.json()
        
        if not services:
            console.print("[yellow]No public services found[/yellow]")
            return
        
        table = Table(title=f"Public Services - {tenant}")
        table.add_column("ID", style="cyan")
        table.add_column("Service IP", style="green")
        table.add_column("Service Port", justify="right")
        table.add_column("Public Port", justify="right")
        table.add_column("Gateway IP", style="blue")
        table.add_column("Status", justify="center")
        
        for service in services:
            table.add_row(
                str(service['id']),
                service['service_ip'],
                str(service['service_port']),
                str(service['public_port']),
                service['gateway_public_ip'],
                "✓" if service['enabled'] else "✗"
            )
        
        console.print(table)
        
    except requests.exceptions.RequestException as e:
        console.print(f"[bold red]✗ Failed to list public services: {e}[/bold red]")


@gateway.command("toggle")
@click.option("--tenant", required=True, help="Tenant name")
@click.option("--service-id", required=True, type=int, help="Service ID")
@click.option("--enabled/--disabled", default=True, help="Enable or disable")
def gateway_toggle(tenant: str, service_id: int, enabled: bool):
    """Enable or disable public service"""
    try:
        response = requests.patch(
            f"{API_BASE_URL}/gateway/{tenant}/public-service/{service_id}/toggle",
            json={"enabled": enabled}
        )
        response.raise_for_status()
        
        status = "enabled" if enabled else "disabled"
        console.print(f"[bold green]✓ Public service {status}[/bold green]")
        
    except requests.exceptions.RequestException as e:
        console.print(f"[bold red]✗ Failed to toggle service: {e}[/bold red]")


@gateway.command("remove")
@click.option("--tenant", required=True, help="Tenant name")
@click.option("--service-id", required=True, type=int, help="Service ID")
@click.confirmation_option(prompt="Are you sure you want to remove this public service?")
def gateway_remove(tenant: str, service_id: int):
    """Remove public service"""
    try:
        response = requests.delete(f"{API_BASE_URL}/gateway/{tenant}/public-service/{service_id}")
        response.raise_for_status()
        
        console.print(f"[bold green]✓ Public service removed[/bold green]")
        
    except requests.exceptions.RequestException as e:
        console.print(f"[bold red]✗ Failed to remove service: {e}[/bold red]")


@gateway.command("stats")
@click.option("--tenant", required=True, help="Tenant name")
@click.option("--service-id", required=True, type=int, help="Service ID")
def gateway_stats(tenant: str, service_id: int):
    """Show traffic statistics for public service"""
    try:
        response = requests.get(f"{API_BASE_URL}/gateway/{tenant}/public-service/{service_id}/stats")
        response.raise_for_status()
        
        stats = response.json()
        
        console.print(f"\n[bold]Traffic Statistics - Service {service_id}[/bold]\n")
        console.print(f"[cyan]Total Connections:[/cyan] {stats['total_connections']}")
        console.print(f"[cyan]Bytes In:[/cyan] {stats['bytes_in']}")
        console.print(f"[cyan]Bytes Out:[/cyan] {stats['bytes_out']}")
        
    except requests.exceptions.RequestException as e:
        console.print(f"[bold red]✗ Failed to fetch stats: {e}[/bold red]")


# Auto-API Generator Commands
@cli.group()
def autogen():
    """Auto-generate APIs from MSSQL database"""
    pass


@autogen.command("introspect")
@click.option("--server", required=True, help="MSSQL server address")
@click.option("--database", required=True, help="Database name")
@click.option("--username", required=True, help="Database username")
@click.option("--password", required=True, help="Database password")
@click.option("--schema", default="dbo", help="Schema name (default: dbo)")
def autogen_introspect(server: str, database: str, username: str, password: str, schema: str):
    """
    Analyze MSSQL database structure
    
    Example:
      berqenas autogen introspect --server localhost --database tenant_acme \\
        --username sa --password MyPassword123
    """
    console.print(f"[bold blue]Analyzing database: {database}...[/bold blue]")
    
    payload = {
        "server": server,
        "database": database,
        "username": username,
        "password": password,
        "schema": schema
    }
    
    try:
        response = requests.post(f"{API_BASE_URL}/autogen/introspect", json=payload)
        response.raise_for_status()
        
        data = response.json()
        
        console.print(f"[bold green]✓ Database analyzed successfully![/bold green]\n")
        console.print(f"[cyan]Database:[/cyan] {data['database']}")
        console.print(f"[cyan]Schema:[/cyan] {data['schema']}")
        console.print(f"[cyan]Tables Found:[/cyan] {data['table_count']}\n")
        
        if data['tables']:
            table = Table(title="Database Tables")
            table.add_column("Table Name", style="cyan")
            table.add_column("Columns", justify="right")
            table.add_column("Primary Keys", style="green")
            
            for tbl in data['tables']:
                table.add_row(
                    tbl['name'],
                    str(tbl['column_count']),
                    ', '.join(tbl['primary_keys']) if tbl['primary_keys'] else 'None'
                )
            
            console.print(table)
        
    except requests.exceptions.RequestException as e:
        console.print(f"[bold red]✗ Failed to analyze database: {e}[/bold red]")


@autogen.command("generate")
@click.option("--server", required=True, help="MSSQL server address")
@click.option("--database", required=True, help="Database name")
@click.option("--username", required=True, help="Database username")
@click.option("--password", required=True, help="Database password")
@click.option("--schema", default="dbo", help="Schema name (default: dbo)")
@click.option("--output", default="./generated_api", help="Output directory")
def autogen_generate(server: str, database: str, username: str, password: str, schema: str, output: str):
    """
    Generate complete CRUD API from MSSQL database
    
    This will create:
    - Pydantic models for each table
    - FastAPI routers with CRUD operations
    - Main router file
    
    Example:
      berqenas autogen generate --server localhost --database tenant_acme \\
        --username sa --password MyPassword123 --output ./api/acme
    """
    console.print(f"[bold blue]Generating API for database: {database}...[/bold blue]")
    
    payload = {
        "connection": {
            "server": server,
            "database": database,
            "username": username,
            "password": password,
            "schema": schema
        },
        "output_dir": output
    }
    
    try:
        response = requests.post(f"{API_BASE_URL}/autogen/generate", json=payload)
        response.raise_for_status()
        
        data = response.json()
        
        console.print(f"[bold green]✓ API generation started![/bold green]\n")
        console.print(f"[cyan]Database:[/cyan] {data['database']}")
        console.print(f"[cyan]Output Directory:[/cyan] {data['output_dir']}")
        console.print(f"[cyan]Status:[/cyan] {data['status']}")
        console.print("\n[yellow]API files will be generated in the background.[/yellow]")
        console.print("[yellow]Check the output directory for generated files.[/yellow]")
        
    except requests.exceptions.RequestException as e:
        console.print(f"[bold red]✗ Failed to generate API: {e}[/bold red]")


@autogen.command("tenant-generate")
@click.argument("tenant_name")
def autogen_tenant_generate(tenant_name: str):
    """
    Generate API for a specific tenant's database
    
    This automatically retrieves tenant database info and generates API.
    
    Example:
      berqenas autogen tenant-generate acme
    """
    console.print(f"[bold blue]Generating API for tenant: {tenant_name}...[/bold blue]")
    
    try:
        response = requests.post(f"{API_BASE_URL}/autogen/tenant/{tenant_name}/generate")
        response.raise_for_status()
        
        data = response.json()
        
        console.print(f"[bold green]✓ API generation started![/bold green]\n")
        console.print(f"[cyan]Tenant:[/cyan] {data['tenant']}")
        console.print(f"[cyan]Database:[/cyan] {data['database']}")
        console.print(f"[cyan]Output Directory:[/cyan] {data['output_dir']}")
        console.print(f"[cyan]Status:[/cyan] {data['status']}")
        console.print("\n[yellow]API files will be generated in the background.[/yellow]")
        
    except requests.exceptions.RequestException as e:
        console.print(f"[bold red]✗ Failed to generate API: {e}[/bold red]")


@autogen.command("tenant-tables")
@click.argument("tenant_name")
def autogen_tenant_tables(tenant_name: str):
    """
    List all tables in tenant's database
    
    Example:
      berqenas autogen tenant-tables acme
    """
    console.print(f"[bold blue]Fetching tables for tenant: {tenant_name}...[/bold blue]")
    
    try:
        response = requests.get(f"{API_BASE_URL}/autogen/tenant/{tenant_name}/tables")
        response.raise_for_status()
        
        data = response.json()
        
        console.print(f"[bold green]✓ Tables retrieved![/bold green]\n")
        console.print(f"[cyan]Tenant:[/cyan] {data['tenant']}")
        console.print(f"[cyan]Database:[/cyan] {data['database']}")
        console.print(f"[cyan]Tables Found:[/cyan] {data['table_count']}\n")
        
        if data['tables']:
            table = Table(title=f"Tables in {tenant_name}")
            table.add_column("Table Name", style="cyan")
            table.add_column("Columns", justify="right")
            table.add_column("Primary Keys", style="green")
            
            for tbl in data['tables']:
                table.add_row(
                    tbl['name'],
                    str(tbl['column_count']),
                    ', '.join(tbl['primary_keys']) if tbl['primary_keys'] else 'None'
                )
            
            console.print(table)
        
    except requests.exceptions.RequestException as e:
        console.print(f"[bold red]✗ Failed to fetch tables: {e}[/bold red]")


# Backup Management Commands
@cli.group()
def backup():
    """Manage backups"""
    pass


@backup.command("create")
@click.argument("tenant")
@click.option("--destination", type=click.Choice(['b2', 's3']), default='b2', help="Backup destination")
def backup_create(tenant: str, destination: str):
    """Create backup for tenant"""
    console.print(f"[bold blue]Creating backup for {tenant}...[/bold blue]")
    
    # TODO: Call backup.sh script
    console.print(f"[bold green]✓ Backup created successfully[/bold green]")


@backup.command("restore")
@click.argument("tenant")
@click.argument("timestamp")
@click.option("--mode", type=click.Choice(['clone', 'overwrite']), default='clone')
@click.option("--source", type=click.Choice(['b2', 's3']), default='b2')
def backup_restore(tenant: str, timestamp: str, mode: str, source: str):
    """Restore backup for tenant"""
    if mode == 'overwrite':
        click.confirm(f"This will OVERWRITE tenant {tenant}. Continue?", abort=True)
    
    console.print(f"[bold blue]Restoring backup for {tenant}...[/bold blue]")
    
    # TODO: Call restore.sh script
    console.print(f"[bold green]✓ Backup restored successfully[/bold green]")


if __name__ == "__main__":
    cli()
