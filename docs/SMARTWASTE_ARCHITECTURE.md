# SmartWaste AI — Official Architecture Specification

## 1. Overview
SmartWaste AI is an intelligent waste-management and civic participation platform. It features centralized authentication, server-enforced role-based access control (RBAC), domain-driven service modularity, and preserved frontend user flows.

## 2. Microservice-Ready Architecture Structure
The application follows a modular microservice-ready pattern cleanly organized into logical domains:

```
smart_waste_ai/
├── auth-service/                  # Centralized Auth & RBAC Microservice
│   ├── controllers/
│   ├── middleware/
│   ├── services/
│   ├── utils/
│   └── validators/
├── ai-llm-service/                 # Isolated AI/LLM Microservice (Stub)
│   ├── controllers/
│   ├── services/
│   └── validators/
├── src/
│   ├── models/                    # Unified Mongoose Models (User, Worker, Admin, Bin, Report, Route)
│   ├── services/brain/            # Brain Domain Services
│   │   ├── bins/
│   │   ├── reports/
│   │   ├── workers/
│   │   ├── routes/
│   │   └── analytics/
│   ├── app/
│   │   ├── api/                   # Next.js API Routes (Serverless Gateway)
│   │   ├── citizen/               # Citizen Frontend Portal & Login/Register
│   │   ├── worker/                # Worker Operational Dashboard
│   │   └── admin/                 # Municipal Admin Command Center
│   ├── components/                # Preserved UI Components
│   ├── lib/                       # Geo utilities, MongoDB client, Auth Context
│   └── middleware.js              # Edge Middleware for Route Protection
```

## 3. Centralized Auth & RBAC
- **One Auth System**: Serves Citizens, Workers, and Admins via `POST /api/auth/login`.
- **Roles**: `citizen`, `worker`, `admin`.
- **Role Determination**: The backend determines user roles strictly from MongoDB during login.
- **Server Enforcement**: API routes return `401 Unauthorized` or `403 Forbidden` regardless of client state.
- **Tokens & Cookies**: Authenticated sessions issue JWTs stored in `HttpOnly`, `SameSite=Lax` cookies named `swai_token`.

## 4. Domain Responsibilities
- **Auth Service**: User identity, registration, login, JWT verification, role assignment.
- **Bins Domain**: Bin CRUD, spatial queries, mock fallback, fill level tracking.
- **Reports Domain**: Issue submission, ownership verification, status management.
- **Workers Domain**: Worker profiles, route assignments, bin collection tracking.
- **Routes Domain**: Collection route generation via greedy nearest-neighbor algorithm.
- **Analytics Domain**: Real-time municipal dashboard metrics and system statistics.
- **AI/LLM Service**: Placeholder for waste scanning, material recognition, and upcycling recommendations.
