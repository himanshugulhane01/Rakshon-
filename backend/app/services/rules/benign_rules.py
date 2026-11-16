import re
from typing import Optional
from app.schemas.analysis import IndicatorCategory
from app.services.rules.base import BaseRule, RuleMatch
from app.services.normalizer import NormalizedResult


class BenignTransactionRule(BaseRule):
    """
    Identifies legitimate transactional and informational messages:
    - Standard bank OTP delivery with safety warning ('Do not share with anyone')
    - Legitimate payment debit/credit alerts with balance & reference numbers
    - Official utility bill due-date reminders
    Applies negative weights to suppress scam false-positives.
    """

    def __init__(self, weight: float = -60.0, enabled: bool = True):
        super().__init__(weight=weight, enabled=enabled)

        # Standard safety warnings in legitimate bank OTPs
        self.safety_warning_patterns = [
            # English
            r'\b(?:do\s+not|never)\s+share\b.*?\b(?:this\s+)?(?:otp|password|pin|code)\b',
            r'\b(?:bank\s+never\s+asks\s+for|neither\s+bank\s+nor\s+anyone)\b',
            r'\b(?:if\s+not\s+requested\s+by\s+you|if\s+not\s+done\s+by\s+you)\b.*?\b(?:sms\s+block|call\s+1800|report)\b',

            # Hindi (Devanagari)
            r'(?:किसी\s+के\s+साथ|बैंक\s+अधिकारी\s+के\s+साथ).*?(?:साझा\s+न\s+करें|शेयर\s+न\s+करें)',
            r'(?:यदि\s+यह\s+आपके\s+द्वारा\s+नहीं\s+किया\s+गया).*?(?:ब्लॉक\s+करें|कॉल\s+करें)',

            # Marathi (Devanagari)
            r'(?:कोणाशीही|कोणालाही).*?(?:शेअर\s+करू\s+नका|सांगू\s+नका)',
            r'(?:आपण\s+हा\s+व्यवहार\s+केला\s+नसल्यास).*?(?:ब्लॉक\s+करा|तक्रार\s+करा)',

            # Transliterations
            r'\b(?:kisi\s+ke\s+sath|konala\s+hi)\b.*?\b(?:share\s+na\s+kare|sangu\s+naka)\b'
        ]
        self.safety_regex = re.compile('|'.join(self.safety_warning_patterns), re.IGNORECASE)

        # Legitimate bank transactional syntax: e.g. "debited by Rs 500", "credited with Rs 1,000", "Avl Bal Rs"
        self.transaction_patterns = [
            r'\b(?:debited|credited)\s+(?:by|with|for)\s+(?:rs\.?|inr)\s*[\d,]+',
            r'\bavl\s+bal(?:ance)?\s*[:\-]?\s*(?:rs\.?|inr)?\s*[\d,]+',
            r'\bref\s*(?:no\.?|id)?\s*[:\-]?\s*\d{6,}',
            r'\bconsumer\s*(?:no\.?|number)?\s*[:\-]?\s*\d{6,}.*?\bdue\s+date\b'
        ]
        self.transaction_regex = re.compile('|'.join(self.transaction_patterns), re.IGNORECASE)

    def evaluate(self, norm: NormalizedResult) -> Optional[RuleMatch]:
        if not self.enabled:
            return None

        has_safety_warning = bool(self.safety_regex.search(norm.clean_lower))
        has_transaction_syntax = bool(self.transaction_regex.search(norm.clean_lower))

        if has_safety_warning or has_transaction_syntax:
            evidence_parts = []
            if has_safety_warning:
                evidence_parts.append("Legitimate safety warning ('Do not share OTP')")
            if has_transaction_syntax:
                evidence_parts.append("Standard bank transactional syntax")

            return RuleMatch(
                category=IndicatorCategory.BENIGN_TRANSACTION,
                indicator_name="LEGITIMATE_BANKING_OR_TRANSACTION_PATTERN",
                severity="BENIGN",
                weight=self.weight,
                description="Contains verifiable hallmarks of a legitimate financial institution or utility alert",
                evidence="; ".join(evidence_parts)
            )
        return None

