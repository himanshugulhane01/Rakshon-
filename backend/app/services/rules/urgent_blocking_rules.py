import re
from typing import Optional
from app.schemas.analysis import IndicatorCategory
from app.services.rules.base import BaseRule, RuleMatch
from app.services.normalizer import NormalizedResult


class UrgentBlockingRule(BaseRule):
    """
    Detects artificial urgency combined with threats of account blocking or service suspension.
    """

    def __init__(self, weight: float = 30.0, enabled: bool = True):
        super().__init__(weight=weight, enabled=enabled)

        self.patterns = [
            # English
            r'\b(?:account|sim\s+card|debit\s+card|net\s*banking)\b.*?\b(?:blocked|suspended|deactivated|frozen)\b.*?\b(?:within\s+\d{1,2}\s*(?:hours?|hrs?)|today|immediately|urgently)\b',
            r'\b(?:immediate\s+action\s+required|urgent\s+attention\s+required)\b.*?\b(?:to\s+avoid\s+penalty|to\s+avoid\s+block)\b',

            # Hindi (Devanagari)
            r'(?:खाता|सिम\s+कार्ड|डेबिट\s+कार्ड).*?(?:ब्लॉक|बंद|निलंबित).*?(?:तुरंत|\d{1,2}\s*घंटे|आज\s+ही)',
            r'(?:कार्रवाई\s+से\s+बचने\s+के\s+लिए).*?(?:तुरंत\s+कॉल\s+करें|संपर्क\s+करें)',

            # Marathi (Devanagari)
            r'(?:खाते|सिम\s+कार्ड).*?(?:बंद|ब्लॉक|स्थगित).*?(?:तातडीने|लगेच|\d{1,2}\s*तासात)',
            r'(?:कारवाई\s+टाळण्यासाठी).*?(?:संपर्क\s+साधा|कॉल\s+करा)',

            # Transliterations
            r'\b(?:khata|sim|card)\b.*?\b(?:band|block)\b.*?\b(?:hoga|honar|within\s+\d+|turant|tatkal)\b'
        ]
        self.regex = re.compile('|'.join(self.patterns), re.IGNORECASE)

    def evaluate(self, norm: NormalizedResult) -> Optional[RuleMatch]:
        if not self.enabled:
            return None

        match = self.regex.search(norm.clean_lower)
        if match:
            return RuleMatch(
                category=IndicatorCategory.ACCOUNT_BLOCK,
                indicator_name="URGENT_ACCOUNT_BLOCK_PRESSURE",
                severity="HIGH",
                weight=self.weight,
                description="Creates artificial urgency threatening immediate account or SIM deactivation",
                evidence=match.group(0)
            )
        return None

