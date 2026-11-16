import re
from typing import Optional
from app.schemas.analysis import IndicatorCategory
from app.services.rules.base import BaseRule, RuleMatch
from app.services.normalizer import NormalizedResult


class KycExpiryRule(BaseRule):
    """Detects fraudulent KYC expiry threats and update solicitations."""

    def __init__(self, weight: float = 75.0, enabled: bool = True):
        super().__init__(weight=weight, enabled=enabled)

        # Trilingual regex patterns for fake KYC expiry
        self.patterns = [
            # English
            r'\b(?:kyc|pan|aadhaar)\b.*?\b(?:expire[ds]?|suspend(?:ed)?|block(?:ed)?|inactive|deactivat(?:ed)?)\b',
            r'\b(?:update|verify|complete)\b.*?\b(?:your\s+)?(?:kyc|pan\s+card|aadhaar)\b.*?\b(?:immediately|urgently|today|within)\b',
            r'\b(?:link\s+your\s+pan|pan\s+card\s+link|kyc\s+mandatory)\b',
            
            # Hindi (Devanagari)
            r'(?:केवाईसी|के\.वाई\.सी|पैन|आधार).*?(?:समाप्त|अवरुद्ध|बंद|निष्क्रिय|ब्लॉक)',
            r'(?:तुरंत|आज ही).*?(?:केवाईसी|पैन|आधार).*?(?:अद्यतन|अपडेट|लिंक).*?(?:करें|कॉल)',
            
            # Marathi (Devanagari)
            r'(?:केवायसी|पॅन|आधार).*?(?:समाप्त|बंद|ब्लॉक|नूतनीकरण)',
            r'(?:तातडीने|लगेच).*?(?:केवायसी|पॅन).*?(?:करा|अपडेट|लिंक)',
            
            # Transliterated Hinglish / Maranglish
            r'\b(?:kyc|pan|aadhaar)\b.*?\b(?:band|khatam|block|inactive)\b.*?\b(?:hoga|hogi|honar|jayega)\b',
            r'\b(?:turant|tatkal|aaj\s+hi|lagich)\b.*?\b(?:kyc|pan)\b.*?\b(?:update|kare|kara|bheje)\b'
        ]
        self.regex = re.compile('|'.join(self.patterns), re.IGNORECASE)

    def evaluate(self, norm: NormalizedResult) -> Optional[RuleMatch]:
        if not self.enabled:
            return None

        match = self.regex.search(norm.clean_lower)
        if match:
            return RuleMatch(
                category=IndicatorCategory.KYC_FRAUD,
                indicator_name="FAKE_KYC_EXPIRY_OR_UPDATE",
                severity="HIGH",
                weight=self.weight,
                description="Threatens account suspension or block due to fake KYC or PAN expiry",
                evidence=match.group(0)
            )
        return None
