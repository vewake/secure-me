# 🔒 SecureMe

SecureMe is a personal safety and emergency alert platform. When a user triggers a panic alert, the mobile app captures real-time GPS coordinates, audio recordings, and photos, then generates a unique access code. Trusted contacts can open the access code link in any browser to view a live evidence dashboard — no login required.

---

## 📐 Architecture

```
┌──────────────────┐     JWT / REST     ┌──────────────────────┐
│  Mobile App      │ ─────────────────► │  Backend API         │
│  (Expo React     │                    │  (Express + Prisma)  │
│   Native)        │ ◄───────────────── │                      │
└──────────────────┘   accessCode/data  └──────────┬───────────┘
                                                   │
                                         ┌─────────▼─────────┐
                                         │   PostgreSQL DB    │
                                         └─────────▲─────────┘
                                                   │
┌──────────────────┐     REST (public)  ┌──────────┴───────────┐
│  Web Portal      │ ─────────────────► │  Backend API         │
│  (Next.js 15)    │                    │  GET /alert/:code    │
└──────────────────┘                    └──────────────────────┘
```

| Service | Technology | Default Port |
|---------|-----------|-------------|
| **Backend API** | Node.js · Express · TypeScript · Prisma | `3000` |
| **Web Portal** | Next.js 15 · React 19 · Tailwind CSS | `3001` |
| **Mobile App** | Expo · React Native · TypeScript | — (device/emulator) |
| **Database** | PostgreSQL 16 | `5432` |

---

## 📦 Monorepo Structure

```
secure-me/
├── backend/          # Express REST API
│   ├── prisma/       # Database schema & migrations
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── index.ts
│   ├── .env.example
│   └── package.json
│
├── web/              # Next.js web portal
│   ├── app/
│   │   ├── page.tsx              # Enter access code
│   │   └── alert/[accessCode]/   # Evidence viewer
│   ├── components/
│   ├── .env.example
│   └── package.json
│
├── app/              # Expo mobile app
│   ├── app/          # File-based routes (Expo Router)
│   │   ├── (auth)/   # Login & Register
│   │   ├── (tabs)/   # Main tabs (Home, Settings)
│   │   └── (panic)/  # Panic mode screens
│   ├── .env.example
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## 🚀 Quick Start

### Option A — Docker Compose (recommended)

> Spins up PostgreSQL, the backend API, and the web portal in one command.

```bash
# 1. Clone the repository
git clone https://github.com/vewake/secure-me.git
cd secure-me

# 2. Copy and fill in environment files
cp backend/.env.example backend/.env
cp web/.env.example web/.env

# 3. Start all services
docker compose up --build
```

| Service | URL |
|---------|-----|
| Backend API | http://localhost:3000 |
| Web Portal  | http://localhost:3001 |
| PostgreSQL  | `localhost:5432` (internal) |

### Option B — Manual Setup

#### Prerequisites
- Node.js ≥ 18
- pnpm (backend & web) or npm
- PostgreSQL 14+

#### 1. Backend

```bash
cd backend

# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL and JWT_SECRET

# Run database migrations and generate Prisma client
npx prisma migrate deploy
npx prisma generate

# Start the server
npm start
```

#### 2. Web Portal

```bash
cd web

# Install dependencies
pnpm install   # or: npm install

# Copy and configure environment
cp .env.example .env
# Edit .env — set NEXT_PUBLIC_API_URL and NEXT_PUBLIC_MAPPLS_API_KEY

# Development server
pnpm dev       # → http://localhost:3000

# Production build
pnpm build && pnpm start
```

#### 3. Mobile App

```bash
cd app

# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env — set EXPO_PUBLIC_API_BASE_URL and EXPO_PUBLIC_WEBSITE_URL

# Start Expo dev server
npx expo start

# Run on Android emulator / device
npx expo run:android

# Run on iOS simulator (macOS only)
npx expo run:ios
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string — `postgresql://user:pass@host:5432/dbname` |
| `JWT_SECRET` | ✅ | Secret key used to sign and verify JSON Web Tokens |
| `PORT` | ❌ | HTTP port the API listens on (default: `3000`) |

