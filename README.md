# 📦 AssetFlow — Enterprise Asset & Resource Management System

> **A secure, centralized ERP platform to track, allocate, and maintain physical assets and shared resources across an organization.**

Built with a **Node.js + Express backend**, a concurrency-locked JSON database, and a premium, high-fidelity **glassmorphism web frontend**, AssetFlow solves a critical vulnerability common in hackathon projects: client-side trust. All authentication, authorization, resource-booking constraints, and asset lifecycle state transitions are strictly validated and enforced **server-side** via JWT.

---

## 🚀 Hackathon Value Proposition

Most quick-built systems trust the client's self-declared role. AssetFlow is architected with enterprise-grade guards:
1. **Zero-Trust Auth**: The client never declares its role or ID. It presents a signed JWT, which the server decodes to identify permissions.
2. **Lifecycle State Machine Guard**: Prevent impossible states (e.g., a "Disposed" asset cannot suddenly become "Available" without going through procurement).
3. **Double-Allocation & Overlap Protection**: Strict conflict checks on asset assignment and booking scheduler (preventing double-booking down to the millisecond).
4. **Audit Discrepancy Reporting**: Complete auditing loops that auto-flag missing items and log actions to an append-only immutable activity log.

---

## 📐 System Architecture

```
                 +-----------------------------------------+
                 |            Browser Frontend             |
                 |      (Vanilla HTML5, CSS3, JS ES6)      |
                 +-----------------------------------------+
                                      |
                                      | fetch() with JWT Header
                                      | (Authorization: Bearer <JWT>)
                                      v
                 +-----------------------------------------+
                 |        Express REST Server (3000)       |
                 +-----------------------------------------+
                   |                  |                  |
            [Auth Middleware]  [Route Handlers]  [Upload Handler]
            Verify token &      Validate input    Multer storage
            decode roles        & logic guards     for attachments
                   |                  |                  |
                   +--------+---------+------------------+
                            |
                            v
                 +-----------------------------------------+
                 |            DB Controller (db.js)        |
                 |   - Concurrency Queue / proper-lockfile |
                 |   - State Transition Validation         |
                 |   - Allocation Conflict Engine          |
                 +-----------------------------------------+
                            |
                            v
                 +-----------------------------------------+
                 |         File Database (db.json)         |
                 +-----------------------------------------+
```

---

## 🛠 Tech Stack

