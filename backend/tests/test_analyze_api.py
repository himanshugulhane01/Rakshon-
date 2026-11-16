from app.models.scam_indicator import ScamIndicator, IndicatorType, ThreatSeverity
from app.schemas.analysis import RiskLevel, CallReputationStatus


def test_analyze_message_api_scam_payload(client):
    payload = {
        "text": "Your electricity bill was not paid. Power will be disconnected tonight at 9:30 PM. Call officer at 9876543210 immediately."
    }
    response = client.post("/api/v1/analyze/message", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["risk_level"] == RiskLevel.HIGH_RISK
    assert data["risk_score"] >= 70
    assert len(data["detected_indicators"]) > 0
    assert "heuristic" in data["disclaimer"].lower()


def test_analyze_message_api_legitimate_otp_payload(client):
    payload = {
        "text": "Your OTP for login is 382910. Do not share this OTP with anyone, including bank employees."
    }
    response = client.post("/api/v1/analyze/message", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["risk_level"] == RiskLevel.SAFE
    assert data["risk_score"] < 30


def test_analyze_message_api_validation_empty_text(client):
    response = client.post("/api/v1/analyze/message", json={"text": ""})
    assert response.status_code == 422  # Validation error (min_length=1)


def test_analyze_message_api_validation_oversized_text(client):
    # Generates a message exceeding 2000 characters
    oversized = "A" * 2005
    response = client.post("/api/v1/analyze/message", json={"text": oversized})
    assert response.status_code == 422  # Validation error (max_length=2000)


def test_analyze_call_api_verified_threat(client, db_session):
    # Seed threat number
    threat = ScamIndicator(
        indicator_type=IndicatorType.PHONE_NUMBER,
        value="+919876543210",
        severity=ThreatSeverity.HIGH,
        description="Electricity bill cutoff extortion caller",
        language="en",
        is_active=True,
        version=10
    )
    db_session.add(threat)
    db_session.commit()

    response = client.post("/api/v1/analyze/call", json={"phone_number": "+91 98765-43210"})
    assert response.status_code == 200
    data = response.json()
    assert data["reputation"] == CallReputationStatus.VERIFIED_THREAT
    assert data["risk_level"] == RiskLevel.HIGH_RISK
    assert data["phone_number_masked"] == "+91****10"


def test_analyze_call_api_suspicious_prefix(client, db_session):
    # Seed prefix
    threat_prefix = ScamIndicator(
        indicator_type=IndicatorType.PHONE_PREFIX,
        value="+92",
        severity=ThreatSeverity.HIGH,
        description="Spoofed international calling prefix",
        language="all",
        is_active=True,
        version=11
    )
    db_session.add(threat_prefix)
    db_session.commit()

    response = client.post("/api/v1/analyze/call", json={"phone_number": "+923001234567"})
    assert response.status_code == 200
    data = response.json()
    assert data["reputation"] == CallReputationStatus.SUSPICIOUS_PREFIX
    assert data["risk_level"] == RiskLevel.CAUTION


def test_analyze_call_api_unknown_number_is_safe_by_default(client):
    # Unlisted number
    response = client.post("/api/v1/analyze/call", json={"phone_number": "+919811122233"})
    assert response.status_code == 200
    data = response.json()
    assert data["reputation"] == CallReputationStatus.UNKNOWN_CALLER
    assert data["risk_level"] == RiskLevel.SAFE
    assert "not listed" in data["details"].lower()


def test_analyze_call_api_invalid_format(client):
    response = client.post("/api/v1/analyze/call", json={"phone_number": "not-a-number"})
    assert response.status_code == 422

