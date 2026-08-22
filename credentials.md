# SmartWaste AI — Master Credentials & Workflow Specification

This document contains the official credentials, role access details, microservice architecture sitemap, and operational workflow guide for **SmartWaste AI**.

---

## 🏛️ System Architecture Summary

The backend is organized into **3 top-level domain microservices**:

```
smart_waste_ai/
├── 🔐 auth-service/        # SERVICE 1: Centralized Auth & RBAC Microservice
├── 🤖 ai-llm-service/      # SERVICE 2: Isolated AI/LLM Service (For AI team member)
├── 🧠 brain-service/       # SERVICE 3: Main Core Workflow Service
│   ├── admin/             # Admin Command Center Workflows
│   ├── workers/           # Worker Operations & Route Tracking
│   ├── bins/              # Bin Management & Geospatial Logic
│   ├── reports/           # Issue Reporting Logic
│   ├── routes/            # Collection Route Optimization
│   └── analytics/         # System Analytics & Dashboard Metrics
├── src/                    # Frontend Pages & Next.js API Gateway
├── docs/                   # System Documentation
└── scripts/                # Administrative & Seed Scripts
```

---

## 📋 Master Credentials Directory

All accounts below are provisioned and stored in your **MongoDB Atlas Cloud Database (`smart_waste_ai.users`)**:

### 🏛️ 1. Main Municipal Admin
- **Role**: `admin`
- **Name**: `Municipal Admin`
- **Email**: `admin@smartwaste.local`
- **Password**: `Admin@SmartWaste2026`
- **Portal URL**: `http://localhost:3000/admin` (or log in via `/citizen/login`)

---

### 🚚 2. Municipal Workers

#### Worker 1 (North Zone)
- **Role**: `worker`
- **Name**: `Ramesh Kumar`
- **Employee ID**: `MUN-1001`
- **Email**: `worker1@smartwaste.local`
- **Password**: `Worker@SmartWaste2026`
- **Portal URL**: `http://localhost:3000/worker`

#### Worker 2 (South Zone)
- **Role**: `worker`
- **Name**: `Suresh Singh`
- **Employee ID**: `MUN-1002`
- **Email**: `worker2@smartwaste.local`
- **Password**: `Worker@SmartWaste2026`
- **Portal URL**: `http://localhost:3000/worker`

---

### 👤 3. Registered Citizens

#### Citizen 1 (Praveen)
- **Role**: `citizen`
- **Name**: `Praveen`
- **Email**: `praveen.iyu@gmail.com`
- **Password**: `prachi`
- **Portal URL**: `http://localhost:3000/citizen/dashboard`

#### Citizen 2 (Raj)
- **Role**: `citizen`
- **Name**: `Raj`
- **Email**: `raj_1787383357570@example.com`
- **Password**: `Password123`
- **Portal URL**: `http://localhost:3000/citizen/dashboard`

---

## 🔄 Real-World Operational Workflow

### 1. 👤 Citizen Role (`/citizen/find-bin` & `/citizen/dashboard`)
- **Find Bins**: Search and navigate to nearby dustbins using the interactive Leaflet GPS map.
- **Add Dustbin**: Suggest new dustbin locations (saved directly to MongoDB Atlas `bins` collection via `POST /api/bins`).
- **Report Problem**: Report overflowing, damaged, or blocked bins via the **"Report Bin Problem"** modal.

### 2. 🏛️ Admin Role (`/admin`)
- **Monitor City Infrastructure**: View live dustbin fill levels, critical fill counts, and citizen issue reports.
- **AI Route Generation**: Click **"Generate AI Route"** to calculate greedy nearest-neighbor pickup sequences for full bins.
- **Dispatch**: Assign generated collection routes to Municipal Workers.
- **Provision Staff**: Create new worker accounts with generated temporary credentials.

### 3. 🚚 Worker Role (`/worker`)
- **Active Shift**: View assigned collection routes, dustbin addresses, and turn-by-turn map directions.
- **Mark Collected**: Click **"Mark Collected"** after physically emptying each dustbin, resetting fill level to **0%** in MongoDB Atlas and updating the live map instantly.

---

## 🌐 Quick Application Sitemap

| Route | Purpose | Target Access |
|---|---|---|
| `/` | Landing Showcase Page | Public |
| `/citizen/find-bin` | Live Interactive Leaflet Map | Public / Citizen |
| `/citizen/login` | Universal Login Page | All Roles |
| `/citizen/register` | Public Citizen Registration | Citizen |
| `/citizen/dashboard` | Citizen Portal & Issue Tracking | Authenticated Citizen |
| `/worker` | Worker Driver Route Portal | Authenticated Worker |
| `/admin` | Municipal Command Center | Authenticated Admin |
