import re
from typing import Optional
from app.schemas.analysis import IndicatorCategory
from app.services.rules.base import BaseRule, RuleMatch
from app.services.normalizer import NormalizedResult


class SuspiciousLinkRule(BaseRule):
    """
    Detects deceptive and obfuscated links: URL shorteners, raw IP addresses,
    and phishing brand typosquatting.
    """

    def __init__(self, weight: float = 30.0, enabled: bool = True):
        super().__init__(weight=weight, enabled=enabled)

        # URL shorteners commonly used to disguise malicious destinations in SMS
        self.shortener_domains = {
            'bit.ly', 'tinyurl.com', 'is.gd', 'cutt.ly', 't.co', 'rb.gy',
            'shorturl.at', 'ow.ly', 'buff.ly', 'rebrand.ly'
        }

        # Abused TLDs frequently encountered in Indian SMS phishing
        self.abused_tlds = ('.top', '.xyz', '.click', '.buzz', '.club', '.work', '.icu', '.site')

        # Raw IP address in URL pattern
        self.raw_ip_regex = re.compile(
            r'https?://(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?(?:/[^\s]*)?',
            re.IGNORECASE
        )

        # Fake bank domain patterns
        self.phishing_brand_regex = re.compile(
            r'(?:sbi|hdfc|icici|axis|pnb|paytm|bhim|aadhaar|gov|post|electricity)[_\-](?:kyc|update|login|reward|verify|support|portal|online)',
            re.IGNORECASE
        )

    def evaluate(self, norm: NormalizedResult) -> Optional[RuleMatch]:
        if not self.enabled:
            return None

        # Check extracted URLs
        for link in norm.extracted_links:
            clean_link = link.lower()

            # 1. Check raw IP host
            if self.raw_ip_regex.search(clean_link):
                return RuleMatch(
                    category=IndicatorCategory.SUSPICIOUS_LINK,
                    indicator_name="RAW_IP_ADDRESS_LINK",
                    severity="HIGH",
                    weight=self.weight,
                    description="Link points to a numeric IP address rather than a verified organization domain",
                    evidence=link
                )

            # 2. Check URL shorteners
            for shortener in self.shortener_domains:
                if shortener in clean_link:
                    return RuleMatch(
                        category=IndicatorCategory.SUSPICIOUS_LINK,
                        indicator_name="OBFUSCATED_SHORT_URL",
                        severity="MEDIUM",
                        weight=35.0,
                        description="Uses a URL shortener to conceal the true web destination",
                        evidence=link
                    )

            # 3. Check phishing brand patterns
            if self.phishing_brand_regex.search(clean_link):
                return RuleMatch(
                    category=IndicatorCategory.SUSPICIOUS_LINK,
                    indicator_name="BRAND_IMPERSONATION_URL",
                    severity="HIGH",
                    weight=75.0,
                    description="Domain attempts to mimic a trusted bank or government brand name",
                    evidence=link
                )

            # 4. Check high-risk TLDs
            for tld in self.abused_tlds:
                if tld in clean_link:
                    return RuleMatch(
                        category=IndicatorCategory.SUSPICIOUS_LINK,
                        indicator_name="HIGH_RISK_TLD_URL",
                        severity="MEDIUM",
                        weight=self.weight - 10.0,
                        description=f"Domain uses high-abuse extension ({tld})",
                        evidence=link
                    )

        # Check in-text link invitations (e.g. "click link to update")
        if re.search(r'\b(?:click\s+(?:here|this\s+link)|tap\s+(?:here|link)|लिंक\s+पर\s+क्लिक\s+करें|खालील\s+लिंकवर\s+क्लिक\s+करा)\b', norm.clean_lower):
            if norm.extracted_links:
                return RuleMatch(
                    category=IndicatorCategory.SUSPICIOUS_LINK,
                    indicator_name="URGENT_LINK_CLICK_PROMPT",
                    severity="MEDIUM",
                    weight=15.0,
                    description="Message prompts senior to immediately click an external link",
                    evidence="Link click invitation detected"
                )

        return None
