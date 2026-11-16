import re
from sqlalchemy.orm import Session
from app.models.scam_indicator import ScamIndicator, IndicatorType, ThreatSeverity
from app.schemas.analysis import (
    CallAnalysisResponse,
    CallReputationStatus,
    RiskLevel
)


class CallReputationService:
    @staticmethod
    def mask_phone_number(number: str) -> str:
        """Masks phone number to protect senior privacy in logs and responses."""
        clean = re.sub(r'[\s\-]', '', number)
        if len(clean) <= 4:
            return "***"
        return clean[:3] + "****" + clean[-2:]

    @classmethod
    def lookup_number(cls, phone_number: str, db: Session) -> CallAnalysisResponse:
        clean_number = re.sub(r'[\s\-]', '', phone_number)
        masked = cls.mask_phone_number(clean_number)

        # 1. Exact match lookup in active scam indicators
        exact_match = (
            db.query(ScamIndicator)
            .filter(
                ScamIndicator.indicator_type == IndicatorType.PHONE_NUMBER,
                ScamIndicator.value == clean_number,
                ScamIndicator.is_active == True
            )
            .first()
        )

        if exact_match:
            return CallAnalysisResponse(
                phone_number_masked=masked,
                reputation=CallReputationStatus.VERIFIED_THREAT,
                risk_level=RiskLevel.HIGH_RISK,
                details=exact_match.description or "Verified fraudulent caller reported in national threat database."
            )

        # 2. Flagged prefix match lookup
        prefixes = (
            db.query(ScamIndicator)
            .filter(
                ScamIndicator.indicator_type == IndicatorType.PHONE_PREFIX,
                ScamIndicator.is_active == True
            )
            .all()
        )

        for p in prefixes:
            if clean_number.startswith(p.value):
                return CallAnalysisResponse(
                    phone_number_masked=masked,
                    reputation=CallReputationStatus.SUSPICIOUS_PREFIX,
                    risk_level=RiskLevel.CAUTION,
                    details=f"Number matches suspicious or frequently spoofed calling prefix ({p.value})."
                )

        # 3. Default: Unknown caller (Safe by default, never automatically marked as scam)
        return CallAnalysisResponse(
            phone_number_masked=masked,
            reputation=CallReputationStatus.UNKNOWN_CALLER,
            risk_level=RiskLevel.SAFE,
            details="Number is not listed in reported scam databases. Unknown callers are not automatically dangerous."
        )

