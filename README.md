# 🛡️ DRDO DAMS — Defence Asset Management System

> **Internship Project** · Defence Research & Development Laboratory (DRDL), Hyderabad  
> Ministry of Defence, Government of India

**My contribution:** Designed and implemented the **FastAPI backend** and the **MongoDB distributed replica set** infrastructure. The frontend and database content are minimal placeholders — the actual technical work is in the backend architecture and distributed database setup.

---

## 🧠 What I Built

### 1. FastAPI Backend (Python)
- Built a production-grade **async REST API** using **FastAPI + Uvicorn**
- All routes use **Pydantic v2 data validation** with field-level constraints
- **Rate limiting** via `slowapi` (100 req/min per IP)
- **JWT authentication** with `python-jose`, password hashing with `bcrypt`
- **Motor** (async MongoDB driver) — no blocking I/O anywhere in the stack
- **Background Tasks** — fire-and-forget audit logging on analytics endpoints
- **In-memory TTL cache** on heavy aggregation routes (60s expiry)
- Auto-generated **OpenAPI/Swagger docs** at `/docs`

#### Advanced Analytics Endpoints (showcase of aggregation skill)
| Endpoint | What it does |
|---|---|
| `GET /api/v1/analytics/inventory-by-category` | MongoDB `$group` + `$project` aggregation pipeline, TTL-cached |
| `GET /api/v1/analytics/requisition-trends` | Daily orders using `$dateToString` aggregation |
| `GET /api/v1/analytics/top-equipment` | `$lookup` join of orders + products collection |
| `GET /api/v1/analytics/db-metrics` | Live `serverStatus` — connections, memory, replica lag |

---

### 2. MongoDB Replica Set (3-Node Distributed Database)

This is the core database contribution.

```
┌─────────────────────────────────────────────────────┐
│           MongoDB Replica Set (rs0)                 │
│                                                     │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐        │
│  │  mongo1  │◄──│  mongo2  │   │  mongo3  │        │
│  │ PRIMARY  │   │SECONDARY │   │SECONDARY │        │
│  │  :27017  │   │  :27018  │   │  :27019  │        │
│  └────┬─────┘   └──────────┘   └──────────┘        │
│       │                                             │
│   All writes go here → replicated automatically    │
└─────────────────────────────────────────────────────┘
```

**How hot recovery works:**
1. All writes go to the **Primary** (`mongo1`)
2. Both Secondaries continuously replicate the oplog in real time
3. If the Primary crashes → MongoDB triggers an **automatic election** in ~10 seconds
4. One Secondary is promoted to Primary — **zero data loss, zero manual intervention**
5. Backend `database.py` has a fallback to standalone mode in case the full replica set is unavailable locally

**Why this matters:** Standard e-commerce or web apps use a single MongoDB instance. If it crashes, everything is down. This replica set guarantees high availability — exactly the kind of fault tolerance required in a defence environment.

---

### 3. Docker Orchestration

All 5 services run as isolated containers, managed by **Docker Compose**:

```
docker-compose.yml
├── mongo1, mongo2, mongo3   ← Replica Set nodes
├── backend                  ← FastAPI (Uvicorn) on port 8000
└── frontend                 ← React (Nginx) on port 80
```

- `scripts/mongo-init-replica.js` — auto-inits the replica set on first boot with retry logic
- `backend/Dockerfile` — Python 3.11 slim, uvicorn in production mode
- `frontend/Dockerfile` — Multi-stage build: Node.js build → Nginx serve
- `frontend/nginx.conf` — SPA routing + `/api` proxy to backend (no CORS issues)

---

## 🚀 Quick Start (Local)

```bash
git clone <repo-url>
cd drdo_p1

# Start everything (replica set + backend + frontend)
docker compose up --build

# Wait ~45 seconds for replica set election to complete, then:
open http://localhost:3000        # UI (dummy showcase)
open http://localhost:8000/docs   # FastAPI Swagger docs
```

### Seed dummy data (optional)
```bash
cd backend
python3 seeder.py          # inserts 12 DRDO lab equipment items
python3 seeder.py --destroy  # wipe + re-seed
```

