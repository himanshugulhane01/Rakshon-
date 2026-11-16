from pydantic import BaseModel, ConfigDict
from typing import List


class HealthResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    status: str
    app_name: str
    environment: str
    database: str
    supported_languages: List[str]
    version: str

