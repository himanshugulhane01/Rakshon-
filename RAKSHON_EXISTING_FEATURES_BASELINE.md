# RAKSHON: EXISTING FEATURES BASELINE & ARCHITECTURAL RECORD

**Project:** Rakshon – Digital Literacy and Cyber Fraud Awareness Assistant for Senior Citizens  
**Date:** November 19, 2026  
**Checkpoint Git Commit:** `d64c43c514bbf84152cddfe73b6a042c444691db`  
**Checkpoint Git Tag:** `baseline-pre-hackathon-features`  

---

## 1. Executive Summary

This document establishes the official verification baseline and preservation record for the existing Rakshon application prior to implementing the five additional hackathon features. All existing components, screens, services, Room database tables, FastAPI backend endpoints, and unit test suites documented here are guaranteed preserved, unmodified in their core behaviors, and protected against regressions.

---

## 2. Existing Frontend Screens & Navigation Stack

### 2.1 Navigation Architecture (`mobile/src/App.tsx`)
The mobile application uses a stateful screen switcher in `App.tsx` coordinating transition between 17 active screen components:

| Screen Name | Component File | Description & State Ownership |
|---|---|---|
| `Splash` | `SplashScreen.tsx` | Startup branding, logo animation, session restoration |
| `LanguageSelect` | `LanguageSelectionScreen.tsx` | Multilingual selection (English, Hindi, Marathi) |
| `Onboarding` | `OnboardingScreen.tsx` | 3-slide senior cybercrime awareness walkthrough |
| `Login` | `LoginScreen.tsx` | Authenticated mobile phone + password login + Google Demo button |
| `SignUp` | `SignUpScreen.tsx` | Senior-friendly account registration |
| `Home` | `HomeScreen.tsx` | Primary dashboard with dynamic greeting, guardian cards, emergency help |
| `MessageGuardian` | `MessageGuardianScreen.tsx` | SMS / WhatsApp text input & Android Sharesheet receiver |
| `AnalysisResult` | `AnalysisResultScreen.tsx` | Detailed fraud risk score, warning signs & recommended actions |
| `CallGuardian` | `CallGuardianScreen.tsx` | **Protect Section:** Call screening status, device protection card, offline sync |
| `ScamLens` | `ScamLensScreen.tsx` | Camera QR scanner & deceptive UPI payment detection |
| `Emergency` | `EmergencyScreen.tsx` | 1930 Cybercrime Helpline dialer, portal launcher, bank freeze guidance |
| `FamilyCircle` | `FamilyCircleScreen.tsx` | **Family Section:** Consent-first caregiver pairing & ephemeral code generation |
| `ScamSimulator` | `ScamSimulatorScreen.tsx` | **Learn Section:** Interactive practice scenarios (electricity, lottery, etc.) |
| `VoiceGuardian` | `VoiceGuardianScreen.tsx` | Voice-assisted guidance and emergency guidance dialogs |
| `Notifications` | `NotificationsScreen.tsx` | Verified alert notification center |
| `Profile` | `ProfileScreen.tsx` | User profile management, language switch, session logout |
| `ComponentShowcase` | `ComponentShowcaseScreen.tsx` | Design system component showcase |

### 2.2 Bottom Navigation Architecture (`mobile/src/components/BottomNavigation.tsx`)
A persistent 5-item accessible bottom navigation bar with 48dp minimum touch targets:
1. `Home` (`🏠`) -> Navigates to `HomeScreen`
2. `Protect` (`🛡️`) -> Navigates to `CallGuardianScreen` (Active on Protect)
3. `Learn` (`🎓`) -> Navigates to `ScamSimulatorScreen` (Active on Learn)
4. `Family` (`👥`) -> Navigates to `FamilyCircleScreen` (Active on Family)
5. `Profile` (`👤`) -> Navigates to `ProfileScreen` (Full screen view without bottom navigation)

---

## 3. Existing UI Design System & Reusable Components

### 3.1 Six-Color Palette (`mobile/src/theme/index.ts`)
- **Deep Forest**: `#152720` (Headers, hero backgrounds, primary action buttons)
- **Rich Emerald**: `#2D6B51` (Brand accents, active indicators, progress fill)
- **Mint Tint**: `#E8F5EE` (Badge backgrounds, icon containers, soft highlights)
- **Off-White**: `#F8F9FA` (Main screen background, card surfaces)
- **Pure White**: `#FFFFFF` (Card surfaces, dialog sheets, primary text on dark)
- **Dark Slate**: `#1E293B` (Primary headings, readable body typography)
- *Semantic Secondary Colors*:
  - Alert Crimson: `#B91C1C` / `#DC2626` (Emergency helpline, high risk alerts)
  - Warning Amber: `#D97706` (Setup required, medium risk warnings)
  - Neutral Gray: `#64748B`, `#94A3B8`, `#CBD5E1`, `#E2E8F0` (Borders, subtitles)