**Admin login:** `admin@drdl.drdo.gov.in` / `Drdo@2025`

---

## 📁 Project Structure

```
drdo_p1/
├── backend/                   ← FastAPI (MY WORK)
│   ├── main.py                ← App entrypoint, rate limiting, routers
│   ├── config/
│   │   └── database.py        ← Replica set connection + failover logic
│   ├── models/
│   │   └── product.py         ← Pydantic model with field validators
│   ├── routers/
│   │   ├── product.py         ← CRUD + search + pagination
│   │   ├── user.py            ← Auth, JWT, profile
│   │   ├── order.py           ← Requisition management
│   │   ├── admin.py           ← Dashboard, DB status, manual failover
│   │   └── analytics.py       ← Advanced aggregation endpoints
│   ├── seeder.py              ← Database seeder with 12 items
│   └── requirements.txt
│
├── scripts/
│   └── mongo-init-replica.js  ← Auto replica set init (MY WORK)
│
├── docker-compose.yml         ← Full orchestration (MY WORK)
├── frontend/                  ← React (dummy showcase wrapper)
│   ├── Dockerfile
│   └── nginx.conf
```

---

## ⚠️ Important Note
The **frontend is a minimal placeholder** to provide a visual wrapper for the system. Likewise the **database content (12 equipment items) is dummy data** for demonstration.

The **actual technical contribution** of this internship project is:
- The **FastAPI async backend** with rate limiting, JWT auth, Pydantic validation
- The **MongoDB 3-node replica set** with automatic leader election and hot failover
- The **Docker Compose orchestration** of all services
- The **analytics engine** with MongoDB aggregation pipelines

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI 0.111, Python 3.11, Uvicorn |
| Database | MongoDB 6.0 (3-node Replica Set, `rs0`) |
| Auth | python-jose (JWT), bcrypt (password hashing) |
| Async DB Driver | Motor 3.x |
| Rate Limiting | slowapi |
| Containerisation | Docker, Docker Compose |
| Frontend | React 18 (Nginx-served, placeholder) |

---

---

## 👤 About the Developer

**Hemasai Vattikuti**  
Intern at DRDL, DRDO — Hyderabad  
GitHub: [hemasaivattikuti25](https://github.com/hemasaivattikuti25)

### Technical Highlights
- **Zero-downtime failover:** If the Primary database crashes, a Secondary is promoted in ~10 seconds — no manual intervention, no data loss
- **Dual-mode database:** Graceful degradation from replica set to standalone if the full cluster is unavailable
- **Rate limiting:** 100 requests/minute per IP via `slowapi`
- **Async everywhere:** Motor (async MongoDB driver) + FastAPI — no blocking I/O in the entire stack
- **In-memory TTL caching:** Heavy aggregation routes are cached for 60 seconds

### My Contribution
| Area | What I Built |
|------|-------------|
| **FastAPI Backend** | Async REST API with rate limiting, JWT auth, Pydantic validation, advanced MongoDB aggregation pipelines |
| **MongoDB Replica Set** | 3-node distributed database with automatic election, hot failover, and oplog-based replication |
| **Docker Orchestration** | docker-compose.yml managing 5 containers (3 DB nodes + backend + frontend) |
| **Health Monitoring** | Background task that detects failures and auto-switches between replica and standalone modes |
| **Analytics Engine** | Inventory analysis, requisition trends, top equipment, and live DB metrics using aggregation pipelines |
| **Database Seeder** | 30 realistic DRDO defence equipment entries across 10 categories |

### Note on Data & Frontend
The frontend is a minimal placeholder providing a visual wrapper for the system. The database content is simulated DRDO equipment data for demonstration purposes only. Real defence data is classified and was never included. The actual technical value of this project lies entirely in the backend architecture, the distributed database infrastructure, and the automated failover and health monitoring logic.

---

📜 **Internship Certificate:** [certificates/HemSai.pdf](certificates/HemSai.pdf)

*Built at DRDL Hyderabad, 2025 · Hemasai Vattikuti · v3.0*