* **Frontend**: Vanilla HTML5, CSS3 (Modern dark-mode, glassmorphism, responsive grid), Vanilla JS (ES6+), [Chart.js](https://www.chartjs.org/) via CDN for visual analytics.
* **Backend**: Node.js, Express.js.
* **Security & Auth**: `jsonwebtoken` (signed tokens), `bcryptjs` (password hashing).
* **File Handling**: `multer` for asset photo & maintenance report uploads.
* **Validation**: `express-validator` for API input verification.
* **Concurrency**: `proper-lockfile` (or a promise-based write queue) ensuring data integrity on `db.json` concurrent writes.

---

## 🌟 Key Features & Workflows

### 🛡️ 1. Multi-Role RBAC (Role-Based Access Control)
* **Admin**: Manage organization settings, departments, custom category schemas, employee directories, and promote roles.
* **Asset Manager**: Register new assets (with document/image uploads), approve allocations, manage maintenance workflows, and analyze system health.
* **Department Head**: Oversee department-specific assets, initiate internal asset transfers, and approve department bookings.
* **Employee / Technician**: View assigned assets, book shared resources (rooms/vehicles), report maintenance issues, and update maintenance task progress.

### 🔄 2. State-Machine Driven Asset Lifecycle
The server enforces a strict transition map for assets to prevent logical errors and fraud:

| From State | Allowed To States |
|---|---|
| **Available** | `Allocated`, `Reserved`, `UnderMaintenance`, `Retired` |
| **Allocated** | `Available`, `UnderMaintenance` |
| **Reserved** | `Allocated`, `Available` |
| **UnderMaintenance** | `Available`, `Retired`, `Lost` |
| **Lost** | `Disposed` |
| **Retired** | `Disposed` |
| **Disposed** | *(None - terminal state)* |

### 📅 3. Real-Time Resource Booking (Overlap Validation)
No double-booking. The booking engine performs immediate server-side overlap checks:
$$\text{Overlap Condition: } (\text{NewStart} < \text{ExistingEnd}) \land (\text{NewEnd} > \text{ExistingStart})$$
If a conflict is detected, the API rejects with a `400 Bad Request` and details the current holder, ensuring schedule integrity.

### 📝 4. Closed-Loop Audit Cycle
* Admins create an **Audit Cycle** specifying scope (e.g., IT department assets) and assigning an auditor.
* The auditor uses an interactive checklist to verify assets as `Verified`, `Missing`, or `Damaged`.
* Closing the cycle auto-generates a discrepancy report and transitions missing assets to `Lost` in the master register.

---

## 📁 Project Directory Structure

```
AssetManagementSystem/
├── server.js               # Express application entry point & middlewares
├── db.js                   # JSON DB controller, concurrency queue, state guards
├── db.json                 # Pre-seeded JSON database (Users, Assets, Logs, etc.)
├── package.json            # Node dependencies and npm scripts
├── public/                 # Static frontend files
│   ├── index.html          # Single Page Application core shell
│   ├── style.css           # Premium glassmorphism design system & styles
│   └── app.js              # Lightweight SPA router, API wrapper, & view logic
└── uploads/                # Directory for images and document uploads
```

---

## 🚦 Quick Start & Installation

### Prerequisites
* [Node.js](https://nodejs.org/) (v16+ recommended)
* npm (v7+ recommended)

### 1. Clone & Install Dependencies
```bash
git clone <repository-url> AssetManagementSystem
cd AssetManagementSystem
npm install
```

### 2. Seed Data & First Run
On the first boot, `server.js` automatically creates and populates `db.json` with a rich dataset:
* **10+ Pre-populated Assets** (IT equipment, vehicles, conference rooms).
* **6 Demo Users** with pre-configured roles.
* **Historical Data** (completed bookings, active maintenance logs, past activity records).

### 3. Start the Server
For development (with hot-reload):
```bash
npm run dev
```

For production/standard execution:
```bash
npm start
```
The server will start on **`http://localhost:3000`**. Open this URL in your web browser.

---

## 🔑 Demo Login Credentials
For judging convenience, the frontend contains a **Dev Console / Role Switcher**. Clicking any user automatically executes a real `/api/auth/login` request using the credentials below:

| Name | Role | Email | Password |
|---|---|---|---|
| **Sarah Jenkins** | Admin | `admin@assetflow.com` | `Demo@123` |
| **Marcus Vance** | Asset Manager | `manager@assetflow.com` | `Demo@123` |
| **Elena Rostova** | Dept Head (IT) | `elena.it@assetflow.com` | `Demo@123` |
| **David Kim** | Employee | `david@assetflow.com` | `Demo@123` |
| **Priya Patel** | Employee | `priya@assetflow.com` | `Demo@123` |

---

## 📡 API Documentation Summary

### 🔐 Authentication
* `POST /api/auth/signup` - Register a new employee (Defaults to `Employee` role).
* `POST /api/auth/login` - Authenticate email/password. Returns JWT `{ token, user: { id, name, role } }`.
* `POST /api/auth/forgot-password` - Simulates a password reset loop.

### 🏢 Organization & Personnel
* `GET /api/departments` - Retrieve department hierarchy.
* `POST /api/departments` - Create new department (Admin only).
* `GET /api/employees` - View employee listing.
* `POST /api/employees/:id/promote` - Promote an employee's role (Admin only; immutable log triggered).

### 📦 Asset Inventory & Lifecycle
* `GET /api/assets` - Get list of assets (filterable by category, department, location, status, tag).
* `POST /api/assets` - Register asset + upload photo (Asset Manager only).
* `GET /api/assets/:id/history` - Fetch full combined timeline (allocations, maintenance, movements).

### 🤝 Allocation & Bookings
* `POST /api/allocations` - Assign an asset (Fails if not in `Available` state).
* `POST /api/allocations/:id/return` - Check-in asset (Captures condition report).
* `POST /api/transfers` - Request an asset transfer between users/departments.
* `POST /api/bookings` - Book shared resource (Fails on time overlap).

### 🔧 Maintenance
* `POST /api/maintenance` - Raise a repair request.
* `PUT /api/maintenance/:id/status` - Move request state (Triggers asset status flips).

### 📋 Audits & Reports
* `POST /api/audits` - Create audit scope (Admin only).
* `POST /api/audits/:id/items` - Mark audit item status (Assigned auditor only).
* `POST /api/audits/:id/close` - Calculate discrepancies, transition missing to `Lost` (Admin only).
* `GET /api/reports` - Aggregates utilization charts, maintenance heatmaps, and category breakdowns.

---

## 🎨 Premium Visual Polish (UX highlights)
* **Glassmorphism UI**: Deep, sleek slate surfaces (`#161d30`) floating on a rich dark background (`#0b0f19`) with high-contrast indicator highlights (indigo and mint).
* **Dynamic Sidebar Navigation**: Adapts layout and elements in real time based on active JWT decoded role.
* **Activity Stream**: Micro-animations on logs and notifications.
* **Analytical Heatmap**: Chart.js charts displaying peak booking hours and resource utilization visually.
