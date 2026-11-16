from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime


class ThreatItemSync(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    indicator_type: str
    value: str
    severity: str
    description: Optional[str] = None
    language: str
    is_active: bool
    version: int


class ThreatSyncResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    latest_version: int
    count: int
    threats: List[ThreatItemSync]

