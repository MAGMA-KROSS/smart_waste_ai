# 💻 SmartWaste AI — Frontend & Gateway Application (`src/`)

Welcome to the **Frontend Portals & API Gateway Application** (`src/`) documentation for **SmartWaste AI**. Built on **Next.js 16 (App Router)** and **Tailwind CSS v4**, this application serves as the user-facing interface for Citizens, Municipal Workers, and City Admins while proxying requests cleanly to domain microservices.

---

## 🏛️ Directory Structure & Module Blueprint

```
src/
├── 🌐 app/                     # Next.js 16 App Router pages & API gateway
│   ├── page.js                 # Landing Page / Showcase
│   ├── get-started/page.js     # Role Onboarding Redirect (/citizen/register)
│   ├── citizen/                # Citizen Domain Portal
│   │   ├── dashboard/page.js   # Citizen Dashboard & Quick Actions
│   │   ├── find-bin/page.js    # Interactive OpenStreetMap GPS Map
│   │   ├── login/page.js       # Unified Authentication Portal
│   │   └── register/page.js    # Citizen Registration Form
│   ├── worker/page.js          # Municipal Worker Route Portal
│   ├── admin/page.js           # Command Center Admin Dashboard
│   ├── api/                    # Microservice API Gateway Proxy Handlers
│   │   ├── auth/               # Proxies to @auth/controllers/auth.controller.js
│   │   ├── admin/              # Proxies to @brain/admin, @brain/routes, etc.
│   │   ├── bins/               # Proxies to @brain/bins
│   │   ├── reports/            # Proxies to @brain/reports
│   │   ├── worker/             # Proxies to @brain/workers
│   │   └── waste/              # Proxies to @ai/controllers/waste.controller.js
│   └── middleware.js           # Edge JWT Security & Role Protection Middleware
│
├── 🎨 components/              # Reusable React UI Components
│   ├── Navbar.js               # Responsive Header with Role Actions & Auth state
│   ├── AddBinModal.js          # Modal to suggest/add new dustbin locations to Atlas
│   ├── ReportModal.js          # Modal to report overflowing/damaged bin problems
│   ├── StatCard.js             # Dashboard Metric Cards
│   └── MapWrapper.js           # Dynamic Leaflet OpenStreetMap Container
│
└── 🛠️ lib/                     # Client Utilities & Database Connection
    ├── mongodb.js              # Mongoose Atlas connection singleton (IPv4 order fix)
    ├── mockBins.js             # Initial 18 Delhi smart bins telemetry dataset
    └── geoUtils.js             # Haversine distance calculator
```

---

## 🎨 User Portal Specifications & User Journeys

```mermaid
graph TD
    User([User Arrival]) --> Landing[Landing Page /]
    Landing -->|Click Get Started| GetStarted[/get-started Redirect]
    GetStarted --> Register[/citizen/register]
    Register -->|Submit Registration| Dashboard[/citizen/dashboard]

    Landing -->|Click Sign In| Login[/citizen/login]
    Login -->|Authenticate| RoleCheck{Check JWT Role}

    RoleCheck -->|role === citizen| CitizenDash[/citizen/dashboard]
    RoleCheck -->|role === worker| WorkerPortal[/worker]
    RoleCheck -->|role === admin| AdminPortal[/admin]

    CitizenDash --> FindBin[/citizen/find-bin Leaflet Map]
    CitizenDash --> ReportIssue[Open ReportModal]
    CitizenDash --> AddBin[Open AddBinModal]

    AdminPortal --> GenRoute[Generate AI Route]
    AdminPortal --> AssignWorker[Assign Route to Worker]

    WorkerPortal --> NavRoute[View Assigned Route]
    WorkerPortal --> MarkCollected[Click Mark Collected -> Reset Fill to 0%]
```

---

## 🗺️ Leaflet OpenStreetMap & Polyline Routing Integration

The **Find Bin Map** (`/citizen/find-bin`) renders an interactive Leaflet GPS map with real-time location features:

- **GPS User Marker**: Green pulsing dot indicating current user coordinates.
- **Color-Coded Bin Pins**:
  - 🟢 **Green Pin**: Low Fill Level ($<50\%$)
  - 🟡 **Yellow Pin**: Moderate Fill Level ($50\% - 79\%$)
  - 🔴 **Red Pin**: Critical Fill Level ($\ge 80\%$)
- **Walking Polyline**: Clicking **"Navigate to Bin"** calculates distance using the Haversine formula and draws a dashed walking path from the user's location to the selected dustbin.

---

## 🔌 API Gateway Architecture

The Next.js App Router API gateway (`src/app/api/`) acts as a clean proxy layer connecting frontend requests to path-aliased microservices:

```javascript
// Path Aliases configured in jsconfig.json:
// "@auth/*"  ->  "./auth-service/*"
// "@brain/*" ->  "./brain-service/*"
// "@ai/*"    ->  "./ai-llm-service/*"
```

### Gateway Handler Pattern:
```javascript
// src/app/api/auth/login/route.js
import { authController } from "@auth/controllers/auth.controller.js";

export async function POST(request) {
  return authController.login(request);
}
```

---

## 🔒 Authentication Cookie Handling & Client Navigation

To guarantee that `Set-Cookie` headers (`swai_token`) issued by `auth-service` are immediately available across client components without stale route caching, form submissions (`RegisterPage`, `LoginPage`) execute a **hard window navigation**:

```javascript
// src/app/citizen/register/page.js & login/page.js
const res = await fetch("/api/auth/login", { ... });
if (res.ok) {
  // Hard redirect guarantees swai_token cookie is attached on next request
  window.location.href = "/citizen/dashboard";
}
```

---

## ⚙️ Next.js 16 Webpack Build Requirement

Due to pre-release Turbopack PostCSS processing behavior in Next.js 16 with Tailwind CSS v4, `package.json` scripts are explicitly configured to compile via Webpack (`--webpack`):

```json
{
  "scripts": {
    "dev": "next dev --webpack",
    "build": "next build --webpack"
  }
}
```

This guarantees **100% clean compilation** across all 31 static and dynamic routes with 0 errors.
