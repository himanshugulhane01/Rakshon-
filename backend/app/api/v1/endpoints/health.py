from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db
from app.core.config import settings
from app.schemas.health import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["Diagnostics"])
def get_health(db: Session = Depends(get_db)):
    """Health check endpoint that verifies API and database status."""
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as exc:
        db_status = f"unhealthy: {str(exc)}"

    return HealthResponse(
        status="ok" if db_status == "connected" else "degraded",
        app_name=settings.PROJECT_NAME,
        environment=settings.ENVIRONMENT,
        database=db_status,
        supported_languages=settings.SUPPORTED_LANGUAGES,
        version="0.1.0"
    )

