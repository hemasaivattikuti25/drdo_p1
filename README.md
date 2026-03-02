# 🛡️ DRDO DAMS — Defence Asset Management System

**Full-Stack Application with Distributed MongoDB Replica Set**

> Built at **Defence Research & Development Laboratory (DRDL), Hyderabad** — DRDO, Ministry of Defence, Govt. of India.
>
> Internship Project · Aug–Nov 2025 · Supervised by **Shri. Srijan Tripathi, Scientist 'E'**

---

## ⚠️ Important — Demo / Academic Project Notice

> **DUMMY / SEEDED DATABASE**: The database is pre-populated with **simulated DRDO equipment data** (12 lab
> instruments seeded via `backend/seeder.py`). No real asset records, classified data, or sensitive information
> is stored. All equipment entries, prices, and personnel details are fictional and created for demonstration purposes.
>
> **PLACEHOLDER FRONTEND**: The React frontend is a **prototype UI** built to demonstrate the backend architecture.
> It is not connected to any live government systems. Admin credentials and JWT secrets in this repo are for
> local/demo use only and must be changed before any real deployment.
>
> **MY PRIMARY CONTRIBUTION**: The **FastAPI backend**, the **MongoDB Replica Set architecture** (3-node hot
> redundancy with automatic failover), and the **Docker Compose orchestration** are the core deliverables of
> this internship. The frontend serves as a visual demonstration layer.

---

## 👨‍💻 Developer

**Hemasai Vattikuti** (`@hemasaivattikuti25`) — B.Tech CSE, VIT-AP

**Key Contributions:**
- ✅ **FastAPI backend** — all routers: Auth, Equipment, Requisitions, Payments, Admin
- ✅ **MongoDB Replica Set** — 3-node hot redundancy, automatic PRIMARY election
- ✅ **Distributed DB Manager** (`config/database.py`) — mode-switching & automatic failover
- ✅ **Health Monitor** (`utils/health_monitor.py`) — CPU temp monitoring, auto DB failover
- ✅ **Docker Compose** — full stack orchestration (3×MongoDB + API + nginx/React)
- ✅ **Seeder** (`seeder.py`) — dummy DRDO equipment data for demonstration

---

## 📐 Architecture

```
┌──────────────────────────────────────────────────────────────┐
│        React Frontend (prototype UI) + nginx                  │
│                    http://localhost:3000                       │
└───────────────────────┬──────────────────────────────────────┘
                        │  /api/*  (nginx reverse proxy)
┌───────────────────────▼──────────────────────────────────────┐
│           FastAPI Backend (Python 3.11) ← PRIMARY WORK        │
│           Uvicorn · Port 8000 · Rate-Limited (slowapi)        │
│   Routers: /products  /auth  /orders  /payment  /admin        │
│   Health Monitor: DB ping + CPU temp every 30s               │
└──────┬──────────────────┬──────────────────┬─────────────────┘
       │                  │                  │
┌──────▼──────┐  ┌────────▼──────┐  ┌───────▼────────┐
│  MongoDB    │  │  MongoDB      │  │  MongoDB       │
│  Node 1     │  │  Node 2       │  │  Node 3        │
│  PRIMARY ★  │  │  SECONDARY    │  │  SECONDARY     │
│  :27017     │  │  :27018       │  │  :27019        │
└─────────────┘  └───────────────┘  └────────────────┘
         ╰─────────── Replica Set rs0 ─────────────╯
              Automatic election · 2-of-3 quorum
```

### Hot Redundancy & Automatic Failover
- If PRIMARY goes down → secondaries elect a new PRIMARY in **< 10 seconds**
- **2-of-3 quorum**: cluster stays writable even with one node failure
- FastAPI `db_manager` automatically reconnects; zero application downtime
- **Fallback chain**: `replica` → `standalone` (single node) if all replicas fail

---

## 🚀 Quick Start (Docker — Recommended)

> One command starts everything: 3 MongoDB nodes + FastAPI backend + React frontend.

```bash
# 1. Clone
git clone https://github.com/hemasaivattikuti25/drdo_p1.git
cd drdo_p1

# 2. Start full stack
docker compose up --build

# Wait ~45 seconds for replica set initialization, then:
#   Frontend:  http://localhost:3000
#   API Docs:  http://localhost:8000/docs
#   DB Status: http://localhost:8000/api/v1/admin/db-status  (admin login required)
```

To stop:
```bash
docker compose down        # stop containers
docker compose down -v     # stop + delete DB volumes
```

### Seed Dummy Data (auto-runs on first boot via seeder in Docker)
```bash
# Manual seed:
cd backend
python seeder.py              # seed 12 dummy equipment items + admin user

# Admin credentials (dummy — change in production):
#   Email:    admin@drdl.drdo.gov.in
#   Password: Drdo@2025
```

---

## 🔌 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/register` | Register new user |
| `POST` | `/api/v1/login` | Login, returns JWT |
| `GET`  | `/api/v1/logout` | Logout |
| `GET`  | `/api/v1/myprofile` | Get authenticated user |
| `PUT`  | `/api/v1/update` | Update profile |
| `PUT`  | `/api/v1/password/change` | Change password |

