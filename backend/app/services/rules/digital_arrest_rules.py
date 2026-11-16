import re
from typing import Optional
from app.schemas.analysis import IndicatorCategory
from app.services.rules.base import BaseRule, RuleMatch
from app.services.normalizer import NormalizedResult


class DigitalArrestRule(BaseRule):
    """
    Detects 'Digital Arrest' extortion and fake law enforcement impersonation
    (CBI, Police, Customs, Narcotics, TRAI, Supreme Court).
    """

    def __init__(self, weight: float = 75.0, enabled: bool = True):
        super().__init__(weight=weight, enabled=enabled)

        self.patterns = [
            # English: Digital arrest, police/CBI impersonation, customs parcel seized
            r'\b(?:digital\s+arrest|cbi\s+officer|cyber\s+crime\s+branch|crime\s+branch|customs\s+department)\b',
            r'\b(?:parcel|courier|consignment)\b.*?\b(?:seized|confiscated|intercepted)\b.*?\b(?:drugs|narcotics|passports|contraband|illegal)\b',
            r'\b(?:arrest\s+warrant|non[- ]bailable\s+warrant|money\s+laundering\s+case|fir\s+registered)\b.*?\b(?:against\s+you|issued)\b',
            r'\b(?:join|appear|connect)\b.*?\b(?:video\s+call|skype|online\s+investigation|digital\s+hearing)\b',

            # Hindi (Devanagari)
            r'(?:डिजिटल\s+अरेस्ट|सीबीआई|क्राइम\s+ब्रांच|नारकोटिक्स|कस्टम\s+विभाग)',
            r'(?:पार्सल|कूरियर).*?(?:ड्रग्स|नशीली\s+दवाएं|जब्त|अवैध)',
            r'(?:गिरफ्तारी\s+वारंट|एफआईआर|मनी\s+लॉन्ड्रिंग).*?(?:दर्ज|जारी)',

            # Marathi (Devanagari)
            r'(?:डिजिटल\s+अटक|पोलीस\s+कारवाई|गुन्हे\s+शाखा|कस्टम्स)',
            r'(?:पार्सल).*?(?:अवैध|जप्त|अंमली\s+पदार्थ)',
            r'(?:अटक\s+वारंट|गुन्हा\s+दाखल).*?(?:केला\s+आहे)',

            # Transliterations (Hinglish / Maranglish)
            r'\b(?:digital\s+arrest|police\s+case|cbi\s+inquiry|fir\s+darj|arrest\s+warrant)\b'
        ]
        self.regex = re.compile('|'.join(self.patterns), re.IGNORECASE)

    def evaluate(self, norm: NormalizedResult) -> Optional[RuleMatch]:
        if not self.enabled:
            return None

        match = self.regex.search(norm.clean_lower)
        if match:
            return RuleMatch(
                category=IndicatorCategory.DIGITAL_ARREST,
                indicator_name="DIGITAL_ARREST_OR_POLICE_IMPERSONATION",
                severity="HIGH",
                weight=self.weight,
                description="Extortion tactic impersonating police or CBI claiming 'Digital Arrest' or contraband parcels",
                evidence=match.group(0)
            )
        return None