### 3.2 Typography & Font Scaling
- **English**: Plus Jakarta Sans (`Regular 400`, `Medium 500`, `SemiBold 600`, `Bold 700`)
- **Hindi & Marathi**: Noto Sans Devanagari (`Regular 400`, `Medium 500`, `SemiBold 600`, `Bold 700`)
- `allowFontScaling={true}` preserved across all components to respect Android system accessibility text scaling.

### 3.3 Reusable Senior Components (`mobile/src/components/`)
- `SeniorButton`: Touch-optimized button with primary, secondary, outline, text variants
- `SeniorCard`: High-contrast container with consistent 20dp border radius
- `SeniorHeader`: Accessible header with back navigation and screen title
- `SeniorInput`: Large readable form input with floating label and error feedback
- `SeniorBadge`: Accessible status pill (safe, warning, danger, neutral, info)
- `SeniorDialog`: Accessible modal dialog for confirmations (destructive actions, dialers)
- `RakshonLogo`: Authentic vector shield logo with bilingual typography
- `BottomNavigation`: 5-tab persistent bottom bar
- `ProtectionStatusCard`: Live system protection state monitor
- `RiskResultCard`: Detailed fraud breakdown with color-coded risk level
- `EmergencyActionCard`: Quick access helpline dialer card
- `LearningProgressCard`: Progress tracking bar with completion statistics

---

## 4. Android Native Modules & Local Room Database

### 4.1 CallScreeningService (`mobile/android/.../callguardian/ScamCallScreeningService.kt`)
- Extends Android `android.telecom.CallScreeningService` (API 29+ / Android Q+).
- **100% Offline Screening**: Screens incoming calls strictly using local Room SQLite database queries.
- **Zero Audio Interception**: Does NOT record, listen to, or process audio.
- **Privacy Guarantees**: Does not transmit call metadata to external networks. Blocked calls are retained in system call log for caregiver review.

### 4.2 Room Threat Database (`mobile/android/.../callguardian/`)
- **Database Class**: `ScamShieldDatabase.kt` (Room database version 1)
- **Entity**: `ThreatEntity.kt` (Table: `scam_threats`)
  - `id`: Primary key integer
  - `indicatorType`: String (`PHONE_NUMBER`, `PHONE_PREFIX`, `UPI_HANDLE`)
  - `value`: Indexed unique string (`+919876543210`, `+92`)
  - `severity`: String (`HIGH`, `MEDIUM`, `LOW`)
  - `description`: String? (context description)
  - `language`: String (`en`, `hi`, `mr`, `all`)
  - `isActive`: Boolean
  - `version`: Integer (version sequence for delta sync)
- **DAO**: `ThreatDao.kt`
  - `findByPhoneNumber(phoneNumber: String): ThreatEntity?`
  - `getAllActivePrefixes(): List<ThreatEntity>`
  - `upsertAll(threats: List<ThreatEntity>)`
  - `getLatestVersion(): Int?`
  - `countActiveThreats(): Int`

---

## 5. Backend Architecture (FastAPI & PostgreSQL)

### 5.1 Endpoints (`backend/app/api/v1/`)
- `GET /api/v1/health`: System health and version status
- `GET /api/v1/health/db`: PostgreSQL connectivity diagnostic
- `POST /api/v1/analyze/message`: Rule-based scam detection on SMS / WhatsApp payloads
- `POST /api/v1/analyze/call`: Number reputation check against known threat signatures
- `GET /api/v1/sync/threats`: Delta synchronization endpoint for Android Room DB

