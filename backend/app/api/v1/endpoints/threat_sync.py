from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from app.core.database import get_db
from app.models.scam_indicator import ScamIndicator
from app.schemas.sync import ThreatSyncResponse, ThreatItemSync

router = APIRouter()


@router.get("/threats", response_model=ThreatSyncResponse, tags=["Threat Sync"])
def sync_threats(
    since_version: int = Query(default=0, ge=0, description="Highest threat database version currently stored on Android device"),
    limit: int = Query(default=500, ge=1, le=1000, description="Max indicators per sync batch"),
    db: Session = Depends(get_db)
):
    """
    Returns delta threat indicators added or updated since `since_version`.
    Enables zero-network-latency CallScreeningService on Android via Room local caching.
    """
    query = (
        db.query(ScamIndicator)
        .filter(ScamIndicator.version > since_version)
        .order_by(ScamIndicator.version.asc())
        .limit(limit)
    )
    items = query.all()

    # Determine highest version in current database
    max_ver = db.query(func.max(ScamIndicator.version)).scalar() or 0

    threat_items = [
        ThreatItemSync(
            id=item.id,
            indicator_type=item.indicator_type.value,
            value=item.value,
            severity=item.severity.value,
            description=item.description,
            language=item.language,
            is_active=item.is_active,
            version=item.version
        )
        for item in items
    ]

    return ThreatSyncResponse(
        latest_version=max_ver,
        count=len(threat_items),
        threats=threat_items
    )

