# FAVcart - MongoDB Replica Set E-commerce Application

Designed, built, and documented end-to-end by Hemasai Vattikuti (`@hemasaivattikuti25`) to demonstrate a production-grade MERN stack that can keep selling even when the primary database fails.  

- GitHub profile: [hemasaivattikuti25](https://github.com/hemasaivattikuti25)
- Ownership: Entire architecture (backend, frontend, infra scripts, docs) created from scratch, including replica-set automation, health monitoring services, and deployment collateral.

> **Why this repo exists**: To showcase a full offline-capable commerce platform with high availability, produced individually without starter templates. Every folder here—including `scripts/`, `backend/services/`, `frontend/src/slices/`, and comprehensive deployment manuals—was authored by Hemasai, iterated through multiple dry-runs, and validated on macOS + Windows.

---

## Features

- **MongoDB Replica Set Support**: Automatic failover between primary and secondary databases
- **Manual Database Switching**: Admin controls to manually switch between standalone and replica modes
- **Health Monitoring**: Automatic system monitoring with CPU temperature and database health checks
- **Offline Deployment**: Fully deployable without internet connectivity
- **Product Management**: CRUD operations for products with shopping cart functionality

## Build Narrative (Scratch-to-Production)

| Phase | Summary |
| --- | --- |
| Foundation | Initialized empty repo, structured `backend/` + `frontend/`, set up linting, added package manifests, and created environment scaffolding. |
| Database Layer | Authored `backend/config/database.js`, `backend/models/*.js`, replica-aware services, and `scripts/setup-replica.sh` for one-command LAN bootstrap. |
| Backend Services | Added Express server, admin failover APIs, health monitors, seeder + failover testers, and granular route separation (`routes/admin.js`, `routes/products.js`). |
| Frontend | Built React SPA with Redux Toolkit slices, admin dashboards, replica status widgets, database controls, product browsing, and theming. |
| Deployment & Docs | Produced full documentation suite so anyone can reproduce the build. |

Everything in the repo was implemented manually—no boilerplate generators, no cloned templates. This README consolidates the instructions so GitHub visitors can follow a single source of truth.

> **📘 Comprehensive Guide**: For a detailed, step-by-step operational manual including daily procedures, failover testing, and troubleshooting, please refer to [GUIDE.md](GUIDE.md).

---

## Requirement Checklist

- Full MERN stack application (`frontend` React + `backend` Express + MongoDB)
- MongoDB replica set configuration for **hot redundancy** across two laptops
- Smart connection manager (`backend/config/database.js`) that can switch between standalone and replica URIs
- Manual override APIs (`/api/admin/switch-db`, `/api/admin/clear-override`) for controlled failover
- Automated health monitoring based on database status and CPU temperature thresholds
- Offline LAN deployment options (phone hotspot / Windows hosted network)
- Seeder and test utilities for demo scenarios (`backend/utils/seeder.js`, `backend/utils/testFailover.js`)

## System Requirements

- Node.js 16+ 
- MongoDB 4.4+
- Two machines/laptops for replica set (or VMs)
- Port 27017 open on both machines

## Quick Start (Local Demo)

The easiest way to run the project is using the automated scripts for a local 3-node replica set.

### 1. Start the Database
Initialize the 3-node replica set automatically on your local machine:
```bash
./scripts/start-local-replica.sh
```
*This starts MongoDB instances on ports 27017, 27018, and 27019.*

### 2. Run the Application

**Option A: Production / Offline Mode (Recommended)**
This runs the full application (Frontend + Backend) on port 8000 without external dependencies.
```bash
./scripts/start-offline.sh
```
*Access at: http://localhost:8000*

**Option B: Development Mode**
Run backend and frontend separately.
```bash
# Terminal 1 (Backend)
cd backend
npm run dev:replica

# Terminal 2 (Frontend)
cd frontend
npm start
```

## Multi-Machine Setup (Advanced)

To set up the replica set across two different machines (e.g., for a failover demo between laptops):

1.  **Clone and Install** on both machines.
2.  **Configure IPs**: Run the setup script with the IPs of both machines.
    ```bash
    cd scripts
    ./setup-replica.sh <PRIMARY_IP> <SECONDARY_IP>
    ```
3.  **Firewall**: Ensure port 27017 is open on both machines.


## Offline LAN Setup (when internet is forbidden)

- **Method 1 (Phone Hotspot):** Connect both laptops to a smartphone hotspot with mobile data turned **off** to create an isolated LAN.
- **Method 2 (Windows Hotspot):** On a Windows laptop, enable a hosted network: `netsh wlan set hostednetwork mode=allow ssid=YourLAN key=YourPassword` followed by `netsh wlan start hostednetwork`. Connect the second laptop to this hotspot.

## Deployment Modes

### Mode 1: Standalone MongoDB (Single Machine)

#### Setup:
- Set `MONGO_DEFAULT_MODE=standalone` in `backend/config/config.env`
- Ensure `MONGO_URI_STANDALONE` points to `mongodb://127.0.0.1:27017/favcart`
```bash
# Start MongoDB standalone
mongod --dbpath C:\data\db --port 27017

# In another terminal, start the application
npm run dev
```

#### Load Sample Data:
```bash
node backend/utils/seeder.js
```

#### Verify:
- Application: http://localhost:3000
- Database: `mongo favcart` then `db.products.find()`

---

### Mode 2: Replica Set (Two Machines)

Set `MONGO_DEFAULT_MODE=replica` in `backend/config/config.env` before launching the backend so that the server prefers the replica set connection.

#### Machine 1 (Primary) - IP: 192.168.1.100

**Step 1: Clean and Start MongoDB**
```bash
# Clean existing data (IMPORTANT)
rm -rf /data/db/*  # Linux/Mac
# OR on Windows: del C:\data\db\*.*

# Start MongoDB as replica set member
mongod --replSet rs0 --dbpath C:\data\db --bind_ip localhost,192.168.1.100 --port 27017
```

**Step 2: Initialize Replica Set**
```bash
mongo --host 192.168.1.100:27017
```

```javascript
// In mongo shell
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "192.168.1.100:27017", priority: 2 },
    { _id: 1, host: "192.168.1.101:27017", priority: 1 }
  ]
})

// Verify initialization
rs.status()
rs.isMaster()
```

#### Machine 2 (Secondary) - IP: 192.168.1.101

**Step 1: Clean and Start MongoDB**
```bash
# Clean existing data
rm -rf /data/db/*

# Start MongoDB as replica set member  
mongod --replSet rs0 --dbpath C:\data\db --bind_ip localhost,192.168.1.101 --port 27017
```

#### Verify Replica Set

**On Primary (Machine 1):**
```javascript
rs.status()
// Should show PRIMARY and SECONDARY members
```

**Load Data on Primary:**
```bash
node backend/utils/seeder.js
```

**Check Replication on Secondary:**
```bash
mongo --host 192.168.1.101:27017
```
```javascript
db.products.find()  // Should show replicated data
```

## Application Startup

### Start the Application (on primary machine):

```bash
# Ensure backend/config/config.env has the correct MONGO_DEFAULT_MODE (standalone or replica)
# Start backend
npm run server

# Start frontend (new terminal)
npm run client

# Or start both together
npm run dev
```

### Access Points:
- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:8000/api/admin/status
- **API**: http://localhost:8000/api

## Health Monitoring & Failover

### Manual Database Switching

**Switch to Replica Mode:**
```bash
curl -X POST http://localhost:8000/api/admin/switch-db \
  -H "Content-Type: application/json" \
  -d '{"mode": "replica"}'
```

**Switch to Standalone Mode:**
```bash
curl -X POST http://localhost:8000/api/admin/switch-db \
  -H "Content-Type: application/json" \
  -d '{"mode": "standalone"}'
```

**Check System Status:**
```bash
curl http://localhost:8000/api/admin/status
```

### Health Monitoring Controls

**Start Health Monitoring:**
```bash
curl -X POST http://localhost:8000/api/admin/monitor/start
```

**Stop Health Monitoring:**
```bash
curl -X POST http://localhost:8000/api/admin/monitor/stop
```

**Update Monitor Settings:**
```bash
curl -X PUT http://localhost:8000/api/admin/monitor/config \
  -H "Content-Type: application/json" \
  -d '{
    "checkInterval": 5000,
    "maxFailures": 2,
    "cpuTempThreshold": 65
  }'
```

## Demonstration Script

### 1. Show Standalone Mode
```bash
# Start standalone
mongod --dbpath C:\data\db
npm run dev
# Show application working: http://localhost:3000
```

### 2. Show Replica Set Sync
```bash
# Start replica set on both machines
# Add data on primary, verify on secondary
mongo --host 192.168.1.100:27017
db.products.insertOne({name: "Test Product"})

mongo --host 192.168.1.101:27017  
db.products.find()  // Should show test product
```

### 3. Demonstrate Failover
```bash
# Stop primary mongod process (Ctrl+C)
# Application should continue working via secondary
curl http://localhost:8000/api/admin/status
```

### 4. Show Recovery
```bash
# Restart primary mongod
# Check rs.status() - primary should rejoin
```

### Critical Reset When Switching Modes
- Shut down **all** `mongod` processes on every laptop.
- Delete the contents of the data directory (`C:\data\db\*` on Windows or `/data/db/*` on Linux/Mac).
- Start MongoDB again in the desired mode (standalone or replica) before relaunching the backend.

### Quorum Reminder
- A two-node replica set cannot form a majority if one node goes offline, so the remaining node enters `RECOVERING` mode (read-only).
- With three nodes, any two form a majority, so the cluster can still elect a primary when one node fails.
- Mention this during the demo to explain why we run in “hot redundancy” with two laptops but recommend three for production.

## Troubleshooting

### Common Issues:

**Connection Refused:**
- Check firewall settings
- Verify IP addresses in `backend/config/config.env`
- Ensure MongoDB is running on both machines

**Replica Set Not Initializing:**
- Clean data directories: `rm -rf /data/db/*`
- Check network connectivity: `ping 192.168.1.101`
- Verify bind_ip includes both localhost and LAN IP

**Application Can't Connect:**
- Check `backend/config/config.env`
- Verify MongoDB replica set status: `rs.status()`
- Check application logs for connection errors

### Health Check Commands:

```bash
# Check MongoDB process
ps aux | grep mongod

# Check ports
netstat -tulpn | grep 27017

# Check replica set status
mongo --eval "rs.status()"

# Test connectivity
mongo --host 192.168.1.100:27017 --eval "db.runCommand('ping')"
```

### Log Files:
- Application logs: Console output
- MongoDB logs: `/var/log/mongodb/mongod.log` (Linux) or console output
- Health monitor: Check `/api/admin/status` endpoint

## Project Structure

```
FAVcart/
├── backend/
│   ├── config/
│   │   ├── config.env          # Primary environment file
│   │   └── database.js         # Connection manager with failover
│   ├── services/healthMonitor.js # Health monitoring service  
│   ├── routes/admin.js         # Admin API routes
│   ├── utils/
│   │   ├── seeder.js           # Sample data seeder
│   │   └── testFailover.js     # Replica set failover tester
│   └── server.js               # Express server entry
├── frontend/                   # React frontend
├── scripts/setup-replica.sh    # Helper to patch config.env with LAN IPs
└── README.md                   # This file
```

## API Endpoints

### Admin API:
- `GET /api/admin/status` - System status
- `POST /api/admin/switch-db` - Manual DB switch  
- `POST /api/admin/monitor/start` - Start monitoring
- `GET /api/admin/health` - Database health check

### Product API:
- `GET /api/products` - List products
- `POST /api/products` - Add product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

## Notes for Sir's Demo

1. **Preparation**: Ensure both machines have clean MongoDB installations
2. **Network**: Verify both machines can ping each other
3. **Timing**: Allow 30-60 seconds for replica set initialization
4. **Fallback**: Keep standalone mode ready if replica set fails
5. **Data**: Use seeder script to populate consistent test data

## Advanced Features

### CPU Temperature Monitoring (Linux):
```bash
# Install sensors package
sudo apt-get install lm-sensors
sudo sensors-detect
sensors
```

### Manual Override:
Use manual override to prevent automatic switching during demos:
```bash
curl -X POST http://localhost:8000/api/admin/switch-db -d '{"mode": "replica"}'
# Manual override prevents auto-switching until cleared
curl -X POST http://localhost:8000/api/admin/clear-override
```