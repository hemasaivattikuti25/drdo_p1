# About This Project

## DRDO DAMS — Defence Asset Management System
**Version:** 3.0  
**Organisation:** Defence Research & Development Laboratory (DRDL), Hyderabad  
**Under:** Ministry of Defence, Government of India

---

## Developer
**Hemasai Vattikuti**  
Intern at DRDL, DRDO — Hyderabad  
GitHub: [hemasaivattikuti25](https://github.com/hemasaivattikuti25)

---

## Project Purpose
Built during an internship at DRDL (DRDO), this system demonstrates a **fault-tolerant defence asset management platform** with:
- A production-grade **async REST API** (FastAPI + Python 3.11)
- A **3-node MongoDB Replica Set** with automatic leader election and hot failover
- **Docker Compose** orchestration of all 5 services
- A React-based frontend as a demonstration wrapper

The system is designed for **high-availability environments** where zero downtime and data redundancy are critical — exactly the standard required in defence operations.

---

## My Contribution
| Area | What I Built |
|------|-------------|
| **FastAPI Backend** | Async REST API with rate limiting, JWT auth, Pydantic validation, advanced MongoDB aggregation pipelines |
| **MongoDB Replica Set** | 3-node distributed database with automatic election, hot failover, and oplog-based replication |
| **Docker Orchestration** | docker-compose.yml managing 5 containers (3 DB nodes + backend + frontend) |
| **Health Monitoring** | Background task that detects failures and auto-switches between replica and standalone modes |
| **Analytics Engine** | Inventory analysis, requisition trends, top equipment, and live DB metrics using aggregation pipelines |
| **Database Seeder** | 30 realistic DRDO defence equipment entries across 10 categories |

---

## Technical Highlights
- **Zero-downtime failover:** If the Primary database crashes, a Secondary is promoted in ~10 seconds — no manual intervention, no data loss
- **Dual-mode database:** Graceful degradation from replica set to standalone if the full cluster is unavailable
- **Rate limiting:** 100 requests/minute per IP via `slowapi`
- **Async everywhere:** Motor (async MongoDB driver) + FastAPI — no blocking I/O in the entire stack
- **In-memory TTL caching:** Heavy aggregation routes are cached for 60 seconds

---

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Backend | FastAPI 0.111, Python 3.11, Uvicorn |
| Database | MongoDB 6.0 (3-node Replica Set) |
| Auth | PyJWT + bcrypt |
| Async Driver | Motor 3.x |
| Rate Limiting | slowapi |
| Containers | Docker, Docker Compose |
| Frontend | React 18, Redux Toolkit, Bootstrap 5 |
| Proxy | Nginx (SPA routing + API proxy) |

---

## Note on Data & Frontend
The **frontend is a minimal placeholder** providing a visual wrapper for the system. The **database content is simulated** DRDO equipment data for demonstration purposes only. Real defence data is classified and was never included.

The **actual technical value** of this project lies entirely in:
1. The backend architecture
2. The distributed database infrastructure
3. The automated failover and health monitoring logic

---

## Certificate
The internship certificate is available at [certificates/HemSai.pdf](certificates/HemSai.pdf).

---

*Built at DRDL, Hyderabad — 2025*
