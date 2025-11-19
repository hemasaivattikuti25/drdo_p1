const express = require('express');
const router = express.Router();
const dbManager = require('../config/database');
const healthMonitor = require('../services/healthMonitor');
const databaseManager = require('../config/database');

// Get system status
router.get('/status', async (req, res) => {
  try {
    const dbStatus = databaseManager.getStatus();
    const dbHealth = await databaseManager.checkHealth();
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      server: {
        status: 'running',
        node_version: process.version,
        uptime: process.uptime(),
        memory: process.memoryUsage()
      },
      database: {
        ...dbStatus,
        ...dbHealth
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Switch database mode
router.post('/switch-db', async (req, res) => {
  try {
    const { mode } = req.body;
    
    if (!['standalone', 'replica'].includes(mode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mode. Use "standalone" or "replica"'
      });
    }

    await databaseManager.connect(mode);
    
    res.json({
      success: true,
      message: `Switched to ${mode} database mode`,
      status: databaseManager.getStatus()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to switch to ${req.body.mode}: ${error.message}`
    });
  }
});

// Clear manual override
router.post('/clear-override', (req, res) => {
  const result = healthMonitor.setManualOverride(false);
  res.json({
    ...result,
    timestamp: new Date().toISOString()
  });
});

// Database health check
router.get('/health', async (req, res) => {
  try {
    const health = await databaseManager.checkHealth();
    res.json({
      success: true,
      ...health
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start health monitoring
router.post('/monitor/start', (req, res) => {
  const result = healthMonitor.startMonitoring();
  res.json({
    ...result,
    timestamp: new Date().toISOString()
  });
});

// Stop health monitoring
router.post('/monitor/stop', (req, res) => {
  const result = healthMonitor.stopMonitoring();
  res.json({
    ...result,
    timestamp: new Date().toISOString()
  });
});

// Update monitor configuration
router.put('/monitor/config', (req, res) => {
  const result = healthMonitor.updateConfig(req.body);
  res.json({
    ...result,
    timestamp: new Date().toISOString()
  });
});

// Get monitor statistics
router.get('/monitor/stats', (req, res) => {
  const stats = healthMonitor.getStats();
  res.json({
    ...stats,
    timestamp: new Date().toISOString()
  });
});

// Perform manual health check
router.post('/monitor/check', async (req, res) => {
  try {
    const result = await healthMonitor.performHealthCheck();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
