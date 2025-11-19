# macOS Setup Guide for FAVCart

## Quick Start for macOS

### 1. MongoDB Data Directory ✅
**Created:** `~/mongodb/data`

### Start MongoDB Commands (macOS)

#### Standalone Mode:
```bash
mongod --dbpath ~/mongodb/data --port 27017
```

#### Replica Set Mode (Primary):
```bash
# Get your IP first
ipconfig getifaddr en0

# Start MongoDB (replace with your actual IP)
mongod --replSet rs0 --dbpath ~/mongodb/data --bind_ip localhost,192.168.1.100 --port 27017
```

#### Replica Set Mode (Secondary - on 2nd Mac):
```bash
mongod --replSet rs0 --dbpath ~/mongodb/data --bind_ip localhost,192.168.1.101 --port 27017
```

---

## 2. Initialize Replica Set (Primary Only)

```bash
# Connect to MongoDB
mongosh --host 192.168.1.100:27017

# Initialize (replace IPs with your actual ones)
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "192.168.1.100:27017", priority: 2 },
    { _id: 1, host: "192.168.1.101:27017", priority: 1 }
  ]
})

# Check status
rs.status()
```

---

## 3. Find Your macOS IP Address

### Wi-Fi:
```bash
ipconfig getifaddr en0
```

### Ethernet:
```bash
ipconfig getifaddr en1
```

### All interfaces:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

---

## 4. Setup Replica Set (Automated)

```bash
cd /Users/sai2005/Downloads/FAVcart/scripts

# Make script executable
chmod +x setup-replica.sh

# Run with your IPs
./setup-replica.sh 192.168.1.100 192.168.1.101
```

---

## 5. Start Application

### Development Mode (Both servers):
```bash
cd /Users/sai2005/Downloads/FAVcart
npm run dev
```

### Backend Only:
```bash
npm run server
```

### With Specific Mode:
```bash
# Standalone
cd backend
npm run dev:standalone

# Replica
npm run dev:replica
```

---

## 6. Test Everything

### Health Check:
```bash
curl http://localhost:8000/api/health
```

### Admin Status:
```bash
curl http://localhost:8000/api/admin/status
```

### Seed Data:
```bash
npm run seed
```

---

## 7. Common macOS Issues & Fixes

### Issue 1: "Address already in use"
```bash
# Find process using port 27017
lsof -ti:27017

# Kill it
kill -9 $(lsof -ti:27017)
```

### Issue 2: "Permission denied" for /data/db
**Solution:** Use `~/mongodb/data` instead (already created)

### Issue 3: MongoDB not found
```bash
# Install via Homebrew
brew tap mongodb/brew
brew install mongodb-community@8.0
```

### Issue 4: Can't connect to replica set
```bash
# Check if both machines can ping each other
ping 192.168.1.101

# Check firewall (System Settings > Network > Firewall)
# Allow MongoDB connections on port 27017
```

---

## 8. Network Setup for Two Macs

### Option 1: Phone Hotspot (Easiest)
1. Create hotspot on iPhone/Android
2. **Turn OFF mobile data**
3. Connect both Macs to hotspot
4. Find IPs: `ifconfig | grep "inet "`

### Option 2: Direct Wi-Fi
1. One Mac creates hotspot (System Settings > Sharing > Internet Sharing)
2. Second Mac connects to it
3. Note down IPs

### Option 3: Ethernet Cable
1. Connect both Macs with Ethernet adapter/cable
2. Set static IPs in System Settings > Network
   - Mac 1: 192.168.2.1
   - Mac 2: 192.168.2.2

---

## 9. Demo Checklist

- [ ] MongoDB data directory exists: `~/mongodb/data`
- [ ] Can start MongoDB standalone
- [ ] Application starts: `npm run dev`
- [ ] Can access frontend: http://localhost:3000
- [ ] Can access admin: http://localhost:8000/api/admin/status
- [ ] Can seed data: `npm run seed`
- [ ] (For replica) Both Macs on same network
- [ ] (For replica) Can ping other Mac
- [ ] (For replica) Replica set initialized
- [ ] (For replica) Data replicates between machines

---

## 10. Quick Commands Reference

```bash
# Check if MongoDB is running
ps aux | grep mongod

# Stop MongoDB gracefully
mongosh --eval "db.adminCommand({ shutdown: 1 })"

# View MongoDB logs
tail -f ~/mongodb/data/mongod.log

# Check application logs
npm run dev  # Logs show in terminal

# Test API
curl http://localhost:8000/api/health | jq

# Get all products
curl http://localhost:8000/api/products | jq
```

---

## Notes
- ✅ JWT_SECRET updated to secure value
- ✅ Removed redundant DB_LOCAL_URI variable
- ✅ Fixed setup-replica.sh for macOS compatibility
- ✅ MongoDB data directory created at ~/mongodb/data

**Your system is now optimized for macOS! 🍎**
