import re
from typing import Optional
from app.schemas.analysis import IndicatorCategory
from app.services.rules.base import BaseRule, RuleMatch
from app.services.normalizer import NormalizedResult


class OtpPinDemandRule(BaseRule):
    """
    Detects demands to share, send, or disclose an OTP or PIN.
    Crucial: An OTP mention alone NEVER triggers this rule!
    """

    def __init__(self, weight: float = 75.0, enabled: bool = True):
        super().__init__(weight=weight, enabled=enabled)

        # Solicitation / Demanding patterns in English, Hindi, Marathi, and Transliterations
        self.patterns = [
            # English: Share/send/forward/tell your OTP or enter PIN to receive
            r'\b(?:share|send|forward|tell|provide|submit|give)\b.*?\b(?:your\s+)?(?:otp|one\s+time\s+password|pin|upi\s+pin|password)\b',
            r'\b(?:enter|provide)\b.*?\b(?:upi\s+)?pin\b.*?\b(?:to\s+receive|to\s+claim|to\s+get|for\s+credit)\b',
            r'\b(?:share\s+otp\s+to\s+avoid|send\s+otp\s+for\s+verification)\b',

            # Hindi (Devanagari): अपना ओटीपी बताएं / भेजें / साझा करें
            r'(?:ओटीपी|ओ\.टी\.पी|पिन).*?(?:साझा\s+करें|शेयर\s+करें|भेजें|बताएं|दीजिए)',
            r'(?:पैसे\s+प्राप्त\s+करने\s+के\s+लिए|रिफंड\s+के\s+लिए).*?(?:पिन|ओटीपी).*?(?:दर्ज\s+करें|डालें)',

            # Marathi (Devanagari): ओटीपी सांगा / पाठवा / द्या
            r'(?:ओटीपी|पिन).*?(?:सांगा|पाठवा|द्या|शेअर\s+करा)',
            r'(?:पैसे\s+मिळवण्यासाठी).*?(?:पिन|ओटीपी).*?(?:टाका|नोंदवा)',

            # Hinglish / Maranglish Transliterations
            r'\b(?:apna|tumcha)\b.*?\b(?:otp|pin)\b.*?\b(?:share|bhejo|bheje|sanga|pathva|dya|batao)\b',
            r'\b(?:otp|pin)\b.*?\b(?:share\s+kare|bhejiye|bataye|pathvave|dakhil\s+kare)\b',
            r'\b(?:paise\s+lene\s+ke\s+liye|credit\s+ke\s+liye)\b.*?\b(?:pin\s+dale|pin\s+enter\s+kare)\b'
        ]
        self.regex = re.compile('|'.join(self.patterns), re.IGNORECASE)

    def evaluate(self, norm: NormalizedResult) -> Optional[RuleMatch]:
        if not self.enabled:
            return None

        # Exclude legitimate warning phrases like "Do not share", "Never share", "Kisi ke sath share na kare"
        warning_exclusions = [
            r'\b(?:do\s+not|never|don\'t|neither\s+bank\s+nor\s+anyone)\s+(?:share|send|tell|give|forward)\b',
            r'(?:किसी\s+के\s+साथ|कोणाशीही).*?(?:साझा\s+न\s+करें|शेयर\s+न\s+करें|सांगू\s+नका)',
            r'\b(?:kisi\s+ke\s+sath|konala\s+hi)\b.*?\b(?:share\s+na\s+kare|sangu\s+naka)\b'
        ]
        is_legitimate_warning = any(re.search(p, norm.clean_lower) for p in warning_exclusions)

        match = self.regex.search(norm.clean_lower)
        if match:
            # If the only match was part of a legitimate "Do not share" warning, do not flag as malicious demand
            if is_legitimate_warning and re.search(r'\b(?:do\s+not|never|don\'t)\s+share\b', norm.clean_lower):
                # Verify there isn't ALSO an independent malicious prompt
                if not re.search(r'\b(?:call\s+customer\s+care\s+to\s+tell|send\s+otp\s+to\s+avoid)\b', norm.clean_lower):
                    return None

            return RuleMatch(
                category=IndicatorCategory.OTP_DEMAND,
                indicator_name="MALICIOUS_OTP_OR_PIN_SOLICITATION",
                severity="HIGH",
                weight=self.weight,
                description="Demands the recipient share or disclose their private OTP or UPI PIN",
                evidence=match.group(0)
            )
        return None
