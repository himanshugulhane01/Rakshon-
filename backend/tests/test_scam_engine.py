from app.services.engine import ScamDetectionEngine
from app.schemas.analysis import RiskLevel, IndicatorCategory


def test_english_electricity_cutoff_scam():
    engine = ScamDetectionEngine()
    text = (
        "Dear consumer, your electricity power will be disconnected tonight at 9:30 PM from "
        "electricity office because your previous month bill was not updated. "
        "Please immediately contact our electricity officer at 9876543210."
    )
    res = engine.analyze(text)
    assert res.risk_level == RiskLevel.HIGH_RISK
    assert res.risk_score >= 70
    assert any(ind.category == IndicatorCategory.ELECTRICITY_CUTOFF for ind in res.detected_indicators)
    assert "1930" in " ".join(res.recommended_actions)
    assert "heuristic" in res.disclaimer.lower()


def test_english_digital_arrest_scam():
    engine = ScamDetectionEngine()
    text = (
        "You are placed under Digital Arrest by CBI Cyber Crime Branch. "
        "A customs parcel containing illegal narcotics and fake passports was seized in your name. "
        "Join Skype video call immediately for online court verification."
    )
    res = engine.analyze(text)
    assert res.risk_level == RiskLevel.HIGH_RISK
    assert res.risk_score >= 70
    assert any(ind.category == IndicatorCategory.DIGITAL_ARREST for ind in res.detected_indicators)


def test_english_kyc_phishing_scam():
    engine = ScamDetectionEngine()
    text = "Dear customer, your SBI account KYC has expired. Update immediately at https://sbi-kyc.top/verify or your account will be blocked within 24 hours."
    res = engine.analyze(text)
    assert res.risk_level == RiskLevel.HIGH_RISK
    categories = [ind.category for ind in res.detected_indicators]
    assert IndicatorCategory.KYC_FRAUD in categories
    assert IndicatorCategory.SUSPICIOUS_LINK in categories


def test_hindi_devanagari_electricity_scam():
    engine = ScamDetectionEngine()
    text = "प्रिय उपभोक्ता आपकी बिजली आज रात 9:30 बजे काट दी जाएगी क्योंकि पिछला बिल अपडेट नहीं हुआ है। तुरंत बिजली अधिकारी 9811223344 पर संपर्क करें।"
    res = engine.analyze(text)
    assert res.risk_level == RiskLevel.HIGH_RISK
    assert res.language == "hi"
    assert "चेतावनी" in res.explanation
    assert any("बिजली विभाग" in act for act in res.recommended_actions)


def test_hindi_devanagari_otp_demand_scam():
    engine = ScamDetectionEngine()
    text = "आपका खाता निलंबित होने से बचाने के लिए कृपया अपना ओटीपी तुरंत साझा करें।"
    res = engine.analyze(text)
    assert res.risk_level == RiskLevel.HIGH_RISK
    assert res.language == "hi"
    assert any(ind.category == IndicatorCategory.OTP_DEMAND for ind in res.detected_indicators)


def test_marathi_devanagari_mahavitaran_scam():
    engine = ScamDetectionEngine()
    text = "प्रिय ग्राहक, महावितरण वीज पुरवठा आज रात्री 9:30 वाजता खंडित केला जाईल कारण मागील बिल भरले नाही. त्वरित वीज अधिकारी 9876543210 वर संपर्क करा."
    res = engine.analyze(text)
    assert res.risk_level == RiskLevel.HIGH_RISK
    assert res.language == "mr"
    assert "धोका" in res.explanation
    assert any("महावितरण" in act for act in res.recommended_actions)


def test_marathi_devanagari_kyc_scam():
    engine = ScamDetectionEngine()
    text = "प्रिय ग्राहक, आपले बँक खाते केवायसी समाप्त झाले आहे. तातडीने केवायसी करा अन्यथा खाते बंद होईल."
    res = engine.analyze(text)
    assert res.risk_level == RiskLevel.HIGH_RISK
    assert res.language == "mr"


def test_hinglish_transliterated_scam():
    engine = ScamDetectionEngine()
    text = "Dear consumer your bijli connection will be kat tonight at 9.30 pm call electricity officer on 9876543210"
    res = engine.analyze(text)
    assert res.risk_level == RiskLevel.HIGH_RISK
    assert any(ind.category == IndicatorCategory.ELECTRICITY_CUTOFF for ind in res.detected_indicators)


def test_maranglish_transliterated_scam():
    engine = ScamDetectionEngine()
    text = "tumche bank khate kyc expire zale aahe tatkal kyc update kara nahi tar khate band honar"
    res = engine.analyze(text)
    assert res.risk_level == RiskLevel.HIGH_RISK


def test_legitimate_bank_otp_with_safety_warning_is_safe():
    """
    CRUCIAL: Verifies that legitimate bank OTP messages with standard
    'Do not share with anyone' warnings are NOT falsely flagged as scams.
    """
    engine = ScamDetectionEngine()
    text = (
        "492011 is your OTP for purchase of Rs 1,499.00 at AMAZON PAY. "
        "Do not share this OTP with anyone, including bank officials. SBI never calls for OTP."
    )
    res = engine.analyze(text)
    assert res.risk_level == RiskLevel.SAFE
    assert res.risk_score < 30
    assert "Safe" in res.explanation


def test_legitimate_bank_debit_alert_is_safe():
    engine = ScamDetectionEngine()
    text = (
        "Dear Customer, your A/C XX4321 is debited for Rs. 500.00 on 16-Nov-2026. "
        "Avl Bal Rs. 34,200.50. Ref: 89123491823. If not done by you, SMS BLOCK to 567676."
    )
    res = engine.analyze(text)
    assert res.risk_level == RiskLevel.SAFE
    assert res.risk_score < 30


def test_legitimate_utility_bill_reminder_is_safe():
    engine = ScamDetectionEngine()
    text = (
        "Dear Consumer, your electricity bill of Rs. 650 for consumer no 0281928192 is due on 25-Nov. "
        "Pay via official portal mahadiscom.in or authorized payment counters."
    )
    res = engine.analyze(text)
    assert res.risk_level == RiskLevel.SAFE
    assert res.risk_score < 30


def test_ordinary_family_conversational_message_is_safe():
    engine = ScamDetectionEngine()
    text = "Hello Dad, I reached the hotel in Pune. Did you take your afternoon medicine? Will call you at 8 PM."
    res = engine.analyze(text)
    assert res.risk_level == RiskLevel.SAFE
    assert res.risk_score == 0
    assert len(res.detected_indicators) == 0


def test_suspicious_borderline_message_is_caution():
    engine = ScamDetectionEngine()
    # Message with urgent link prompt but without explicit extortion or threats
    text = "Exclusive limited time offer for senior citizens. Click this link to check: https://bit.ly/senior-festive-offer"
    res = engine.analyze(text)
    assert res.risk_level == RiskLevel.CAUTION
    assert 30 <= res.risk_score < 70

