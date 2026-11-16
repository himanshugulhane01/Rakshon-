from sqlalchemy import Column, Integer, String, Boolean, Enum, ForeignKey, DateTime
import enum
from datetime import datetime, timezone
from app.core.database import Base
from app.models.base import TimestampMixin


class EmergencyEventType(str, enum.Enum):
    MANUAL_PANIC = "MANUAL_PANIC"
    CYBER_HELPLINE_ASSIST = "CYBER_HELPLINE_ASSIST"
    BANK_FREEZE_GUIDANCE = "BANK_FREEZE_GUIDANCE"


class EmergencyEventStatus(str, enum.Enum):
    INITIATED = "INITIATED"
    RESOLVED = "RESOLVED"
    CANCELLED = "CANCELLED"


class EmergencyEvent(Base, TimestampMixin):
    __tablename__ = "emergency_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    event_type = Column(Enum(EmergencyEventType), default=EmergencyEventType.MANUAL_PANIC, nullable=False)
    status = Column(Enum(EmergencyEventStatus), default=EmergencyEventStatus.INITIATED, nullable=False)
    
    # Tracking helpful assistance without taking unconfirmed silent actions
    helpline_dialed = Column(Boolean, default=False, nullable=False)
    bank_name_guided = Column(String(100), nullable=True)
    message_user_reviewed = Column(Boolean, default=False, nullable=False)
    
    resolved_at = Column(DateTime(timezone=True), nullable=True)

