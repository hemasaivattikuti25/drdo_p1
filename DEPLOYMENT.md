# FAVCart MongoDB Replica Set Deployment Guide

This guide walks through setting up a MongoDB replica set on two machines for FAVCart's high-availability database setup.

## Network Setup

### Prerequisites
- Two machines on the same LAN
- MongoDB installed on both machines
- Network connectivity between machines
- Firewall configured to allow MongoDB port (27017)

### Example Network Configuration
```
Primary Machine:   192.168.1.100 (replace with your IP)
Secondary Machine: 192.168.1.101 (replace with your IP)
```

## Step 1: Configure MongoDB on Both Machines

### Primary Machine (192.168.1.100)

1. **Create MongoDB data directory:**
   ```bash
   mkdir -p ~/mongodb/data
   ```

2. **Start MongoDB with replica set:**
   ```bash
   mongod --replSet rs0 --dbpath ~/mongodb/data --bind_ip localhost,192.168.1.100 --port 27017
   ```

### Secondary Machine (192.168.1.101)

1. **Create MongoDB data directory:**
   ```bash
   mkdir -p ~/mongodb/data
   ```

2. **Start MongoDB with replica set:**
   ```bash
   mongod --replSet rs0 --dbpath ~/mongodb/data --bind_ip localhost,192.168.1.101 --port 27017
   ```

## Step 2: Initialize Replica Set

**On Primary Machine only:**

1. **Connect to MongoDB:**
   ```bash
   mongosh --host 192.168.1.100:27017
   ```

2. **Initialize replica set:**
   ```javascript
   rs.initiate({
     _id: "rs0",
     members: [
       {
         _id: 0,
         host: "192.168.1.100:27017",
         priority: 2
       },
       {
         _id: 1,
         host: "192.168.1.101:27017",
         priority: 1
       }
     ]
   })
   ```

3. **Verify replica set status:**
   ```javascript
   rs.status()
   ```

   Expected output should show:
   - Primary: 192.168.1.100:27017
   - Secondary: 192.168.1.101:27017

## Step 3: Configure FAVCart Application

1. **Update config.env file:**
   ```bash
   # MongoDB Configuration
   MONGO_URI_STANDALONE=mongodb://127.0.0.1:27017/jvlcart
   MONGO_URI_REPLICA=mongodb://192.168.1.100:27017,192.168.1.101:27017/jvlcart?replicaSet=rs0&readPreference=primaryPreferred
   MONGO_DEFAULT_MODE=replica
   ```
   > Use `./scripts/setup-replica.sh <primary-ip> <secondary-ip>` to automate this step (updates IPs and flips `MONGO_DEFAULT_MODE`).

2. **Test configuration:**
   ```bash
   cd backend
   npm run dev:replica
   ```

## Step 4: Testing Failover

### Automated Testing

1. **Run the failover test:**
   ```bash
   npm run test:failover
   ```

2. **In another terminal, simulate primary failure:**
   ```bash
   # On primary machine, stop MongoDB
   sudo pkill mongod
   ```

3. **Observe failover in test output**

4. **Restart primary:**
   ```bash
   mongod --replSet rs0 --dbpath ~/mongodb/data --bind_ip localhost,192.168.1.100 --port 27017
   ```

### Manual Testing

1. **Start application:**
   ```bash
   npm run dev:replica
   ```

2. **Monitor logs and perform operations**

3. **Simulate primary failure and verify continued operation**

## Troubleshooting

### Connection Issues

**Check network connectivity:**
```bash
# From each machine, ping the other
ping 192.168.1.100
ping 192.168.1.101

# Test MongoDB port
telnet 192.168.1.100 27017
telnet 192.168.1.101 27017
```

**Check MongoDB logs:**
```bash
tail -f /var/log/mongodb/mongod.log
```

### Replica Set Issues

**Check replica set configuration:**
```javascript
rs.conf()
rs.status()
```

**Force reconfiguration if needed:**
```javascript
cfg = rs.conf()
cfg.members[0].host = "192.168.1.100:27017"
cfg.members[1].host = "192.168.1.101:27017"
rs.reconfig(cfg, {force: true})
```

### Firewall Configuration

**Ubuntu/Debian:**
```bash
sudo ufw allow 27017
sudo ufw reload
```

**CentOS/RHEL:**
```bash
sudo firewall-cmd --permanent --add-port=27017/tcp
sudo firewall-cmd --reload
```

## Production Considerations

### Security
- Use authentication in production
- Configure SSL/TLS for replica set communication
- Restrict network access to MongoDB ports

### Monitoring
- Set up MongoDB monitoring tools
- Configure alerting for replica set status changes
- Monitor disk space and performance

### Backup Strategy
- Regular backups of both replica set members
- Test backup restoration procedures
- Document recovery procedures

## Common Commands

### MongoDB Replica Set Commands
```javascript
// Check status
rs.status()

// Check configuration
rs.conf()

// Add member
rs.add("new-member:27017")

// Remove member
rs.remove("member-to-remove:27017")

// Force a member to become primary (emergency only)
rs.stepDown()
```

### Application Commands
```bash
# Test different connection modes
npm run dev:standalone
npm run dev:replica
npm run test:failover
npm run health:monitor
```

## Validation Checklist

- [ ] Both MongoDB instances are running
- [ ] Replica set is initialized correctly
- [ ] Primary and secondary are identified correctly
- [ ] Application connects to replica set
- [ ] Failover works when primary goes down
- [ ] Application reconnects when primary comes back
- [ ] Data is replicated between instances
- [ ] Health monitoring is functional

## Support

For issues with this deployment:
1. Check the troubleshooting section above
2. Review MongoDB replica set documentation
3. Check application logs for connection errors
4. Verify network connectivity between machines