### Equipment (Products)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/v1/products` | List equipment (paginated, filterable) |
| `GET`  | `/api/v1/product/:id` | Get equipment details |
| `POST` | `/api/v1/admin/product/new` | Register new equipment (admin) |
| `PUT`  | `/api/v1/admin/product/:id` | Update equipment (admin) |
| `DELETE` | `/api/v1/admin/product/:id` | Remove from registry (admin) |

### Requisitions (Orders)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/order/new` | Submit new requisition |
| `GET`  | `/api/v1/myorders` | List my requisitions |
| `GET`  | `/api/v1/admin/orders` | All requisitions (admin) |
| `PUT`  | `/api/v1/admin/order/:id` | Update requisition status |

### Admin / Database Control ⭐
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/v1/admin/dashboard` | Stats: equipment, requisitions, users, value |
| `GET`  | `/api/v1/admin/db-status` | **Replica Set status** — PRIMARY/SECONDARY, uptime |
| `POST` | `/api/v1/admin/switch-db` | **Manual failover** — switch replica ↔ standalone |
| `GET`  | `/api/v1/admin/health` | DB ping + CPU temperature |

---

## ⚙️ Distributed Database — Key Features (Primary Contribution)

### MongoDB Replica Set (3 nodes)
```
mongo1 → PRIMARY   (priority 3)  — handles all writes
mongo2 → SECONDARY (priority 2)  — hot standby, ready to elect
mongo3 → SECONDARY (priority 1)  — additional redundancy
```

### Smart DB Manager (`backend/config/database.py`)
```python
# Tries replica set first; automatically falls back to standalone
await db_manager.connect("replica")     # preferred
await db_manager.connect("standalone")  # automatic fallback

# Manual switch via API
POST /api/v1/admin/switch-db  {"mode": "standalone"}
POST /api/v1/admin/switch-db  {"mode": "replica"}
```

### Health Monitor (`backend/utils/health_monitor.py`)
- Background asyncio task — runs from startup
- Pings DB every **30 seconds**, reads uptime + host
- Reads **CPU temperature** (Linux thermal zone)
- If temp > **80°C**: auto-switch to standalone (reduces DB load)
- If replica ping fails: auto-reconnect to standalone

---

## 🧪 Failover Demo

```bash
# 1. Check replica status (need admin JWT)
curl -H "Authorization: Bearer <token>" http://localhost:8000/api/v1/admin/db-status

# 2. Stop the primary node (simulate hardware failure)
docker stop dams-mongo1

# 3. Watch election — mongo2 becomes PRIMARY in ~10s
docker logs dams-mongo2 --tail 20

# 4. App keeps running (db_manager auto-reconnects)
# 5. Restart old primary — it rejoins as SECONDARY
docker start dams-mongo1
```

---

## 🛠️ Manual / Development Setup

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm start   # → http://localhost:3000

# Local replica set (3 nodes)
./scripts/start-local-replica.sh
```

---

## 📁 Project Structure

```
drdo_p1/
├── backend/                    FastAPI Python backend  ← PRIMARY WORK
│   ├── config/
│   │   └── database.py         ★ Distributed DB Manager (failover logic)
│   ├── routers/
│   │   ├── product.py          Equipment CRUD + search + reviews
│   │   ├── auth.py             JWT auth, password reset
│   │   ├── order.py            Requisition lifecycle
│   │   ├── payment.py          Payment reference handler
│   │   └── admin.py            ★ Dashboard, DB status, manual failover
│   ├── utils/
│   │   ├── health_monitor.py   ★ Background health check + auto-failover
│   │   ├── jwt.py              JWT token creation/validation
│   │   └── email.py            SMTP email (password reset)
│   ├── seeder.py               ★ Dummy equipment data loader (12 items)
│   └── Dockerfile
├── frontend/                   React SPA (prototype UI — demo layer)
│   ├── src/
│   │   └── components/
│   │       ├── admin/          Director's Panel, Equipment Registry
│   │       ├── cart/           Asset Request Form
│   │       └── layouts/        DRDO DAMS Header + Footer
│   ├── nginx.conf              Reverse proxy → backend
│   └── Dockerfile
├── scripts/
│   ├── mongo-init-replica.js   ★ Docker replica set initialiser
│   └── start-local-replica.sh  Local 3-node startup
└── docker-compose.yml          ★ Full stack: 3×MongoDB + API + Frontend
```

---

## 🏛️ DRDO Context

Developed during a 3-month internship at **DRDL (Defence Research & Development Laboratory)**, Kanchanbagh, Hyderabad — DRDO, Ministry of Defence, Govt. of India.

| Attribute | Detail |
|-----------|--------|
| Lab | DRDL, Hyderabad (DRDO) |
| Duration | Aug–Nov 2025 |
| Supervisor | Shri. Srijan Tripathi, Scientist 'E' |
| Intern | Hemasai Vattikuti, VIT-AP (B.Tech CSE) |
| Stack | FastAPI · MongoDB Replica Set · React · Docker |
| **Core Contribution** | **Distributed DB + FastAPI Backend** |