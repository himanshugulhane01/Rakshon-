from abc import ABC, abstractmethod
from typing import Optional
from dataclasses import dataclass
from app.schemas.analysis import IndicatorCategory
from app.services.normalizer import NormalizedResult


@dataclass
class RuleMatch:
    category: IndicatorCategory
    indicator_name: str
    severity: str  # "HIGH", "MEDIUM", "LOW", "BENIGN"
    weight: float   # Heuristic contribution (negative for benign suppressors)
    description: str
    evidence: str


class BaseRule(ABC):
    def __init__(self, weight: float = 25.0, enabled: bool = True):
        self.weight = weight
        self.enabled = enabled

    @abstractmethod
    def evaluate(self, norm: NormalizedResult) -> Optional[RuleMatch]:
        """Evaluates normalized message text and returns RuleMatch if rule triggers."""
        pass

