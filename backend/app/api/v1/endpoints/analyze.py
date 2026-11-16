import logging
import re
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.analysis import (
    MessageAnalysisRequest,
    MessageAnalysisResponse,
    CallAnalysisRequest,
    CallAnalysisResponse
)
from app.services.engine import ScamDetectionEngine
from app.services.call_reputation import CallReputationService

logger = logging.getLogger("scamshield.analysis")

router = APIRouter()
engine = ScamDetectionEngine()


def _sanitize_for_log(text: str) -> str:
    """Redacts potential OTP digits and phone numbers before recording in server log."""
    redacted = re.sub(r'\b\d{4,8}\b', '[REDACTED_NUM]', text)
    redacted = re.sub(r'(?:\+?91|0)?[6-9]\d{9}', '[REDACTED_PHONE]', redacted)
    return redacted[:100]


@router.post(
    "/message",
    response_model=MessageAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze SMS or WhatsApp text for digital fraud indicators"
)
def analyze_message(request: MessageAnalysisRequest):
    """
    Analyzes message text against rule-based Indian cyber fraud heuristics.
    Supports English, Hindi, Marathi, and Romanized transliterations.
    Crucial: An OTP mention alone is never classified as a scam.
    """
    try:
        # Privacy-conscious debug logging
        logger.info(f"Analyzing message payload (preview: {_sanitize_for_log(request.text)})")
        
        result = engine.analyze(
            text=request.text,
            user_language=request.language
        )
        return result
    except Exception as exc:
        logger.error(f"Error analyzing message: {str(exc)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while evaluating the message. Please verify your input and try again."
        )


@router.post(
    "/call",
    response_model=CallAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Look up incoming number reputation against reported threat database"
)
def analyze_call(
    request: CallAnalysisRequest,
    db: Session = Depends(get_db)
):
    """
    Checks incoming caller phone number against reported threat signatures and spoofed prefixes.
    Unknown numbers remain unverified / safe by default.
    Does not inspect or listen to live call audio.
    """
    try:
        masked = CallReputationService.mask_phone_number(request.phone_number)
        logger.info(f"Looking up call reputation for masked number: {masked}")

        result = CallReputationService.lookup_number(
            phone_number=request.phone_number,
            db=db
        )
        return result
    except Exception as exc:
        logger.error(f"Error querying call reputation: {str(exc)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to query number reputation database at this time."
        )

