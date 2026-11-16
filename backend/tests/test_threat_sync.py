from app.models.scam_indicator import ScamIndicator, IndicatorType, ThreatSeverity


def test_sync_threats_empty(client):
    response = client.get("/api/v1/sync/threats?since_version=0")
    assert response.status_code == 200
    data = response.json()
    assert data["latest_version"] == 0
    assert data["count"] == 0
    assert data["threats"] == []


def test_sync_threats_with_delta_versioning(client, db_session):
    # Seed sample threats simulating extortion prefixes and known fraud numbers
    threat1 = ScamIndicator(
        indicator_type=IndicatorType.PHONE_PREFIX,
        value="+92",
        severity=ThreatSeverity.HIGH,
        description="High risk international spoofing prefix",
        language="all",
        is_active=True,
        version=1
    )
    threat2 = ScamIndicator(
        indicator_type=IndicatorType.PHONE_NUMBER,
        value="+919876543210",
        severity=ThreatSeverity.HIGH,
        description="Reported electricity bill cutoff impersonation scammer",
        language="en",
        is_active=True,
        version=2
    )
    threat3 = ScamIndicator(
        indicator_type=IndicatorType.UPI_HANDLE,
        value="fraudster@fakebank",
        severity=ThreatSeverity.HIGH,
        description="Reported phishing collect-request VPA",
        language="en",
        is_active=True,
        version=3
    )
    db_session.add_all([threat1, threat2, threat3])
    db_session.commit()

    # Client sync with since_version=0 (initial sync)
    response_all = client.get("/api/v1/sync/threats?since_version=0")
    assert response_all.status_code == 200
    data_all = response_all.json()
    assert data_all["latest_version"] == 3
    assert data_all["count"] == 3
    assert len(data_all["threats"]) == 3

    # Client sync with since_version=1 (incremental sync)
    response_delta = client.get("/api/v1/sync/threats?since_version=1")
    assert response_delta.status_code == 200
    data_delta = response_delta.json()
    assert data_delta["count"] == 2
    returned_values = [t["value"] for t in data_delta["threats"]]
    assert "+919876543210" in returned_values
    assert "fraudster@fakebank" in returned_values
    assert "+92" not in returned_values

