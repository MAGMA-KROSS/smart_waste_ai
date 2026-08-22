# ♻️ SmartWaste AI — Intelligent Civic Waste Management Platform

Welcome to **SmartWaste AI**, a modern, AI-powered smart civic technology platform connecting citizens, municipal authorities, and waste-collection workers into a unified, intelligent recycling ecosystem.

---

## 📚 Master Documentation Directory

All comprehensive architectural, security, and frontend documentation files are located directly in the root directory:

| Document | Topic | Description |
|---|---|---|
| 🔐 **[`README-AUTH.md`](README-AUTH.md)** | **Authentication & Security** | `jose` JWTs, `bcryptjs` password cryptography, `HttpOnly` security cookies, server-enforced RBAC, and Edge route protection middleware (`src/middleware.js`). |
| 🧠 **[`README-BRAIN.md`](README-BRAIN.md)** | **Brain Core Microservice** | 6 domain sub-services (`admin`, `workers`, `bins`, `reports`, `routes`, `analytics`), greedy nearest-neighbor AI route optimization algorithm, geospatial queries, and MongoDB Atlas schemas. |
| 💻 **[`README-SRC.md`](README-SRC.md)** | **Frontend & API Gateway** | Next.js 16 App Router portals (Citizen, Worker, Admin), Leaflet OpenStreetMap interactive GPS map with polyline routing, and API gateway handlers (`src/app/api/`). |

---

## 🏛️ Architecture Overview

```mermaid
graph TD
    Client[Client Browser / User Portals] --> Gateway[Next.js App Router API Gateway /src/app/api/*]
    
    subgraph Microservices Architecture
        Gateway --> AuthSvc[🔐 Authentication Microservice /auth-service]
        Gateway --> BrainSvc[🧠 Brain Core Microservice /brain-service]
        Gateway --> AISvc[🤖 AI / LLM Microservice /ai-llm-service]
    end

    subgraph Data & Storage Layer
        AuthSvc --> MongoDB[(MongoDB Atlas Cloud DB)]
        BrainSvc --> MongoDB
    end
```

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- **Node.js**: `v18.x` or `v20.x`
- **npm**: `v9.x` or `v10.x`
- **MongoDB Atlas**: Active cluster connection string

### 2. Environment Setup
Copy the environment template and set your credentials:
```bash
cp .env.local.example .env.local
```

Ensure `.env.local` contains:
```env
MONGODB_URI=mongodb+srv://sangeetampec_db_user:Fv7RXbDFbWUEoNUa@aicluster.foew8y4.mongodb.net/smart_waste_ai?retryWrites=true&w=majority&appName=AIcluster
JWT_SECRET=super-secret-jwt-key-smart-waste-ai-2026-secure
NODE_ENV=development
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Verification & Test Suites

Execute any of the pre-configured standalone test suites:

```bash
# 1. Test All Microservices (Auth, AI/LLM, Brain Core):
node scripts/test-all-microservices.js

# 2. Deep MongoDB Atlas Database & Schema Model Audit:
node scripts/deep-db-check.js

# 3. Test RBAC Security & Authentication Matrix:
node scripts/test-auth-security.js

# 4. Production Webpack Build:
npm run build
```

---

## 👥 Verified Testing Credentials

| Portal | Role | Email | Password | Dashboard URL |
|---|:---:|---|---|---|
| **Citizen** | `citizen` | `ry7437901@gmail.com` | `rajyadav123` | `/citizen/dashboard` |
| **Worker** | `worker` | `worker1@smartwaste.local` | `Worker@SmartWaste2026` | `/worker` |
| **Admin** | `admin` | `admin@smartwaste.local` | `Admin@SmartWaste2026` | `/admin` |
