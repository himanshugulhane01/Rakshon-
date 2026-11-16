import re
from typing import Optional
from app.schemas.analysis import IndicatorCategory
from app.services.rules.base import BaseRule, RuleMatch
from app.services.normalizer import NormalizedResult


class UpiCollectRule(BaseRule):
    """
    Detects UPI collect requests and fake payment lures claiming the user
    must approve a transaction or enter a PIN to receive money.
    """

    def __init__(self, weight: float = 75.0, enabled: bool = True):
        super().__init__(weight=weight, enabled=enabled)

        self.patterns = [
            # English: Collect request, approve to receive, lottery/cashback reward
            r'\b(?:collect\s+request|payment\s+request)\b.*?\b(?:approve|accept|pay|receive)\b',
            r'\b(?:cashback|reward|lottery|prize|refund)\b.*?\b(?:of\s+rs\.?|won|waiting|claim)\b.*?\b(?:gpay|phonepe|paytm|upi)\b',
            r'\b(?:enter\s+pin\s+to\s+receive|approve\s+to\s+get\s+credit)\b',

            # Hindi (Devanagari)
            r'(?:इनाम|रिफंड|लॉटरी|कैशबैक).*?(?:प्राप्त\s+करें|क्लेम\s+करें).*?(?:गूगल\s+पे|फोनपे|पेटीएम|यूपीआई)',
            r'(?:पैसे\s+पाने\s+के\s+लिए).*?(?:रिक्वेस्ट\s+स्वीकार\s+करें|पिन\s+दर्ज\s+करें)',

            # Marathi (Devanagari)
            r'(?:बक्षीस|कॅशबॅक|रिफंड).*?(?:स्वीकारा|मिळवण्यासाठी).*?(?:फोनपे|गुगल\s+पे|यूपीआय)',
            r'(?:पैसे\s+जमा\s+होण्यासाठी).*?(?:पिन\s+टाका|रिक्वेस्ट\s+अॅप्रूव्ह\s+करा)',

            # Transliterations
            r'\b(?:inam|cashback|refund|lottery)\b.*?\b(?:paane\s+ke\s+liye|milnyasathi)\b.*?\b(?:pin\s+enter|approve)\b'
        ]
        self.regex = re.compile('|'.join(self.patterns), re.IGNORECASE)

    def evaluate(self, norm: NormalizedResult) -> Optional[RuleMatch]:
        if not self.enabled:
            return None

        match = self.regex.search(norm.clean_lower)
        if match:
            return RuleMatch(
                category=IndicatorCategory.UPI_COLLECT,
                indicator_name="UPI_COLLECT_OR_REWARD_LURE",
                severity="HIGH",
                weight=self.weight,
                description="Lures recipient to approve a UPI collect request or enter a PIN to receive money",
                evidence=match.group(0)
            )
        return None
