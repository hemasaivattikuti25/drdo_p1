#!/bin/bash

# Stop any running mongod processes
echo "🛑 Stopping existing MongoDB processes..."
killall mongod 2>/dev/null || true
sleep 2

# Create data directories
echo "📂 Creating data directories..."
rm -rf data-db
mkdir -p data-db/rs1 data-db/rs2 data-db/rs3

# Start 3 MongoDB instances
echo "🚀 Starting 3 MongoDB nodes..."

# Node 1 (Primary) - Port 27017
nohup mongod --replSet rs0 --port 27017 --dbpath ./data-db/rs1 --bind_ip 0.0.0.0 --oplogSize 128 > ./data-db/rs1/mongod.log 2>&1 &
echo "   - Node 1 started on port 27017"

# Node 2 (Secondary) - Port 27018
nohup mongod --replSet rs0 --port 27018 --dbpath ./data-db/rs2 --bind_ip 0.0.0.0 --oplogSize 128 > ./data-db/rs2/mongod.log 2>&1 &
echo "   - Node 2 started on port 27018"

# Node 3 (Secondary) - Port 27019
nohup mongod --replSet rs0 --port 27019 --dbpath ./data-db/rs3 --bind_ip 0.0.0.0 --oplogSize 128 > ./data-db/rs3/mongod.log 2>&1 &
echo "   - Node 3 started on port 27019"

echo "⏳ Waiting for nodes to initialize..."
sleep 5

# Initialize Replica Set
echo "⚙️  Initializing Replica Set..."
mongosh --port 27017 --eval '
  rs.initiate({
    _id: "rs0",
    members: [
      { _id: 0, host: "localhost:27017", priority: 2 },
      { _id: 1, host: "localhost:27018", priority: 1 },
      { _id: 2, host: "localhost:27019", priority: 1 }
    ]
  })
'

echo "⏳ Waiting for Replica Set to stabilize..."
sleep 10

echo "✅ Local Replica Set (3 nodes) is running!"
echo "   - Primary: localhost:27017"
echo "   - Secondary: localhost:27018"
echo "   - Secondary: localhost:27019"
