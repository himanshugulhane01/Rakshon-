import re
from typing import Optional
from app.schemas.analysis import IndicatorCategory
from app.services.rules.base import BaseRule, RuleMatch
from app.services.normalizer import NormalizedResult


class ElectricityCutoffRule(BaseRule):
    """
    Detects fake electricity bill disconnection scams threatening imminent power
    cutoff unless the senior calls a personal mobile number.
    """

    def __init__(self, weight: float = 75.0, enabled: bool = True):
        super().__init__(weight=weight, enabled=enabled)

        self.patterns = [
            # English
            r'\b(?:electricity|power\s+supply|power)\b.*?\b(?:disconnected|cut\s+off|cut\s+down)\b.*?\b(?:tonight|today|immediately|\d{1,2}(?::\d{2})?\s*(?:pm|am))\b',
            r'\b(?:contact|call)\b.*?\b(?:electricity\s+officer|power\s+office|officer)\b.*?\b(?:\+?91|0)?[6-9]\d{9}\b',

            # Hindi (Devanagari)
            r'(?:बिजली|विद्युत).*?(?:काट\s+दी\s+जाएगी|बंद\s+कर\s+दी\s+जाएगी|विच्छेद).*?(?:आज\s+रात|तुरंत|\d{1,2}(?::\d{2})?\s*बजे)',
            r'(?:बिजली\s+अधिकारी|विद्युत\s+कार्यालय).*?(?:कॉल\s+करें|संपर्क\s+करें)',

            # Marathi (Devanagari)
            r'(?:वीज\s+पुरवठा|महावितरण).*?(?:खंडित\s+केला\s+जाईल|बंद\s+होईल).*?(?:आज\s+रात्री|तातडीने|\d{1,2}(?::\d{2})?\s*वाजता)',
            r'(?:वीज\s+अधिकारी|कर्मचारी).*?(?:संपर्क\s+करा|कॉल\s+करा)',

            # Transliterations (Hinglish / Maranglish)
            r'\b(?:bijli|vij)\b.*?\b(?:kat\s+jayegi|band\s+hogi|khandit\s+honar)\b.*?\b(?:tonight|aaj\s+raat|9\s*pm|9:30)\b',
            r'\b(?:electricity\s+officer|bijli\s+adhikari)\b.*?\b(?:sampark|call|contact)\b'
        ]
        self.regex = re.compile('|'.join(self.patterns), re.IGNORECASE)

    def evaluate(self, norm: NormalizedResult) -> Optional[RuleMatch]:
        if not self.enabled:
            return None

        match = self.regex.search(norm.clean_lower)
        if match:
            return RuleMatch(
                category=IndicatorCategory.ELECTRICITY_CUTOFF,
                indicator_name="ELECTRICITY_DISCONNECTION_THREAT",
                severity="HIGH",
                weight=self.weight,
                description="Threatens imminent power cutoff unless recipient calls an unauthorized personal contact",
                evidence=match.group(0)
            )
        return None
