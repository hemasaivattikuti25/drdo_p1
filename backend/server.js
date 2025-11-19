const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'config/config.env') });

const app = require('./app');
const databaseManager = require('./config/database');

const PORT = process.env.PORT || 8000;
const DEFAULT_MODE = (process.env.MONGO_DEFAULT_MODE || 'standalone').toLowerCase();

let server;

async function startServer() {
  try {
    console.log(`🔗 Connecting to MongoDB (${DEFAULT_MODE} mode)...`);
    await databaseManager.connect(DEFAULT_MODE);

    server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Admin panel: http://localhost:${PORT}/api/admin/status`);
      console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

async function gracefulShutdown(signal) {
  console.log(`🛑 Received ${signal}, shutting down gracefully...`);
  try {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await databaseManager.disconnect();
    console.log('✅ Shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error.message);
    process.exit(1);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  console.error(error.stack);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
  gracefulShutdown('unhandledRejection');
});

startServer();

module.exports = app;