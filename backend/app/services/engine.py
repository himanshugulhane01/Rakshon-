from typing import List, Dict, Any, Tuple
from app.core.config import settings
from app.schemas.analysis import (
    RiskLevel,
    IndicatorCategory,
    DetectedIndicator,
    MessageAnalysisResponse,
)
from app.services.normalizer import MessageNormalizer, NormalizedResult
from app.services.rules import (
    BaseRule,
    RuleMatch,
    KycExpiryRule,
    OtpPinDemandRule,
    BenignTransactionRule,
    UpiCollectRule,
    ApkRemoteAccessRule,
    ElectricityCutoffRule,
    DigitalArrestRule,
    UrgentBlockingRule,
    SuspiciousLinkRule,
)


class ScamDetectionEngine:
    """
    Modular, explainable rule-based scam detection engine.
    Does not rely on third-party cloud AI APIs; runs 100% locally and deterministically.
    """

    def __init__(self):
        # Register detection rules with calibrated weights
        self.rules: List[BaseRule] = [
            KycExpiryRule(weight=75.0),
            OtpPinDemandRule(weight=75.0),
            BenignTransactionRule(weight=-60.0),
            UpiCollectRule(weight=75.0),
            ApkRemoteAccessRule(weight=75.0),
            ElectricityCutoffRule(weight=75.0),
            DigitalArrestRule(weight=75.0),
            UrgentBlockingRule(weight=35.0),
            SuspiciousLinkRule(weight=35.0),
        ]

    def analyze(self, text: str, user_language: str = None) -> MessageAnalysisResponse:
        # 1. Normalize message text and detect language
        norm = MessageNormalizer.normalize(text, user_language=user_language)
        lang = norm.detected_language

        # 2. Evaluate all rules
        matches: List[RuleMatch] = []
        for rule in self.rules:
            match = rule.evaluate(norm)
            if match:
                matches.append(match)

        # 3. Calculate heuristic composite score
        scam_weight_total = 0.0
        benign_weight_total = 0.0
        detected_indicators: List[DetectedIndicator] = []

        for m in matches:
            if m.category == IndicatorCategory.BENIGN_TRANSACTION:
                benign_weight_total += abs(m.weight)
            else:
                scam_weight_total += m.weight
                detected_indicators.append(
                    DetectedIndicator(
                        category=m.category,
                        indicator_name=m.indicator_name,
                        severity=m.severity,
                        description=m.description,
                        evidence=m.evidence
                    )
                )

        # Net heuristic score bounded in [0, 100]
        net_score = max(0.0, scam_weight_total - benign_weight_total)
        final_score = int(min(100.0, net_score))

        # 4. Determine risk level based on configurable thresholds
        if final_score >= settings.SCORE_THRESHOLD_HIGH:
            risk_level = RiskLevel.HIGH_RISK
        elif final_score >= settings.SCORE_THRESHOLD_CAUTION:
            risk_level = RiskLevel.CAUTION
        else:
            risk_level = RiskLevel.SAFE

        # 5. Build senior-friendly explanation and recommendations
        explanation = self._build_explanation(risk_level, matches, lang)
        recommendations = self._build_recommendations(matches, risk_level, lang)

        return MessageAnalysisResponse(
            risk_level=risk_level,
            risk_score=final_score,
            detected_indicators=detected_indicators,
            explanation=explanation,
            recommended_actions=recommendations,
            language=lang
        )

    def _build_explanation(
        self,
        risk_level: RiskLevel,
        matches: List[RuleMatch],
        lang: str
    ) -> str:
        scam_matches = [m for m in matches if m.category != IndicatorCategory.BENIGN_TRANSACTION]
        has_benign = any(m.category == IndicatorCategory.BENIGN_TRANSACTION for m in matches)

        if lang == "hi":
            if risk_level == RiskLevel.HIGH_RISK:
                top_threats = ", ".join({m.description for m in scam_matches})
                return f"चेतावनी: यह संदेश गंभीर धोखाधड़ी का प्रयास प्रतीत होता है ({top_threats})। किसी भी लिंक पर क्लिक न करें और न ही दिए गए नंबर पर कॉल करें।"
            elif risk_level == RiskLevel.CAUTION:
                return "सावधानी: इस संदेश में संदिग्ध लिंक या तत्काल दबाव बनाने वाले शब्द पाए गए हैं। परिवार के सदस्य से पुष्टि करने के बाद ही आगे बढ़ें।"
            else:
                return "सुरक्षित: इस संदेश में कोई धोखाधड़ी या धमकी के संकेत नहीं मिले हैं। यह एक सामान्य या आधिकारिक संदेश प्रतीत होता है।"

        elif lang == "mr":
            if risk_level == RiskLevel.HIGH_RISK:
                top_threats = ", ".join({m.description for m in scam_matches})
                return f"धोका: हा संदेश फसवणुकीचा गंभीर प्रयत्न वाटतो ({top_threats})। कोणत्याही लिंकवर क्लिक करू नका आणि दिलेल्या नंबरवर कॉल करू नका."
            elif risk_level == RiskLevel.CAUTION:
                return "सावधान: या संदेशात संशयास्पद लिंक किंवा घाईगडबड करणारे शब्द आढळले आहेत. कुटुंबातील सदस्यांशी चर्चा करा."
            else:
                return "सुरक्षित: या संदेशात कोणताही फसवणुकीचा धोका आढळला नाही. हा एक सामान्य किंवा अधिकृत संदेश वाटतो."

        else:  # English default
            if risk_level == RiskLevel.HIGH_RISK:
                top_threats = "; ".join({m.description for m in scam_matches})
                return f"High Risk: This message shows strong indicators of digital fraud ({top_threats}). Do not click any links or call numbers provided in the message."
            elif risk_level == RiskLevel.CAUTION:
                return "Caution: This message contains unverified links or urgent pressure tactics. Verify with a trusted family member before taking any action."
            else:
                if has_benign:
                    return "Safe: Standard transactional notification with legitimate banking safety phrasing. No extortion or fraud patterns detected."
                return "Safe: No threat indicators or extortion cues detected. Appears to be an ordinary message."

    def _build_recommendations(
        self,
        matches: List[RuleMatch],
        risk_level: RiskLevel,
        lang: str
    ) -> List[str]:
        categories = {m.category for m in matches}
        actions: List[str] = []

        if lang == "hi":
            if IndicatorCategory.OTP_DEMAND in categories:
                actions.append("अपना ओटीपी या पिन किसी के साथ भी साझा न करें। बैंक कभी ओटीपी नहीं मांगता।")
            if IndicatorCategory.ELECTRICITY_CUTOFF in categories:
                actions.append("संदेश में दिए गए निजी मोबाइल नंबर पर कॉल न करें। बिजली विभाग ऐसे संदेश नहीं भेजता।")
            if IndicatorCategory.DIGITAL_ARREST in categories:
                actions.append("पुलिस या सीबीआई कभी व्हाट्सएप/स्काइप पर 'डिजिटल अरेस्ट' या जांच नहीं करती। फोन तुरंत काट दें।")
            if IndicatorCategory.APK_DOWNLOAD in categories:
                actions.append("कोई भी ऐप या स्क्रीन-शेयरिंग एप्लिकेशन (AnyDesk, TeamViewer) डाउनलोड न करें।")
            if IndicatorCategory.UPI_COLLECT in categories:
                actions.append("पैसे प्राप्त करने के लिए कभी यूपीआई पिन दर्ज नहीं करना पड़ता। पिन डालने से पैसे कटते हैं।")
            if IndicatorCategory.SUSPICIOUS_LINK in categories:
                actions.append("संदेश में दिए गए किसी भी लिंक पर क्लिक न करें।")
            if risk_level == RiskLevel.HIGH_RISK:
                actions.append("यदि किसी ने पैसे ठगे हैं, तो तुरंत साइबर हेल्पलाइन 1930 पर कॉल करें।")
            if not actions:
                actions.append("संदेश सुरक्षित प्रतीत होता है, कोई तत्काल कार्रवाई आवश्यक नहीं है।")

        elif lang == "mr":
            if IndicatorCategory.OTP_DEMAND in categories:
                actions.append("आपला ओटीपी किंवा पिन कोणालाही सांगू नका. बँक कधीही ओटीपी मागत नाही.")
            if IndicatorCategory.ELECTRICITY_CUTOFF in categories:
                actions.append("संदेशातील वैयक्तिक मोबाईल नंबरवर कॉल करू नका. महावितरण असे संदेश पाठवत नाही.")
            if IndicatorCategory.DIGITAL_ARREST in categories:
                actions.append("पोलीस किंवा सीबीआय कधीही व्हिडिओ कॉलवर अटक किंवा चौकशी करत नाहीत. फोन त्वरित ठेवा.")
            if IndicatorCategory.APK_DOWNLOAD in categories:
                actions.append("कोणतेही अॅप किंवा स्क्रीन-शेअरिंग अॅप्लिकेशन (AnyDesk) डाउनलोड करू नका.")
            if IndicatorCategory.UPI_COLLECT in categories:
                actions.append("पैसे मिळवण्यासाठी कधीही यूपीआय पिन टाकावा लागत नाही. पिन टाकल्यास पैसे वजा होतात.")
            if IndicatorCategory.SUSPICIOUS_LINK in categories:
                actions.append("संदेशातील कोणत्याही लिंकवर क्लिक करू नका.")
            if risk_level == RiskLevel.HIGH_RISK:
                actions.append("फसवणूक झाली असल्यास लगेच सायबर हेल्पलाइन 1930 वर संपर्क साधा.")
            if not actions:
                actions.append("संदेश सुरक्षित वाटतो, कोणतीही तातडीची कारवाई आवश्यक नाही.")

        else:  # English
            if IndicatorCategory.OTP_DEMAND in categories:
                actions.append("Never share your OTP, PIN, or banking password with anyone over call or SMS.")
            if IndicatorCategory.ELECTRICITY_CUTOFF in categories:
                actions.append("Do not call the mobile number in the message. Official electricity boards never cut power via SMS.")
            if IndicatorCategory.DIGITAL_ARREST in categories:
                actions.append("Law enforcement (Police/CBI) NEVER conducts arrests or trials over video calls. Hang up immediately.")
            if IndicatorCategory.APK_DOWNLOAD in categories:
                actions.append("Do not install unknown APK files or screen-sharing tools like AnyDesk or TeamViewer.")
            if IndicatorCategory.UPI_COLLECT in categories:
                actions.append("Remember: You NEVER need to enter a UPI PIN to receive money. Entering your PIN transfers money out.")
            if IndicatorCategory.SUSPICIOUS_LINK in categories:
                actions.append("Do not click unverified or shortened web links.")
            if risk_level == RiskLevel.HIGH_RISK:
                actions.append("If you suspect money has been stolen, immediately dial the National Cyber Helpline at 1930.")
            if not actions:
                actions.append("Message appears normal. No urgent action required.")

        return actions
