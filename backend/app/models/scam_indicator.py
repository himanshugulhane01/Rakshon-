from sqlalchemy import Column, Integer, String, Boolean, Enum, DateTime
import enum
from datetime import datetime, timezone
from app.core.database import Base
from app.models.base import TimestampMixin


class IndicatorType(str, enum.Enum):
    PHONE_NUMBER = "PHONE_NUMBER"      # Exact scammer phone number (E.164)
    PHONE_PREFIX = "PHONE_PREFIX"      # Suspicious prefix / country / area code
    UPI_HANDLE = "UPI_HANDLE"          # Mule or fraudulent UPI VPA
    PHISHING_DOMAIN = "PHISHING_DOMAIN"# Phishing link / malicious domain
    KEYWORD_PATTERN = "KEYWORD_PATTERN"# Threat phrase pattern (regex/keyword)


class ThreatSeverity(str, enum.Enum):
    HIGH = "HIGH"          # Verified scam / extortion / digital arrest
    MEDIUM = "MEDIUM"      # Suspicious marketing / unverified financial lure
    LOW = "LOW"            # Potential spam


class ScamIndicator(Base, TimestampMixin):
    __tablename__ = "scam_indicators"

    id = Column(Integer, primary_key=True, index=True)
    indicator_type = Column(Enum(IndicatorType), nullable=False, index=True)
    value = Column(String(255), nullable=False, index=True)  # The number, prefix, handle, etc.
    severity = Column(Enum(ThreatSeverity), default=ThreatSeverity.HIGH, nullable=False)
    description = Column(String(500), nullable=True)         # Senior-friendly context
    language = Column(String(5), default="en", nullable=False)# 'en', 'hi', 'mr' or 'all'
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    
    # Versioning for efficient delta synchronisation to Android Room DB
    version = Column(Integer, default=1, nullable=False, index=True)

