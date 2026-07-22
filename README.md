# Crewmute

A mobile-first carpool platform for Indian college students. Students post or browse intercity shared-cab rides for weekend and holiday travel, coordinate with verified co-passengers, and split costs transparently — all in one app.

Built with React Native + Expo (mobile) and Node.js + Express + MongoDB (backend).

---

## Prerequisites

| Requirement | Version |
|---|---|
| Node.js | 20 LTS ([nvm](https://github.com/nvm-sh/nvm) recommended) |
| npm | 10+ (bundled with Node 20) |
| Expo CLI | via `npx expo` (no global install needed) |
| MongoDB | Atlas account (free tier) or local instance |

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/<org>/crewmute.git
cd crewmute
```

### 2. Backend

```bash
cd backend

# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env — fill in MONGO_URI and token secrets at minimum (see Environment Variables below)

# Start the development server
npm run dev
# → Server starts on http://localhost:5000
# → GET http://localhost:5000/health should return { status: 'ok' }
```

### 3. Mobile

```bash
cd mobile

# Install dependencies
npm install

# Start Expo development server
npx expo start

# Press 'a' for Android emulator, 'i' for iOS simulator, or scan QR code with Expo Go
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Example | Required | Purpose |
|---|---|---|---|
| `PORT` | `5000` | No (default: 5000) | Express server port |
| `MONGO_URI` | `mongodb+srv://...` | **Yes** | MongoDB Atlas connection string |
| `ACCESS_TOKEN_SECRET` | 64-char random string | **Yes** | JWT access token signing key |
| `REFRESH_TOKEN_SECRET` | 64-char random string | **Yes** | JWT refresh token signing key |
| `EMAIL_HOST` | `smtp.gmail.com` | Yes (for auth) | Nodemailer SMTP host |
| `EMAIL_USER` | `crewmute@gmail.com` | Yes (for auth) | Sender email address |
| `EMAIL_PASS` | Gmail app password | Yes (for auth) | Gmail app password |
| `CLOUDINARY_CLOUD_NAME` | `crewmute` | Yes (for uploads) | Cloudinary account name |
| `CLOUDINARY_API_KEY` | `...` | Yes (for uploads) | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | `...` | Yes (for uploads) | Cloudinary API secret |
| `CLIENT_URL` | `exp://...` | No | Mobile app URL for CORS |
| `NODE_ENV` | `development` | No (default: development) | Environment mode |

Copy `backend/.env.example` to `backend/.env` and fill in values. **Never commit `.env`.**

### Mobile (`mobile/.env` / `app.config.js`)

| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_API_URL` | Backend base URL (e.g. `http://localhost:5000/api/v1`) |
| `EXPO_PUBLIC_GOOGLE_PLACES_KEY` | Google Places API key for city autocomplete |

---

## Running Tests

### Backend

```bash
cd backend
npm test                  # Run all tests
npm run test:coverage     # Run tests with coverage report
npm run typecheck         # TypeScript type check (no emit)
npm run lint              # ESLint
```

### Mobile

```bash
cd mobile
npm test                  # Run all tests
npm run typecheck         # TypeScript type check
npm run lint              # ESLint
```

---

## Project Structure

```
/
├── mobile/          # React Native + Expo application
├── backend/         # Node.js + Express API server
├── docs/            # All project documentation
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── DESIGN.md
│   ├── DECISIONS.md
│   └── api/
├── tests/           # Cross-cutting integration and E2E tests
├── scripts/         # Build, seed, and migration scripts
├── AGENT_RULES.md   # Engineering constitution — read before contributing
└── README.md
```

---

## Key Documentation

| Document | Purpose |
|---|---|
| [AGENT_RULES.md](./AGENT_RULES.md) | Engineering constitution — all contributors must read |
| [docs/PRD.md](./PRD.md) | Product requirements |
| [docs/ARCHITECTURE.md](./ARCHITECTURE.md) | Technical architecture |
| [docs/DESIGN.md](./DESIGN.md) | Design system and UI spec |
| [docs/DECISIONS.md](./docs/DECISIONS.md) | Architectural decision records |
| [docs/api/](./docs/api/) | API reference documentation |

---

## Contributing

All contributors (human and AI) must read [AGENT_RULES.md](./AGENT_RULES.md) before making any change. It is the source of truth for how work is done in this repository.

Branch strategy: `main` (production) → `dev` (integration) → `feature/*` (individual features).

Commit convention: `feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:` prefixes (Conventional Commits).
