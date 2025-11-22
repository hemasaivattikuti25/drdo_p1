#!/bin/bash

# FAVCart MongoDB Replica Set Setup Script

echo "🚀 FAVCart MongoDB Replica Set Setup"
echo "======================================"

# Check if IP addresses are provided
if [ $# -lt 2 ]; then
    echo "Usage: $0 <primary-ip> <secondary-ip>"
    echo "Example: $0 172.16.1.100 192.168.1.200"
    exit 1
fi

PRIMARY_IP=$1
SECONDARY_IP=$2

echo "Primary IP: $PRIMARY_IP"
echo "Secondary IP: $SECONDARY_IP"
echo ""

# Update config.env with provided IPs
echo "📝 Updating config.env file..."
CONFIG_FILE="../backend/config/config.env"
if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Could not find $CONFIG_FILE. Run this script from the scripts directory."
    exit 1
fi

# Backup original config
cp $CONFIG_FILE "$CONFIG_FILE.backup.$(date +%s)"

# Update the config file (macOS compatible)
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS version
    sed -i '' "s/172\.x\.x\.x/$PRIMARY_IP/g" "$CONFIG_FILE"
    sed -i '' "s/192\.x\.x\.x/$SECONDARY_IP/g" "$CONFIG_FILE"
    sed -i '' "s/MONGO_DEFAULT_MODE=.*/MONGO_DEFAULT_MODE=replica/" "$CONFIG_FILE"
else
    # Linux version
    sed -i "s/172\.x\.x\.x/$PRIMARY_IP/g" "$CONFIG_FILE"
    sed -i "s/192\.x\.x\.x/$SECONDARY_IP/g" "$CONFIG_FILE"
    sed -i "s/MONGO_DEFAULT_MODE=.*/MONGO_DEFAULT_MODE=replica/" "$CONFIG_FILE"
fi

echo "✅ Configuration updated"
echo ""

# Test connectivity
echo "🔍 Testing network connectivity..."
ping -c 3 $PRIMARY_IP > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Primary ($PRIMARY_IP) is reachable"
else
    echo "❌ Primary ($PRIMARY_IP) is not reachable"
    exit 1
fi

ping -c 3 $SECONDARY_IP > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Secondary ($SECONDARY_IP) is reachable"
else
    echo "❌ Secondary ($SECONDARY_IP) is not reachable"
    exit 1
fi

echo ""
echo "🎯 Next steps:"
echo "1. Start MongoDB on primary machine:"
echo "   mongod --replSet rs0 --dbpath /data/db --bind_ip localhost,$PRIMARY_IP --port 27017"
echo ""
echo "2. Start MongoDB on secondary machine:"
echo "   mongod --replSet rs0 --dbpath /data/db --bind_ip localhost,$SECONDARY_IP --port 27017"
echo ""
echo "3. Initialize replica set (run on primary):"
echo "   mongo --host $PRIMARY_IP:27017"
echo "   Then run:"
echo '   rs.initiate({'
echo '     _id: "rs0",'
echo '     members: ['
echo "       {_id: 0, host: \"$PRIMARY_IP:27017\", priority: 2},"
echo "       {_id: 1, host: \"$SECONDARY_IP:27017\", priority: 1}"
echo '     ]'
echo '   })'
echo ""
echo "4. Test the setup:"
echo "   cd backend && npm run test:failover"
echo ""
echo "✅ Setup script completed!"
