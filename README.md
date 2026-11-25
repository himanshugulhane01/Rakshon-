# 🛡️ RAKSHON
### Pause. Verify. Stay Safe.

**A Digital Fraud Protection and Awareness Assistant for Senior Citizens**

Rakshon is a mobile application designed to help senior citizens recognize digital scams, stay safer while using online services, and improve their digital awareness. It brings together suspicious message analysis, caller protection, voice-guided assistance, scam-awareness simulations, and emergency guidance in one simple, senior-friendly application.

Our goal is to make digital safety easier to understand and accessible to everyone, especially people who may not be familiar with modern digital threats.

---

## 📌 Problem Statement

**Digital Literacy and Cyber Fraud Awareness Assistant for Senior Citizens**

With the growing use of smartphones, online banking, UPI payments, and digital services, cyber fraud has become a serious concern.

Senior citizens are often targeted through:
- Fake KYC update messages.
- OTP and PIN theft.
- Fraudulent banking calls.
- Phishing websites and suspicious links.
- Fake electricity bill and utility payment messages.
- UPI collect request scams.
- Lottery and prize fraud.

Many people struggle to identify these threats or understand what steps to take after receiving a suspicious message or call.

Rakshon aims to address this problem through practical protection tools and simple digital safety education.

---

## 💡 Our Solution

Rakshon combines fraud-awareness education and digital safety assistance in a single mobile application.

It helps users examine suspicious content, understand common fraud techniques, practise safe digital transactions in a simulated environment, and access emergency reporting guidance.

The application is designed with simple navigation, readable content, and multilingual support to make it accessible to senior citizens.

---

## ✨ Key Features

### 1. Message Guardian
Helps users examine suspicious SMS messages and identify possible fraud indicators such as fake KYC requests, threatening messages, suspicious payment requests, and OTP-related scams.

Users can share or paste suspicious message content for analysis.

### 2. Call Guardian
Uses Android's native CallScreeningService and locally stored threat information to help identify known suspicious callers.

It supports user-controlled call protection settings and is designed to perform screening without waiting for a network request during an incoming call.

### 3. Scam Lens
Helps users inspect suspicious QR codes, documents, and visual content to identify potential warning signs.

### 4. Voice Guardian
Provides voice-guided safety assistance to make cyber safety guidance easier to access and understand.

### 5. Scam Simulator
Provides interactive fraud-awareness practice scenarios.

Users can learn how to identify:
- Fake electricity bill messages.
- Suspicious banking messages.
- KYC scams.
- OTP fraud.
- Phishing attempts.
- Other common digital scams.

### 6. Banking & UPI Practice Sandbox
A safe training environment where users can practise identifying:
- Fake bank login attempts.
- Simulated UPI payments.
- Fraudulent UPI collect requests.
- OTP safety situations.

**Important:** This is a training simulation only. It does not connect to real banks, UPI applications, payment gateways, or real financial transactions.

### 7. Emergency Mode
Provides quick access to cybercrime reporting information and emergency guidance.

Important Indian cybercrime resources include:

- Cybercrime Helpline: **1930**
- Official Portal: https://cybercrime.gov.in/

It also helps users understand the steps they should consider after a suspected cyber fraud incident.

### 8. Family Safety Circle
Supports family members and caregivers in helping senior citizens improve their digital safety awareness through consent-based sharing of relevant learning progress and safety information.

### 9. Multilingual Support
Designed to support:
- English
- Hindi
- Marathi

This helps users access digital safety information in a language they are comfortable with.

---

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Mobile Frontend | React Native |
| Programming Language | TypeScript |
| Mobile Development | React Native Community CLI |
| Backend | Python, FastAPI |
| ORM | SQLAlchemy |
| Database Migrations | Alembic |
| Backend Database | PostgreSQL |
| Local Android Database | Room |
| Android Native Integration | Kotlin |
| Call Protection | Android CallScreeningService |
| Localization | i18next |
| Build System | Gradle |
| Package Management | npm |
| Version Control | Git |

