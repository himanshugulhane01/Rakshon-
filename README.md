# ScamShield (स्कैमशील्ड)
### Android-First Digital Fraud Protection Application for Senior Citizens

ScamShield is an assistive security application designed to protect senior citizens from sophisticated digital fraud, impersonation calls, extortion threats ("Digital Arrest"), and malicious financial lure messages.

---

## 🏛️ Architecture & Tech Stack

- **Mobile Client**: React Native with TypeScript (`mobile/`)
- **Android Native**: Kotlin with Android Telecom `CallScreeningService` and Room offline database (`mobile/android/`)
- **Backend APIs**: Python FastAPI with Pydantic v2 and SQLAlchemy 2.0 (`backend/app/`)
- **Database**: PostgreSQL with Alembic migration versioning (`backend/alembic/`)
- **Supported Languages**: English (`en`), Hindi (`hi`), Marathi (`mr`)

---

## 🔒 Senior-First Security & Privacy Principles

1. **No Unrestricted SMS Permissions in MVP**:
   - Google Play restricted permissions (`READ_SMS`, `RECEIVE_SMS`) are strictly avoided.
   - Users share suspicious messages via the native **Android Sharesheet (`ACTION_SEND`)**, in-app paste, or screenshot OCR.
2. **Zero-Network CallScreeningService**:
   - `CallScreeningService` operates completely offline using a local Room SQLite database (`ScamShieldDatabase`).
   - Never makes network requests or backend AI calls on incoming call arrival.
   - Unknown callers are **allowed by default** to avoid dropping critical calls.
3. **Emergency Mode (Cyber Helpline 1930)**:
   - Direct assist for Indian National Cyber Crime Helpline `1930`.
   - Generates user-reviewed bank freeze templates (never sent silently).
4. **Consent-Based Family Safety Circle**:
   - Requires explicit 6-digit consent code pairing.
   - Full revocation support.
   - **Strict Privacy Guarantee**: Caregivers only receive high-level alert metadata; private messages, OTPs, PINs, and banking credentials are never exposed.

---

## 🚀 Running the Project

### Backend
```bash
# Activate virtual environment
cd backend
.\venv\Scripts\Activate.ps1

# Run tests
python -m pytest tests -v

# Run Alembic migrations
python -m alembic upgrade head

# Start API server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Open in your browser (do NOT enter 0.0.0.0 in browser; use localhost):
# Swagger UI: http://localhost:8000/docs
# Health:     http://localhost:8000/api/v1/health
```

### Mobile
```bash
cd mobile
npm install
npm test
```