### 5.2 Rule-Based Detection Engine (`backend/app/services/`)
- `ScamDetectionEngine`: Analyzes text against specialized heuristic rule sets:
  - `apk_remote_rules.py`: Malicious APK downloads and remote control tools (AnyDesk, TeamViewer)
  - `benign_rules.py`: Legitimate transaction and delivery notifications (preventing false alarms)
  - `digital_arrest_rules.py`: Fake police, CBI, Customs extortion and digital arrest threats
  - `electricity_rules.py`: Power disconnection and bill default threats
  - `kyc_rules.py`: Bank and wallet KYC suspension threats
  - `link_rules.py`: Phishing URL patterns, IP hosts, deceptive redirects
  - `otp_pin_rules.py`: OTP and PIN theft heuristics (OTP mention alone is never flagged as scam)
  - `upi_rules.py`: Fraudulent collect requests, QR refund deception
  - `urgent_blocking_rules.py`: False urgency and panic-inducing phrases
- `CallReputationService`: Phone number masking and threat signature matching

### 5.3 PostgreSQL Database Models (`backend/app/models/`)
- `User` (`users` table): Senior and Caregiver user accounts
- `FamilyCircle` (`family_circles` table): Pairing codes, pairing status, consent tracking
- `ScamIndicator` (`scam_indicators` table): Central threat signature repository
- `EmergencyEvent` (`emergency_events` table): Emergency guidance and panic logging

---

## 6. Localization Baseline (`mobile/src/i18n/`)

- Full trilingual support:
  - English (`en.json`)
  - Hindi (`hi.json`)
  - Marathi (`mr.json`)
- All strings across screens, badges, dialogs, and emergency guidance are managed through `react-i18next`.

---

## 7. Verification Baseline & Test Results

### 7.1 Mobile Test Suites (`mobile/__tests__/`)
Command: `cd mobile; npm test`
- **Total Test Suites**: 13 passed, 13 total (100%)
- **Total Unit Tests**: 118 passed, 118 total (100%)
- **Test Suites Breakdown**:
  1. `SeniorTheme.test.ts`: Palette colors, contrast ratios, typography
  2. `StorageService.test.ts`: Secure credentials, encrypted storage, user profiles
  3. `i18n.test.ts`: Language loading, fallback resolution, Devanagari script
  4. `Components.test.tsx`: SeniorButton, SeniorCard, SeniorInput, SeniorBadge, SeniorDialog
  5. `Stage3_2.test.tsx`: Message Guardian, Sharesheet intent simulation, OCR text extraction
  6. `Stage3_3.test.tsx`: Call Guardian, offline threat sync, CallScreeningService integration
  7. `Stage3_4.test.tsx`: Scam analysis result rendering, risk scoring, urgency warnings
  8. `Stage3_5.test.tsx`: Scam Lens QR scanner, UPI deceptive link detection, offline call screening
  9. `Stage3_6.test.tsx`: Emergency mode, 1930 Helpline, Family Safety Circle, Scam Simulator
  10. `Stage3_7.test.tsx`: Voice Guardian, accessibility announcements, emergency audio guidance
  11. `Stage3_8.test.tsx`: Notifications screen, unread badge counters, dismiss actions
  12. `Stage3_9.test.tsx`: Profile screen, language switching, authenticated session logout
  13. `HomeDynamicGreeting.test.tsx`: Dynamic personalized greeting, user session isolation

### 7.2 Backend Test Suites (`backend/tests/`)
Command: `cd backend; .\venv\Scripts\python.exe -m pytest`
- **Total Tests**: 46 passed, 46 total (100%)
- **Test Suites Breakdown**:
  1. `test_analyze_api.py`: 8 passed
  2. `test_health.py`: 2 passed
  3. `test_normalizer.py`: 9 passed
  4. `test_scam_engine.py`: 14 passed
  5. `test_scam_rules.py`: 11 passed
  6. `test_threat_sync.py`: 2 passed

### 7.3 TypeScript Compilation
Command: `cd mobile; npx tsc --noEmit`
- **Errors**: 0 errors.

### 7.4 Android Debug Build
Command: `cd mobile/android; ./gradlew assembleDebug --no-daemon`
- **Result**: `BUILD SUCCESSFUL in 14s`
- APK location: `mobile/android/app/build/outputs/apk/debug/app-debug.apk`
- Installed and validated live on Android emulator (`emulator-5554`, Android API 37).

---

## 8. Git Checkpoint

- **Git Branch**: `master`
- **Commit SHA**: `d64c43c514bbf84152cddfe73b6a042c444691db`
- **Tag**: `baseline-pre-hackathon-features`
- **Commit Message**: `checkpoint: verified baseline state before hackathon feature implementation`

---

## 9. Next Steps

With Stage 0 baseline complete and verified:
1. Await user confirmation and approval.
2. Proceed to **Feature 1: Banking & UPI Practice Sandbox**.

