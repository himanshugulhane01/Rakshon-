# Rakshon (रक्षण) – Digital Safety Companion
### Android-First Digital Fraud Protection & Cyber Literacy Assistant for Senior Citizens

Rakshon is an assistive cyber safety application designed to protect senior citizens from sophisticated digital fraud, impersonation calls, extortion threats ("Digital Arrest"), phishing websites, and UPI collect traps.

---

## 🏛️ Core Features

1. **Banking & UPI Practice Sandbox**: Interactive, risk-free training sandbox to identify fake net-banking logins, UPI collect frauds, and OTP traps.
2. **Audio-Visual Learning Centre**: Trilingual (English, Hindi, Marathi) voice-guided lessons, visual fraud flashcards, and quizzes.
3. **Safe-Browsing Simulator**: Realistic website inspector teaching seniors how to spot phishing URLs, unencrypted HTTP forms, and lookalike bank domains.
4. **Caregiver & Family Protection**: Consent-first family circle allowing trusted children or caregivers to monitor safety status without privacy intrusion.
5. **Unified "Is This Safe?" Checker**: Single instant verifier for phone numbers, payment links, and suspicious SMS messages.
6. **Offline Call Screening**: On-device spam and extortion call detection using Android Telecom CallScreeningService and Room database (zero audio recording).

---

## 🛠️ Tech Stack

- **Mobile Client**: React Native 0.76.2, TypeScript 5.6, Hermes Engine
- **Android Native**: Kotlin 1.9, Jetpack Room SQLite, Telecom CallScreeningService
- **Backend API**: Python 3.10+, FastAPI, Uvicorn, SQLAlchemy, PostgreSQL
- **Testing**: Jest (18 suites, 146 unit tests), React Test Renderer, Pytest
- **Localization**: Trilingual (English, Hindi, Marathi) via i18next
