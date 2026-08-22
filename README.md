# ♻️ SmartWaste AI — Official Architecture & RBAC Specification

> **"Don't throw it. Find it, scan it, recycle it."**  
> *An AI-assisted, microservice-structured civic tech ecosystem connecting citizens, municipal authorities, and waste-collection workers into a unified intelligent recycling network.*

---

## 🏗️ Architecture Overview & Gist

SmartWaste AI is built using a **Domain-Oriented 3-Microservice Architecture** powered by Next.js 16 App Router, Node.js ESM, MongoDB Atlas, and JWT authentication:

```
smart_waste_ai/
│
├── 🔐 auth-service/        # SERVICE 1: Centralized Auth & RBAC Microservice
│   ├── controllers/       # Auth request handlers (login, register, me, createWorker)
│   ├── middleware/        # JWT authentication & role-authorization guards
│   ├── services/          # Business logic & bcryptjs password hashing
│   ├── utils/             # Jose JWT sign & verify + HttpOnly cookie management
│   └── validators/        # Input validation & server-side role overrides
│
├── 🤖 ai-llm-service/      # SERVICE 2: Isolated AI/LLM Service (AI Module Stub)
│   ├── controllers/       # Waste item scan & upcycling recommendation endpoints
│   ├── services/          # AI classification logic stub
│   ├── validators/        # Input payload validation
│   └── README.md          # Integration guide for AI team member
│
├── 🧠 brain-service/       # SERVICE 3: Main Core Workflow Service
│   ├── admin/             # Municipal Command Center & high-level workflows
│   ├── workers/           # Worker profile tracking & route status
│   ├── bins/              # Smart bin CRUD, geospatial queries & mock fallbacks
│   ├── reports/           # Citizen & worker issue reporting engine
│   ├── routes/            # Greedy nearest-neighbor AI route optimization
│   └── analytics/         # System metrics & city-wide analytics
│
├── src/                    # Frontend Pages & Gateway API Routes
│   ├── app/               # App Router (/citizen, /worker, /admin, /api)
│   ├── components/        # UI components (BinMap, AddBinModal, ReportModal)
│   ├── models/            # Database Schemas (User, Worker, Admin, Bin, Report, Route)
│   └── middleware.js      # Next.js Edge Route Protection (jose)
│
├── docs/                   # Architecture, API & Security Documentation
├── scripts/                # Administrative & Seed Scripts
├── .env.local              # MongoDB Atlas URI & JWT Secrets
├── credentials.md          # Official Credentials Specification
└── package.json            # Dependencies & Webpack Build Config
```

---

## 🔒 Authentication & Role-Based Access Control (RBAC)

Authentication is handled via **signed JSON Web Tokens (`jose`)** stored in `HttpOnly` cookies (`swai_token`) with standard 7-day expiration.

### 👥 Role Classification Matrix

| Feature / Capability | 👤 Citizen | 🚚 Worker | 🏛️ Admin |
|---|:---:|:---:|:---:|
| **Public Self-Registration** | ✅ Yes (`/citizen/register`) | ❌ Server-only | ❌ Seed-only |
| **Login Access** | ✅ Yes (`/citizen/login`) | ✅ Yes (`/citizen/login`) | ✅ Yes (`/citizen/login`) |
| **Landing Portal** | `/citizen/dashboard` | `/worker` | `/admin` |
| **Interactive Leaflet Map** | ✅ Yes (`/citizen/find-bin`) | ✅ View-only | ✅ Yes |
| **Add Dustbin to Atlas DB** | ✅ Yes (Suggested) | ❌ No | ✅ Yes (Full CRUD) |
| **Report Bin Problem** | ✅ Yes (`POST /api/reports`) | ✅ Yes (`POST /api/worker/report`) | ✅ View/Resolve all |
| **View Assigned Pickup Route** | ❌ No | ✅ Yes (`GET /api/worker/route`) | ✅ View all routes |
| **Mark Bin Collected** | ❌ No | ✅ Yes (`PATCH /api/worker/bins/:id/collect`) | ✅ Reset levels |
| **Generate AI Route** | ❌ No | ❌ No | ✅ Yes (`POST /api/admin/routes/generate`) |
| **Assign Route to Worker** | ❌ No | ❌ No | ✅ Yes (`POST /api/admin/routes/:id/assign`) |
| **Create Worker Account** | ❌ No | ❌ No | ✅ Yes (`POST /api/admin/workers`) |

