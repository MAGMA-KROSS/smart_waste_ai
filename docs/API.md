# SmartWaste AI — API Reference Documentation

## Authentication Endpoints (`/api/auth`)

### 1. Citizen Registration
- **Method**: `POST`
- **Path**: `/api/auth/register`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "name": "Rahul Kumar",
    "email": "rahul@example.com",
    "password": "Password123"
  }
  ```
- **Server Behavior**: Ignores any `role` in the request body; always assigns `role = "citizen"`. Sets `swai_token` HttpOnly cookie.

### 2. Universal Login
- **Method**: `POST`
- **Path**: `/api/auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "rahul@example.com",
    "password": "Password123"
  }
  ```
- **Server Behavior**: Authenticates user against MongoDB, retrieves role from DB, returns user object, and sets `swai_token` HttpOnly cookie.

### 3. Logout
- **Method**: `POST`
- **Path**: `/api/auth/logout`
- **Access**: Public / Authenticated
- **Server Behavior**: Clears `swai_token` HttpOnly cookie (`maxAge = 0`).

### 4. Get Current Profile
- **Method**: `GET`
- **Path**: `/api/auth/me`
- **Access**: Authenticated (Any role)
- **Response**: Returns authenticated user info extracted from cookie token.

---

## Bin Management Endpoints (`/api/bins`)

### 1. Find Nearby Bins
- **Method**: `GET`
- **Path**: `/api/bins/nearby?lat=28.6215&lng=77.3640&radius=5&category=all`
- **Access**: Public / Citizen

### 2. Get Single Bin
- **Method**: `GET`
- **Path**: `/api/bins/:id`
- **Access**: Public / Citizen

---

## Reports Endpoints (`/api/reports`)

### 1. Submit Bin Issue Report
- **Method**: `POST`
- **Path**: `/api/reports`
- **Access**: Authenticated (Citizen, Worker, Admin)
- **Request Body**:
  ```json
  {
    "binId": "BIN-JSS-01",
    "binName": "JSS Main Gate 1 Smart Bin",
    "type": "overflow",
    "description": "Bin is completely full and spilling over."
  }
  ```

### 2. View My Reports
- **Method**: `GET`
- **Path**: `/api/reports/my`
- **Access**: Authenticated (Citizen)
- **Server Behavior**: Returns only reports submitted by the authenticated user ID.

---

## Worker Endpoints (`/api/worker`)

### 1. Worker Profile
- **Method**: `GET`
- **Path**: `/api/worker/profile`
- **Access**: Worker Only (`403 Forbidden` for Citizen)

### 2. Assigned Route
- **Method**: `GET`
- **Path**: `/api/worker/route`
- **Access**: Worker Only

### 3. Mark Bin Collected
- **Method**: `PATCH`
- **Path**: `/api/worker/bins/:id/collect`
- **Access**: Worker Only

---

## Admin Endpoints (`/api/admin`)

### 1. Municipal Command Dashboard
- **Method**: `GET`
- **Path**: `/api/admin/dashboard`
- **Access**: Admin Only (`403 Forbidden` for Citizen/Worker)

### 2. Create Worker Account
- **Method**: `POST`
- **Path**: `/api/admin/workers`
- **Access**: Admin Only
- **Request Body**:
  ```json
  {
    "name": "Amit Sharma",
    "email": "amit@municipality.gov",
    "employeeId": "MUN-1024",
    "department": "Waste Collection"
  }
  ```
- **Server Behavior**: Automatically assigns `role = "worker"`, generates a temporary password, and creates the Worker profile.

### 3. Generate Optimized Route
- **Method**: `POST`
- **Path**: `/api/admin/routes/generate`
- **Access**: Admin Only
- **Request Body**: `{ "minFillLevel": 60 }`
