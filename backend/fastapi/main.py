"""
Berqenas Cloud & Security Platform
FastAPI Backend - Main Application
"""

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import time
import logging

# Import routers
from routers import tenant_api, network_api, security_api, realtime_api, billing_api, gateway_api, autogen_api, remote_sync_api

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    logger.info("🚀 Berqenas Platform starting up...")
    # Startup: Initialize database connections, etc.
    yield
    # Shutdown: Close connections, cleanup
    logger.info("👋 Berqenas Platform shutting down...")


# Create FastAPI application
app = FastAPI(
    title="Berqenas Cloud & Security Platform",
    description="Multi-tenant cloud platform with VPN, firewall, and realtime capabilities",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GZip Middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)


# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal server error",
            "detail": str(exc) if app.debug else "An unexpected error occurred"
        }
    )


# Health check endpoint
@app.get("/health", tags=["System"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "berqenas-api",
        "version": "1.0.0"
    }


# Root endpoint
@app.get("/", tags=["System"])
async def root():
    """API root endpoint"""
    return {
        "message": "Berqenas Cloud & Security Platform API",
        "version": "1.0.0",
        "docs": "/api/docs"
    }


# Include routers
app.include_router(tenant_api.router, prefix="/api/v1/tenant", tags=["Tenant Management"])
app.include_router(network_api.router, prefix="/api/v1/network", tags=["Network & VPN"])
app.include_router(security_api.router, prefix="/api/v1/security", tags=["Security & Audit"])
app.include_router(realtime_api.router, prefix="/api/v1/realtime", tags=["Realtime Events"])
app.include_router(billing_api.router, prefix="/api/v1/billing", tags=["Billing & Usage"])
app.include_router(gateway_api.router, prefix="/api/v1/gateway", tags=["Gateway & NAT"])
app.include_router(autogen_api.router, prefix="/api/v1/autogen", tags=["Auto-API Generator"])
app.include_router(remote_sync_api.router, prefix="/api/v1/sync", tags=["Remote Database Sync"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