### Development Tools
- Google Antigravity
- Android Studio
- Android SDK
- Android Emulator
- Node.js
- npm
- Git

---

## 🏗️ System Architecture

Rakshon follows a modular mobile and backend architecture.

```text
             RAKSHON MOBILE APP
             React Native + TypeScript
                       |
          +------------+------------+
          |                         |
          v                         v
    BACKEND SERVICES          ANDROID NATIVE
    Python + FastAPI           Kotlin
          |                         |
          v                         v
      PostgreSQL             CallScreeningService
          |
          v
     Fraud Analysis
      Rule Engine

          LOCAL ANDROID STORAGE
                 |
                 v
            Room Database
```

### How the application works

1. The user interacts with the Rakshon mobile application.
2. Suspicious content can be shared or submitted for examination.
3. The application uses its analysis logic and relevant threat information to identify possible warning signs.
4. The user receives an explanation and recommended safety actions.
5. Android-specific call screening uses local threat information for incoming-call decisions.

---

## 🔐 Security and Privacy

User safety and privacy are important design considerations in Rakshon.

- The Banking and UPI Sandbox never initiates real transactions.
- The application does not require users to share real banking PINs, passwords, or OTPs for training.
- Message checking is user-initiated through sharing or pasting rather than silent SMS collection.
- Call screening is designed to avoid network requests during the incoming-call screening process.
- Family Safety Circle is based on user consent and limited information sharing.
- Suspicious URLs should not be opened automatically.
- Fraud warnings are based on indicators and should not be treated as guaranteed proof of fraud.

---

## 🎯 Target Users

Rakshon is primarily designed for:

- Senior citizens.
- People with limited digital literacy.
- Families supporting older members.
- First-time smartphone and digital payment users.
- Anyone who wants to improve their awareness of common cyber fraud techniques.

---

## 🌍 Expected Impact

Rakshon aims to:

- Improve awareness of common cyber fraud techniques.
- Encourage safer UPI and online banking habits.
- Help senior citizens recognize suspicious messages and callers.
- Make digital safety education available in regional languages.
- Encourage family involvement in digital awareness.
- Reduce the risk of preventable financial losses through education and timely guidance.

---

## 🚀 Future Scope

Possible future improvements include:

- Additional Indian regional languages.
- More interactive audio-visual learning modules.
- Expanded scam-awareness scenarios.
- Improved threat intelligence and analysis.
- More accessibility options for senior citizens.
- Enhanced caregiver learning and safety dashboards.
- Broader support for safe-browsing awareness.

---

## 🧪 Testing and Verification

The following results were reported for the Banking & UPI Practice Sandbox implementation:

| Verification | Reported Result |
|---|---|
| TypeScript Typecheck | 0 errors |
| Mobile Unit Tests | 126/126 passed |
| Backend Tests | 46/46 passed |
| Android Debug Build | Successful |
| Android Emulator | Scenario flows tested |

These are the reported results for the Feature 1 implementation and its verification. They should not be interpreted as final verification of every future feature.

---

## 📱 Prototype

**Application Name:** Rakshon

**Platform:** Android

**Project Type:** Digital Safety and Cyber Fraud Awareness Assistant
---

## 🤝 Contribution

Contributions, suggestions, and feedback are welcome.

If you would like to contribute:
1. Fork the repository.
2. Create a new branch.
3. Make your changes.
4. Test your changes.
5. Submit a pull request.

---

## 📜 Disclaimer

Rakshon is a digital safety awareness and assistance prototype. Its risk assessments are intended to help users recognize possible warning signs and do not guarantee detection of every scam.

The Banking and UPI Practice Sandbox is for educational purposes only and does not perform real financial transactions.

Users should independently verify suspicious communications through official bank, service-provider, or government channels.

---

## ❤️ Our Mission

We believe that everyone deserves to use digital technology with confidence.

Rakshon aims to make digital safety simple, understandable, and accessible.

**RAKSHON — Pause. Verify. Stay Safe.**
