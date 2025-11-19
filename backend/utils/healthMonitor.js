const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../config/config.env') });

const checkHealth = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      const admin = mongoose.connection.db.admin();
      const status = await admin.serverStatus();
      console.log(`MongoDB Health: OK - Host: ${status.host}, Uptime: ${status.uptime}s`);
    } else {
      console.log('MongoDB Health: Disconnected');
    }
  } catch (error) {
    console.log('Health check failed:', error.message);
    // Let the existing disconnection handler in database.js handle reconnection
    if (mongoose.connection.readyState === 1) {
      mongoose.connection.close();
    }
  }
};

// Only start health monitoring if this file is run directly
if (require.main === module) {
  console.log('Starting MongoDB health monitor...');
  setInterval(checkHealth, 30000); // Check every 30s
  
  // Initial health check
  setTimeout(checkHealth, 5000);
}

module.exports = { checkHealth };
