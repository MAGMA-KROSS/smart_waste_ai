# ♻️ SmartWaste AI — Intelligent Civic Waste Management Platform

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3.1-black?logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2.8-blue?logo=react)](https://react.dev/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas%20Cloud-green?logo=mongodb)](https://www.mongodb.com/atlas)
[![Google Gemini AI](https://img.shields.io/badge/Google%20Gemini-3.6%20Flash-4285F4?logo=google)](https://ai.google.dev/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind-CSS%204-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

**SmartWaste AI** is a production-grade, AI-powered civic technology ecosystem connecting citizens, municipal authorities, and waste-collection workers. It combines real-time computer vision, large language models, interactive GIS mapping, and intelligent routing to revolutionize urban waste management and recycling.

---

## 📚 Master Documentation Directory

| Document | Topic | Description |
|---|---|---|
| 🔐 **[`README-AUTH.md`](README-AUTH.md)** | **Authentication & Security** | `jose` JWTs, `bcryptjs` password hashing, `HttpOnly` security cookies, server-enforced RBAC, and Edge route protection middleware. |
| 🧠 **[`README-BRAIN.md`](README-BRAIN.md)** | **Brain Core Microservice** | 6 domain sub-services (`admin`, `workers`, `bins`, `reports`, `routes`, `analytics`), nearest-neighbor route optimization, geospatial queries, and MongoDB Atlas schemas. |
| 💻 **[`README-SRC.md`](README-SRC.md)** | **Frontend & UI Systems** | Next.js 16 App Router portals (Citizen, Worker, Admin), Leaflet OpenStreetMap with polyline routing, and Next.js `<Link>` SPA navigation. |
| 🤖 **[`ai-llm-service/README.md`](ai-llm-service/README.md)** | **AI / LLM Microservice** | YOLO11s computer-vision, Google Gemini 3.6 Flash multimodal vision, safety rule engine, and YouTube tutorial video search. |

---

## 🏛️ System Architecture

```mermaid
graph TD
    Client[Client Browser / Multi-Role Portals] --> Gateway[Next.js App Router API Gateway /src/app/api/*]
    
    subgraph Microservices Architecture
        Gateway --> AuthSvc[🔐 Authentication Microservice /auth-service]
        Gateway --> BrainSvc[🧠 Brain Core Microservice /brain-service]
        Gateway --> AISvc[🤖 AI / LLM Microservice /ai-llm-service]
    end

    subgraph AI & Vision Pipelines
        AISvc --> FastAPI[🐍 FastAPI / YOLO11s-cls (Port 8000)]
        AISvc --> GeminiAPI[✨ Google Gemini 3.6 Flash API]
        AISvc --> YouTubeAPI[📺 YouTube Data API v3]
    end

    subgraph Data & Cloud Layer
        AuthSvc --> MongoDB[(MongoDB Atlas Cloud DB)]
        BrainSvc --> MongoDB
    end
```

---

## ✨ Key Features & Capabilities

### 🔍 1. AI Waste Scanner & Multi-Model Vision
- **Dual Classification Engine**: Classifies waste images using a local **YOLO11s-cls** neural network (FastAPI) or automatically falls back to **Google Gemini 3.6 Flash Multimodal Vision** with zero configuration required.
- **Verified Knowledge Base**: Real facts covering recyclability, materials, and safety guidelines for 10+ waste categories (`plastic_bottle`, `aluminium_can`, `glass_bottle`, `e_waste`, `food_waste`, etc.).
- **Hazard & Safety Rules**: Prevents dangerous DIY upcycling instructions for hazardous materials (e-waste, batteries, chemicals).
- **Gemini DIY Upcycling**: Generates custom, creative upcycling craft ideas based on item count and waste type.
- **YouTube Tutorials**: Fetches real, high-quality craft and upcycling video guides via the YouTube Data API v3.

### 🗺️ 2. Citizen GIS Bin Locator
- Live GPS user location detection and radius-based nearest bin search.
- Interactive **Leaflet OpenStreetMap** with custom category pins (General, Recyclable, Organic, Glass, E-Waste).
- Real-time fill levels, walking distance, turn-by-turn routing, and directions modal.

### 🚛 3. Municipal Worker Portal
- Shift dashboard displaying assigned collection routes and assigned smart bins.
- One-click collection verification (`PATCH /api/worker/bins/:id/collect`) resetting bin fill levels to 0%.
- Real-time incident and overflow reporting.

### 📊 4. Municipal Admin Operations Center
- Live city-wide analytics: total bins, average fill capacity, critical overflow alerts, active worker fleet.
- **Automated Route Optimization**: Greedy Nearest-Neighbor Traveling Salesperson (TSP) algorithm calculating optimal collection routes based on high-fill bins (>= 70%).
- Full worker fleet provisioning and incident report management.

---

## 🛠️ Environment Configuration

Create a `.env.local` file in the root directory:

```env
# ==============================================================================
# SmartWaste AI - Environment Configuration
# ==============================================================================

# JWT Secret for cookie authentication & session tokens
JWT_SECRET=smart_waste_ai_jwt_secret_key_development_2026_secure_token

# MongoDB Atlas Connection URI
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.00hcmqw.mongodb.net/smart_waste_ai?retryWrites=true&w=majority

# Google Gemini API Key (for Multimodal Vision & Recommendations)
GEMINI_API_KEY=your_gemini_api_key_here

# YouTube Data API v3 Key (for Upcycling Video Tutorials)
YOUTUBE_API_KEY=your_youtube_api_key_here

# FastAPI ML Microservice (Optional: Default http://localhost:8000)
ML_SERVICE_URL=http://localhost:8000

# Waste classification confidence threshold (0.0 to 1.0)
WASTE_CONFIDENCE_THRESHOLD=0.70
```

---

## 🚀 Quick Start Guide

### 1. Install Node.js Dependencies
```bash
npm install
```

### 2. Seed Database (MongoDB Atlas)
Initialize your Atlas database with municipal admin, worker accounts, and 24 smart bins across city zones:
```bash
node scripts/seed-admin.js
node scripts/seed-bins.js
node scripts/seed-workers.js
```

### 3. Start Next.js Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐍 Optional: Run Local YOLO ML Service (Python)

If you want to run the local YOLO11s-cls computer vision model locally alongside Gemini:

```bash
cd ml-service
pip install -r requirements.txt
python -c "from ultralytics import YOLO; YOLO('yolo11s-cls.pt')"
# Move yolo11s-cls.pt to ml-service/models/
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## ☁️ Vercel Deployment Checklist

When deploying on **Vercel**:

1. **MongoDB Atlas IP Access**: Go to [MongoDB Atlas](https://cloud.mongodb.com) -> **Network Access** and ensure `0.0.0.0/0` (Allow access from anywhere) is active.
2. **Vercel Environment Variables**: Go to **Project Settings** -> **Environment Variables** and add:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `GEMINI_API_KEY`
   - `YOUTUBE_API_KEY`
   - `WASTE_CONFIDENCE_THRESHOLD`
3. Deploy directly via Git push to `master`.

---

## 👥 Default Testing Accounts

| Role | Email | Password | Access URL |
|:---:|---|---|---|
| **Citizen** | `ry7437901@gmail.com` | `rajyadav123` | `/citizen/dashboard` |
| **Worker** | `worker1@smartwaste.local` | `Worker@SmartWaste2026` | `/worker` |
| **Worker 2** | `worker2@smartwaste.local` | `Worker@SmartWaste2026` | `/worker` |
| **Admin** | `admin@smartwaste.local` | `Admin@SmartWaste2026` | `/admin` |

---

## 🧪 Testing & Verification Scripts

```bash
# Verify all microservices:
node scripts/test-all-microservices.js

# Check all database accounts:
node scripts/list-all-accounts.js

# Deep database audit:
node scripts/deep-db-check.js

# Production build test:
npm run build
```

---

## 📄 License
This project is licensed under the MIT License — designed for smart cities and sustainable civic innovation.