### Web Portal (`web/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | ✅ | Backend API base URL (no trailing slash) |
| `NEXT_PUBLIC_MAPPLS_API_KEY` | ✅ | [Mappls Maps](https://about.mappls.com/api/) API key for the evidence map |
| `NEXT_PUBLIC_APP_DOWNLOAD_URL` | ❌ | Public URL of the Android APK download |

### Mobile App (`app/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_API_BASE_URL` | ✅ | Backend API base URL (no trailing slash) |
| `EXPO_PUBLIC_WEBSITE_URL` | ✅ | Web portal base URL **with** trailing slash — e.g. `https://example.com/alert/` |

---

## 🔌 API Reference

All protected endpoints require an `Authorization` header with the JWT returned at login.

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/signup` | — | Register a new user |
| `POST` | `/auth/login` | — | Sign in and receive a JWT |

**Signup body**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret",
  "phone": "9876543210",
  "gender": "FEMALE",
  "address": "123 Main St"
}
```

**Login body**
```json
{ "email": "jane@example.com", "password": "secret" }
```

---

### Alerts

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET`  | `/alert/new` | ✅ | Create a new panic alert — returns `{ alertId, accessCode }` |
| `POST` | `/alert/sendimage` | ✅ | Attach a base64 image to an alert |
| `POST` | `/alert/sendaudio` | ✅ | Attach a base64 audio clip to an alert |
| `POST` | `/alert/sendlocation` | ✅ | Attach a GPS point to an alert |
| `GET`  | `/alert/:accessCode` | — | **Public** — fetch paginated evidence for an alert |

**Send image body**
```json
{ "alertid": "<alertId>", "base64": "<base64-encoded-image>" }
```

**Send location body**
```json
{ "alertid": "<alertId>", "latitude": 28.6139, "longitude": 77.2090 }
```

**Get alert response**
```json
{
  "alert": {
    "id": "...",
    "accessCode": "uuid-v4",
    "user": { "name": "Jane Doe", "email": "jane@example.com" },
    "images": [ { "id": "...", "base64": "..." } ],
    "audio":  [ { "id": "...", "base64": "..." } ],
    "locations": [ { "latitude": 28.61, "longitude": 77.20 } ]
  }
}
```

---

### Location (continuous tracking)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/location/pushlocation` | ✅ | Save a real-time location update |
| `GET`  | `/location/getlocationhistory` | ✅ | Retrieve the user's location history |
| `GET`  | `/location/nearbyuser` | ✅ | Find other users nearby |

---

### User

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET`  | `/user/profile` | ✅ | Get current user profile |
| `PUT`  | `/user/update` | ✅ | Update current user profile |

---

## 🗄️ Database Schema

```
User
 ├── id          UUID  (PK)
 ├── name        String
 ├── email       String  (unique)
 ├── phone       String
 ├── password    String  (bcrypt hash)
 ├── gender      Enum (MALE | FEMALE | OTHER)
 ├── address     String?
 ├── alerts      Alert[]
 └── locations   Location[]

Alert
 ├── id          UUID  (PK)
 ├── accessCode  UUID  (unique — shared with contacts)
 ├── userId      → User
 ├── images      Image[]
 ├── audio       Audio[]
 └── locations   Location[]

Image
 ├── id          UUID  (PK)
 ├── alertId     → Alert
 └── base64      String

Audio
 ├── id          UUID  (PK)
 ├── alertId     → Alert
 └── base64      String

Location
 ├── id          UUID  (PK)
 ├── userId      → User
 ├── alertId     → Alert?
 ├── isalert     Boolean
 ├── latitude    Float
 └── longitude   Float
```

---

## 🚨 Panic Alert Workflow

```
1. User taps "Activate Panic Alert"
      │
      ▼
2. App calls GET /alert/new  →  receives { alertId, accessCode }
      │
      ▼
3. App shows share screen — user sends link to trusted contacts
   Link format: https://<web-portal>/alert/<accessCode>
      │
      ▼
4. In parallel, app continuously:
   • Captures photos → POST /alert/sendimage
   • Records audio  → POST /alert/sendaudio
   • Sends GPS      → POST /alert/sendlocation  (every 5 s)
      │
      ▼
5. Trusted contact opens link in browser
      │
      ▼
6. Web portal calls GET /alert/<accessCode>  (no auth needed)
   Displays evidence gallery, audio player, and live map
```

---

## 🐳 Docker

Individual Dockerfiles are provided for the backend and web portal. Use `docker compose up` from the repository root to start everything together (see [Quick Start](#option-a--docker-compose-recommended)).

```bash
# Build images individually (optional)
docker build -t secureme-backend ./backend
docker build -t secureme-web ./web

# Or start the full stack
docker compose up --build
```

---

## 🛠️ Development Tips

- **Prisma Studio** — browse the database in a GUI:
  ```bash
  cd backend && npx prisma studio
  ```
- **Database migrations** — after editing `prisma/schema.prisma`:
  ```bash
  cd backend && npx prisma migrate dev --name <migration-name>
  ```
- **Expo tunnel** — test on a physical device without being on the same Wi-Fi:
  ```bash
  cd app && npx expo start --tunnel
  ```

---

## 📱 Mobile App Permissions

The app requests the following device permissions at runtime:

| Permission | Purpose |
|-----------|---------|
| `CAMERA` | Capture photo evidence |
| `RECORD_AUDIO` | Record audio evidence |
| `ACCESS_FINE_LOCATION` | Send GPS coordinates |
| `ACCESS_BACKGROUND_LOCATION` | Continue tracking during panic alert |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit your changes: `git commit -m "feat: add my feature"`
4. Push to the branch: `git push origin feat/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is open source. See [LICENSE](LICENSE) for details.
