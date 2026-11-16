import re
from typing import Optional
from app.schemas.analysis import IndicatorCategory
from app.services.rules.base import BaseRule, RuleMatch
from app.services.normalizer import NormalizedResult


class ApkRemoteAccessRule(BaseRule):
    """
    Detects APK download bait or instructions to install remote-desktop software
    (AnyDesk, TeamViewer, QuickSupport, RustDesk) frequently weaponized against seniors.
    """

    def __init__(self, weight: float = 75.0, enabled: bool = True):
        super().__init__(weight=weight, enabled=enabled)

        # APK or Remote Desktop patterns
        self.apk_patterns = [
            r'\b[a-zA-Z0-9_\-\.]+\.apk\b',
            r'\b(?:download|install)\b.*?\b(?:apk|support\s+app|customer\s+care\s+app|banking\s+app)\b',
            r'\b(?:anydesk|teamviewer|quicksupport|rustdesk|screen\s+share)\b',
            # Hindi / Marathi Devanagari
            r'(?:एपीके|एनीडेस्क|टीमव्यूअर|स्क्रीन\s+शेयर|रिमोट\s+ऐप).*?(?:डाउनलोड|इन्स्टॉल)',
            r'(?:इन्स्टॉल\s+करा|डाउनलोड\s+करा).*?(?:अॅप|अॅप्लिकेशन|एपीके)'
        ]
        self.regex = re.compile('|'.join(self.apk_patterns), re.IGNORECASE)

    def evaluate(self, norm: NormalizedResult) -> Optional[RuleMatch]:
        if not self.enabled:
            return None

        match = self.regex.search(norm.clean_lower)
        if match:
            return RuleMatch(
                category=IndicatorCategory.APK_DOWNLOAD,
                indicator_name="APK_OR_REMOTE_ACCESS_LURE",
                severity="HIGH",
                weight=self.weight,
                description="Prompts senior to install an unverified APK or screen-sharing remote application",
                evidence=match.group(0)
            )
        return None
