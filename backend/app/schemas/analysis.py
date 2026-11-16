from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import enum


class RiskLevel(str, enum.Enum):
    SAFE = "SAFE"
    CAUTION = "CAUTION"
    HIGH_RISK = "HIGH_RISK"


class IndicatorCategory(str, enum.Enum):
    KYC_FRAUD = "KYC_FRAUD"
    OTP_DEMAND = "OTP_DEMAND"
    UPI_COLLECT = "UPI_COLLECT"
    APK_DOWNLOAD = "APK_DOWNLOAD"
    ELECTRICITY_CUTOFF = "ELECTRICITY_CUTOFF"
    DIGITAL_ARREST = "DIGITAL_ARREST"
    ACCOUNT_BLOCK = "ACCOUNT_BLOCK"
    SUSPICIOUS_LINK = "SUSPICIOUS_LINK"
    URGENT_PRESSURE = "URGENT_PRESSURE"
    BENIGN_TRANSACTION = "BENIGN_TRANSACTION"


class DetectedIndicator(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    category: IndicatorCategory
    indicator_name: str
    severity: str  # HIGH, MEDIUM, LOW, BENIGN
    description: str
    evidence: str


class MessageAnalysisRequest(BaseModel):
    text: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="Text content of the message shared by senior citizen"
    )
    sender: Optional[str] = Field(
        default=None,
        max_length=50,
        description="Optional sender address / SMS header / phone number"
    )
    language: Optional[str] = Field(
        default=None,
        description="User language preference: 'en', 'hi', 'mr'. If omitted, detected automatically."
    )


class MessageAnalysisResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    risk_level: RiskLevel
    risk_score: int = Field(ge=0, le=100, description="Heuristic score from 0 to 100")
    detected_indicators: List[DetectedIndicator]
    explanation: str
    recommended_actions: List[str]
    language: str
    disclaimer: str = (
        "Notice: This score is an automated rule-based heuristic designed to assist your judgement. "
        "It is not a guarantee or statistical probability. When in doubt, consult family or call 1930."
    )


class CallReputationStatus(str, enum.Enum):
    VERIFIED_THREAT = "VERIFIED_THREAT"
    SUSPICIOUS_PREFIX = "SUSPICIOUS_PREFIX"
    UNKNOWN_CALLER = "UNKNOWN_CALLER"


class CallAnalysisRequest(BaseModel):
    phone_number: str = Field(
        ...,
        min_length=5,
        max_length=32,
        pattern=r"^\+?[0-9\s\-]+$",
        description="Phone number to look up in the threat database"
    )


class CallAnalysisResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    phone_number_masked: str
    reputation: CallReputationStatus
    risk_level: RiskLevel
    details: str
    disclaimer: str = (
        "Notice: Number reputation is based strictly on reported threat database records. "
        "It does not monitor or detect live voice conversations."
    )

