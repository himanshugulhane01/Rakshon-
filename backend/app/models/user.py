from sqlalchemy import Column, Integer, String, Boolean, Enum
import enum
from app.core.database import Base
from app.models.base import TimestampMixin


class UserRole(str, enum.Enum):
    SENIOR = "SENIOR"
    CAREGIVER = "CAREGIVER"


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String(32), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    language = Column(String(5), default="en", nullable=False)  # 'en', 'hi', 'mr'
    role = Column(Enum(UserRole), default=UserRole.SENIOR, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

