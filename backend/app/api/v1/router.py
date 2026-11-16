from fastapi import APIRouter
from app.api.v1.endpoints import health, threat_sync, analyze

api_router = APIRouter()

api_router.include_router(health.router, tags=["Diagnostics"])
api_router.include_router(threat_sync.router, prefix="/sync", tags=["Threat Sync"])
api_router.include_router(analyze.router, prefix="/analyze", tags=["Scam Analysis"])

