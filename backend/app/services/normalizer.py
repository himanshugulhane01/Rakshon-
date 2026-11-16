import re
import unicodedata
from typing import List, Tuple
from dataclasses import dataclass


# Homoglyph translation mapping (common Cyrillic & Greek lookalikes mapped to Latin)
HOMOGLYPH_MAP = {
    'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c', 'у': 'y', 'х': 'x',
    'і': 'i', 'ј': 'j', 'ѕ': 's', 'ԁ': 'd', 'ԛ': 'q', 'ԝ': 'w',
    'А': 'A', 'В': 'B', 'Е': 'E', 'К': 'K', 'М': 'M', 'Н': 'H', 'О': 'O',
    'Р': 'P', 'С': 'C', 'Т': 'T', 'Х': 'X', 'Ү': 'Y',
}

# Common Marathi-specific lexical markers (Devanagari)
MARATHI_DEVANAGARI_MARKERS = {
    'आहे', 'करा', 'करावे', 'होणार', 'नाही', 'खाते', 'कृपया', 'झाले', 'होईल',
    'कडून', 'पैसे', 'संदेश', 'तातडीने', 'बंद', 'महावितरण', 'ग्राहक', 'क्रमांक'
}

# Common Hindi-specific lexical markers (Devanagari)
HINDI_DEVANAGARI_MARKERS = {
    'है', 'करें', 'होगा', 'नहीं', 'खाता', 'कृपया', 'गया', 'तुरंत', 'संपर्क',
    'बिजली', 'कटेगी', 'पैसे', 'भेजें', 'अवरुद्ध', 'समाप्त', 'अद्यतन'
}

# Romanized Hindi (Hinglish) transliteration markers
HINGLISH_MARKERS = {
    'apna', 'khata', 'turant', 'bijli', 'kat', 'jayegi', 'sampark', 'kare',
    'kijiye', 'band', 'ho', 'bheje', 'paisa', 'paise', 'inam', 'lottery',
    'adhikari', 'suchit', 'gaya', 'raha', 'sambandhit', 'aavedan'
}

# Romanized Marathi (Maranglish) transliteration markers
MARANGLISH_MARKERS = {
    'tumche', 'khate', 'band', 'honar', 'vij', 'purvatha', 'khandit',
    'tori', 'samparka', 'kara', 'karave', 'pese', 'gela', 'aahe', 'nahit',
    'mahavitaran', 'grahak', 'kramank', 'tatkal'
}


@dataclass
class NormalizedResult:
    raw_text: str
    clean_text: str
    clean_lower: str
    detected_language: str  # 'en', 'hi', 'mr'
    is_transliterated: bool
    extracted_links: List[str]


class MessageNormalizer:
    URL_PATTERN = re.compile(
        r'(?:https?://|www\.)[^\s/$.?#].[^\s]*',
        re.IGNORECASE
    )

    @classmethod
    def normalize(cls, text: str, user_language: str = None) -> NormalizedResult:
        if not text:
            return NormalizedResult(
                raw_text="",
                clean_text="",
                clean_lower="",
                detected_language="en",
                is_transliterated=False,
                extracted_links=[]
            )

        raw_text = text

        # 1. Extract URLs before strip/normalization
        links = cls.URL_PATTERN.findall(raw_text)

        # 2. Unicode NFKC Normalization
        normalized = unicodedata.normalize('NFKC', text)

        # 3. Strip zero-width & invisible characters
        zero_width_chars = ['\u200b', '\u200c', '\u200d', '\u200e', '\u200f', '\ufeff']
        for zw in zero_width_chars:
            normalized = normalized.replace(zw, '')

        # 4. Homoglyph normalization (e.g. Cyrillic lookalikes)
        cleaned_chars = []
        for ch in normalized:
            cleaned_chars.append(HOMOGLYPH_MAP.get(ch, ch))
        normalized = "".join(cleaned_chars)

        # 5. Collapse excessive whitespace
        cleaned = re.sub(r'\s+', ' ', normalized).strip()
        cleaned_lower = cleaned.lower()

        # 6. Language & Script Detection
        detected_lang, is_transliterated = cls._detect_language_and_script(
            cleaned,
            cleaned_lower,
            user_language
        )

        return NormalizedResult(
            raw_text=raw_text,
            clean_text=cleaned,
            clean_lower=cleaned_lower,
            detected_language=detected_lang,
            is_transliterated=is_transliterated,
            extracted_links=links
        )

    @classmethod
    def _detect_language_and_script(
        cls,
        text: str,
        text_lower: str,
        user_language: str = None
    ) -> Tuple[str, bool]:
        if user_language and user_language in ["en", "hi", "mr"]:
            # User explicitly chose preferred language
            has_devanagari = bool(re.search(r'[\u0900-\u097F]', text))
            return user_language, not has_devanagari

        # Detect Devanagari characters
        devanagari_count = len(re.findall(r'[\u0900-\u097F]', text))
        total_letters = len(re.findall(r'[a-zA-Z\u0900-\u097F]', text))

        if total_letters > 0 and (devanagari_count / total_letters) > 0.25:
            # Native Devanagari script present: clean words by regex to eliminate punctuation
            words = set(re.findall(r'[\u0900-\u097F]+', text))
            marathi_overlap = len(words.intersection(MARATHI_DEVANAGARI_MARKERS))
            hindi_overlap = len(words.intersection(HINDI_DEVANAGARI_MARKERS))
            
            if marathi_overlap > hindi_overlap:
                return "mr", False
            return "hi", False

        # Check Romanized Transliteration
        lower_words = set(re.findall(r'[a-zA-Z]+', text_lower))
        maranglish_overlap = len(lower_words.intersection(MARANGLISH_MARKERS))
        hinglish_overlap = len(lower_words.intersection(HINGLISH_MARKERS))

        if maranglish_overlap >= 2:
            return "mr", True
        if hinglish_overlap >= 2:
            return "hi", True

        return "en", False