---

## 🔐 Database Authentication & Security Mechanics

1. **Server-Enforced Registration**:
   - Public registration (`POST /api/auth/register`) **ALWAYS forces `role = "citizen"`**.
   - If a client attempts to pass `"role": "admin"` in the JSON payload, the server validator strips the field.

2. **Protected Route Middleware (`src/middleware.js`)**:
   - `/admin/*` requires valid JWT with `role === "admin"`. Unauthorized requests return **HTTP 403 Forbidden**.
   - `/worker/*` requires valid JWT with `role === "worker"`. Unauthorized requests return **HTTP 403 Forbidden**.
   - `/citizen/dashboard` requires valid JWT token. Unauthenticated users return **HTTP 401 Unauthorized**.

3. **MongoDB Atlas Collections (`smart_waste_ai`)**:
   - `users`: Stores user credentials (`email`, `passwordHash`, `role`, `name`, `isActive`).
   - `workers`: Stores worker operational details (`userId`, `employeeId`, `department`, `status`).
   - `admins`: Stores municipal admin profiles (`userId`, `department`, `permissions`).
   - `bins`: Stores smart bin documents (`binId`, `lat`, `lng`, `fillLevel`, `category`, `wasteType`).
   - `reports`: Stores citizen/worker issue reports (`reportedBy`, `binId`, `type`, `status`, `description`).
   - `routes`: Stores AI-generated collection route sequences (`bins`, `estimatedDistanceKm`, `assignedWorker`, `status`).

---

## 📋 Master Credentials Directory

All accounts below are verified and stored in your **MongoDB Atlas Cloud Database (`smart_waste_ai.users`)**:

### 🏛️ 1. Main Municipal Admin
- **Role**: `admin`
- **Name**: `Municipal Admin`
- **Email**: `admin@smartwaste.local`
- **Password**: `Admin@SmartWaste2026`
- **Portal Link**: [http://localhost:3000/admin](http://localhost:3000/admin) (or via `/citizen/login`)

### 🚚 2. Municipal Workers
- **Worker 1 (North Zone)**:
  - **Role**: `worker` | **Name**: `Ramesh Kumar` | **Employee ID**: `MUN-1001`
  - **Email**: `worker1@smartwaste.local` | **Password**: `Worker@SmartWaste2026`
  - **Portal Link**: [http://localhost:3000/worker](http://localhost:3000/worker)
- **Worker 2 (South Zone)**:
  - **Role**: `worker` | **Name**: `Suresh Singh` | **Employee ID**: `MUN-1002`
  - **Email**: `worker2@smartwaste.local` | **Password**: `Worker@SmartWaste2026`
  - **Portal Link**: [http://localhost:3000/worker](http://localhost:3000/worker)

### 👤 3. Registered Citizens
- **Citizen 1**:
  - **Role**: `citizen` | **Name**: `Praveen`
  - **Email**: `praveen.iyu@gmail.com` | **Password**: `prachi`
  - **Portal Link**: [http://localhost:3000/citizen/dashboard](http://localhost:3000/citizen/dashboard)
- **Citizen 2**:
  - **Role**: `citizen` | **Name**: `Raj`
  - **Email**: `raj_1787383357570@example.com` | **Password**: `Password123`
  - **Portal Link**: [http://localhost:3000/citizen/dashboard](http://localhost:3000/citizen/dashboard)

---

## 🛠️ Verification & Execution Commands

### 1. Run Automated Security Test Suite
Tests 14 security scenarios (JWT tokens, password hashing, role matrix):
```bash
node scripts/test-auth-security.js
```

### 2. Verify MongoDB Atlas Cloud Documents
Queries and verifies all users, workers, and bins in MongoDB Atlas:
```bash
node scripts/verify-atlas.js
```

### 3. Build Production Webpack App
```bash
npm run build
```

### 4. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.
