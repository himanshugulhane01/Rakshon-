from app.services.normalizer import MessageNormalizer
from app.services.rules import (
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
from app.schemas.analysis import IndicatorCategory


def test_kyc_rule_detection():
    rule = KycExpiryRule()
    norm = MessageNormalizer.normalize("Your SBI KYC has expired. Update immediately to prevent account suspension.")
    match = rule.evaluate(norm)
    assert match is not None
    assert match.category == IndicatorCategory.KYC_FRAUD
    assert match.severity == "HIGH"


def test_otp_demand_rule_triggers_on_malicious_demands():
    rule = OtpPinDemandRule()
    norm = MessageNormalizer.normalize("Please share your OTP with customer care executive to verify transaction.")
    match = rule.evaluate(norm)
    assert match is not None
    assert match.category == IndicatorCategory.OTP_DEMAND


def test_otp_demand_rule_does_not_trigger_on_mere_otp_mention():
    rule = OtpPinDemandRule()
    # A standard informational message stating an OTP number without demanding it to be shared
    norm = MessageNormalizer.normalize("Your OTP for registration is 492011.")
    match = rule.evaluate(norm)
    assert match is None, "An OTP mention alone must NEVER trigger malicious OTP demand"


def test_benign_transaction_rule_detects_safety_warning():
    rule = BenignTransactionRule()
    norm = MessageNormalizer.normalize("Your OTP is 891234. Do not share this OTP with anyone, including bank officials.")
    match = rule.evaluate(norm)
    assert match is not None
    assert match.category == IndicatorCategory.BENIGN_TRANSACTION
    assert match.weight < 0  # Negative weight to suppress false positives


def test_benign_transaction_rule_detects_bank_debit():
    rule = BenignTransactionRule()
    norm = MessageNormalizer.normalize("Rs 450 debited from A/c XX1234 on 16-Nov-2026. Avl Bal Rs 12,300. Ref 98127391823.")
    match = rule.evaluate(norm)
    assert match is not None
    assert match.category == IndicatorCategory.BENIGN_TRANSACTION


def test_upi_collect_rule_detection():
    rule = UpiCollectRule()
    norm = MessageNormalizer.normalize("You have received a cashback of Rs 2,000! Approve collect request in PhonePe to claim.")
    match = rule.evaluate(norm)
    assert match is not None
    assert match.category == IndicatorCategory.UPI_COLLECT


def test_apk_remote_access_rule_detection():
    rule = ApkRemoteAccessRule()
    norm1 = MessageNormalizer.normalize("Download sbi_reward_v2.apk to claim your bonus points.")
    assert rule.evaluate(norm1) is not None

    norm2 = MessageNormalizer.normalize("To fix your phone banking, install AnyDesk application immediately.")
    assert rule.evaluate(norm2) is not None


def test_electricity_cutoff_rule_detection():
    rule = ElectricityCutoffRule()
    norm = MessageNormalizer.normalize("Electricity will be disconnected tonight at 9:30 PM. Contact officer on 9811223344.")
    match = rule.evaluate(norm)
    assert match is not None
    assert match.category == IndicatorCategory.ELECTRICITY_CUTOFF


def test_digital_arrest_rule_detection():
    rule = DigitalArrestRule()
    norm = MessageNormalizer.normalize("You are under Digital Arrest by CBI. A courier parcel containing illegal narcotics was seized in your name.")
    match = rule.evaluate(norm)
    assert match is not None
    assert match.category == IndicatorCategory.DIGITAL_ARREST


def test_urgent_blocking_rule_detection():
    rule = UrgentBlockingRule()
    norm = MessageNormalizer.normalize("Your SIM card will be deactivated within 2 hours. Urgent action required to avoid penalty.")
    match = rule.evaluate(norm)
    assert match is not None
    assert match.category == IndicatorCategory.ACCOUNT_BLOCK


def test_suspicious_link_rule_detection():
    rule = SuspiciousLinkRule()
    norm_ip = MessageNormalizer.normalize("Login to verify at http://192.168.1.1/sbi")
    assert rule.evaluate(norm_ip) is not None

    norm_shortener = MessageNormalizer.normalize("Claim refund at https://bit.ly/sbi-refund-claim")
    assert rule.evaluate(norm_shortener) is not None

    norm_brand = MessageNormalizer.normalize("Verify at https://sbi-kyc.net/login")
    assert rule.evaluate(norm_brand) is not None

