const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../config/config.env') });

const mongoose = require('mongoose');
const databaseManager = require('../config/database');

let testInterval;
let connectionAttempts = 0;

const testConnection = async () => {
  try {
    connectionAttempts++;
    console.log(`\n--- Connection Test #${connectionAttempts} ---`);
    console.log('Current time:', new Date().toISOString());
    
    // Check connection state
    const state = mongoose.connection.readyState;
    const stateNames = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    console.log(`Connection state: ${stateNames[state]} (${state})`);
    
    if (state === 1) {
      // Test database operations
      const admin = mongoose.connection.db.admin();
      const serverStatus = await admin.serverStatus();
      
      console.log(`✓ Connected to: ${serverStatus.host}`);
      console.log(`✓ Server uptime: ${Math.floor(serverStatus.uptime)}s`);
      console.log(`✓ Database: ${mongoose.connection.name}`);
      
      // Test a simple operation
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log(`✓ Collections available: ${collections.length}`);
    } else {
      console.log('✗ Database not connected');
    }
    
  } catch (error) {
    console.log(`✗ Test failed: ${error.message}`);
  }
  
  console.log('--- End Test ---\n');
};

const startFailoverTest = async () => {
  const mode = (process.argv[2] || 'replica').toLowerCase();
  console.log('🚀 Starting MongoDB Failover Test');
  console.log(`Connection mode: ${mode}`);
  console.log('This will test connection switching when primary goes down\n');
  
  // Initial connection
  try {
    await databaseManager.connect(mode);
    console.log('✓ Initial connection established');
  } catch (error) {
    console.log('✗ Initial connection failed:', error.message);
  }
  
  // Start periodic testing
  console.log('Starting periodic connection tests every 10 seconds...');
  console.log('To test failover:');
  console.log('1. Watch the connection status below');
  console.log('2. Shut down the primary MongoDB server');
  console.log('3. Observe automatic failover to secondary');
  console.log('4. Restart primary to test reconnection\n');
  
  testInterval = setInterval(testConnection, 10000);
  
  // Initial test
  await testConnection();
};

const stopFailoverTest = async () => {
  if (testInterval) {
    clearInterval(testInterval);
    console.log('\n🛑 Failover test stopped');
  }
  try {
    await databaseManager.disconnect();
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => stopFailoverTest());
process.on('SIGTERM', () => stopFailoverTest());

// Start the test
startFailoverTest().catch(console.error);
