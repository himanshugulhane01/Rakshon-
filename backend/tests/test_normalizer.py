from app.services.normalizer import MessageNormalizer


def test_unicode_normalization_and_zero_width_strip():
    # Message injected with zero-width spaces (\u200b) and non-breaking spaces
    evasive_text = "D\u200bI\u200bG\u200bI\u200bT\u200bA\u200bL\u200b   A\u200bR\u200bR\u200bE\u200bS\u200bT"
    norm = MessageNormalizer.normalize(evasive_text)
    assert "digital arrest" in norm.clean_lower


def test_homoglyph_replacement():
    # Cyrillic 'а' (\u0430) and 'е' (\u0435) used to obfuscate 'update'
    obfuscated = "upd\u0430t\u0435 your kyc"
    norm = MessageNormalizer.normalize(obfuscated)
    assert norm.clean_lower == "update your kyc"


def test_whitespace_collapsing():
    messy = "Your    electricity    bill   is\n\npending\ttonight"
    norm = MessageNormalizer.normalize(messy)
    assert norm.clean_lower == "your electricity bill is pending tonight"


def test_url_extraction_before_strip():
    text = "Update KYC now at https://sbi-kyc.top/verify immediately"
    norm = MessageNormalizer.normalize(text)
    assert len(norm.extracted_links) == 1
    assert norm.extracted_links[0] == "https://sbi-kyc.top/verify"


def test_language_detection_hindi_devanagari():
    text = "प्रिय उपभोक्ता आपकी बिजली आज रात काट दी जाएगी तुरंत संपर्क करें"
    norm = MessageNormalizer.normalize(text)
    assert norm.detected_language == "hi"
    assert norm.is_transliterated is False


def test_language_detection_marathi_devanagari():
    text = "प्रिय ग्राहक, महावितरण वीज पुरवठा खंडित केला जाईल त्वरित संपर्क करा"
    norm = MessageNormalizer.normalize(text)
    assert norm.detected_language == "mr"
    assert norm.is_transliterated is False


def test_language_detection_hinglish_transliteration():
    text = "apna khata turant update kare bijli connection kat jayega"
    norm = MessageNormalizer.normalize(text)
    assert norm.detected_language == "hi"
    assert norm.is_transliterated is True


def test_language_detection_maranglish_transliteration():
    text = "tumche khate band honar vij purvatha khandit honar tatkal sampark kara"
    norm = MessageNormalizer.normalize(text)
    assert norm.detected_language == "mr"
    assert norm.is_transliterated is True


def test_language_detection_english():
    text = "Your electricity bill payment of Rs 500 is due on Monday"
    norm = MessageNormalizer.normalize(text)
    assert norm.detected_language == "en"
    assert norm.is_transliterated is False

