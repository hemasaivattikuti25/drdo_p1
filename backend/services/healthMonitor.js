const databaseManager = require('../config/database');
const fs = require('fs');
const os = require('os');

class HealthMonitor {
  constructor() {
    this.isMonitoring = false;
    this.intervalId = null;
    this.manualOverride = false;
    this.config = {
      checkInterval: 10000, // 10 seconds
      maxFailures: 3,
      cpuTempThreshold: 70
    };
    this.stats = {
      totalChecks: 0,
      failures: 0,
      lastCheck: null,
      consecutiveFailures: 0,
      dbSwitches: 0
    };
  }

  startMonitoring() {
    if (this.isMonitoring) {
      return { success: false, message: 'Monitoring already active' };
    }

    this.isMonitoring = true;
    this.intervalId = setInterval(() => {
      this.performHealthCheck();
    }, this.config.checkInterval);

    console.log('🔍 Health monitoring started');
    return { success: true, message: 'Health monitoring started' };
  }

  stopMonitoring() {
    if (!this.isMonitoring) {
      return { success: false, message: 'Monitoring not active' };
    }

    this.isMonitoring = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log('🛑 Health monitoring stopped');
    return { success: true, message: 'Health monitoring stopped' };
  }

  async performHealthCheck() {
    try {
      this.stats.totalChecks++;
      this.stats.lastCheck = new Date().toISOString();

      // Check database health
      const dbHealth = await databaseManager.checkHealth();
      
      // Check CPU temperature (Linux only)
      const cpuTemp = this.getCpuTemperature();
      
      // Check system resources
      const systemHealth = this.getSystemHealth();

      const healthResult = {
        timestamp: new Date().toISOString(),
        database: dbHealth,
        cpu: {
          temperature: cpuTemp,
          usage: systemHealth.cpuUsage
        },
        memory: systemHealth.memory,
        healthy: dbHealth.healthy && cpuTemp < this.config.cpuTempThreshold
      };

      if (!healthResult.healthy) {
        this.stats.failures++;
        this.stats.consecutiveFailures++;
        console.log('⚠️  Health check failed:', healthResult);

        // Auto-switch database if needed (and not overridden)
        if (!this.manualOverride && this.stats.consecutiveFailures >= this.config.maxFailures) {
          await this.handleFailover();
        }
      } else {
        this.stats.consecutiveFailures = 0;
      }

      return healthResult;
    } catch (error) {
      console.error('❌ Health check error:', error.message);
      this.stats.failures++;
      this.stats.consecutiveFailures++;
      return {
        timestamp: new Date().toISOString(),
        healthy: false,
        error: error.message
      };
    }
  }

  async handleFailover() {
    try {
      const currentStatus = databaseManager.getStatus();
      const currentMode =
        currentStatus.mode || (process.env.MONGO_DEFAULT_MODE || 'standalone');
      const newMode = currentMode === 'standalone' ? 'replica' : 'standalone';
      const targetUri =
        newMode === 'replica'
          ? process.env.MONGO_URI_REPLICA
          : process.env.MONGO_URI_STANDALONE;

      if (!targetUri) {
        console.warn(
          `⚠️  Failover aborted: no MongoDB URI configured for ${newMode} mode`
        );
        return;
      }
      
      console.log(`🔄 Attempting failover from ${currentStatus.mode} to ${newMode}`);
      
      await databaseManager.connect(newMode);
      this.stats.dbSwitches++;
      this.stats.consecutiveFailures = 0;
      
      console.log(`✅ Failover successful: switched to ${newMode} mode`);
    } catch (error) {
      console.error('❌ Failover failed:', error.message);
    }
  }

  getCpuTemperature() {
    try {
      const platform = os.platform();
      
      // Linux: Read from thermal zone
      if (platform === 'linux') {
        if (fs.existsSync('/sys/class/thermal/thermal_zone0/temp')) {
          const temp = fs.readFileSync('/sys/class/thermal/thermal_zone0/temp', 'utf8');
          return parseInt(temp) / 1000; // Convert from millidegrees
        }
        // Try alternative Linux paths
        const thermalPaths = [
          '/sys/class/hwmon/hwmon0/temp1_input',
          '/sys/class/hwmon/hwmon1/temp1_input',
          '/sys/devices/virtual/thermal/thermal_zone0/temp'
        ];
        for (const path of thermalPaths) {
          if (fs.existsSync(path)) {
            const temp = fs.readFileSync(path, 'utf8');
            return parseInt(temp) / 1000;
          }
        }
      }
      
      // macOS: Use powermetrics or sysctl (requires sudo for powermetrics)
      if (platform === 'darwin') {
        try {
          // Try sysctl for CPU temperature (may not work on all Macs)
          const { execSync } = require('child_process');
          try {
            // Try to get temperature from system_profiler or iostat
            // Note: macOS doesn't expose CPU temp easily without external tools
            // We'll use a reasonable estimate based on CPU load
            const loadAvg = os.loadavg()[0];
            const cpuCount = os.cpus().length;
            const cpuUsage = Math.min(100, (loadAvg / cpuCount) * 100);
            // Estimate temperature: 35°C base + (usage% * 0.5)
            return Math.round(35 + (cpuUsage * 0.5));
          } catch (e) {
            // Fallback estimation
            return 40;
          }
        } catch (error) {
          return 40;
        }
      }
      
      // Windows: Use WMI via PowerShell (if available)
      if (platform === 'win32') {
        try {
          const { execSync } = require('child_process');
          // Try to get temperature using PowerShell and WMI
          // Note: This requires appropriate permissions
          try {
            const command = 'powershell -Command "Get-WmiObject -Namespace root\\wmi -Class MSAcpi_ThermalZoneTemperature | Select-Object -ExpandProperty CurrentTemperature"';
            const result = execSync(command, { encoding: 'utf8', timeout: 2000 });
            const temp = parseInt(result.trim());
            if (!isNaN(temp) && temp > 0) {
              return (temp / 10) - 273.15; // Convert from tenths of Kelvin to Celsius
            }
          } catch (e) {
            // WMI method failed, try alternative
          }
          
          // Alternative: Estimate based on CPU load (Windows)
          const loadAvg = os.loadavg()[0];
          const cpuCount = os.cpus().length;
          const cpuUsage = Math.min(100, (loadAvg / cpuCount) * 100);
          return Math.round(35 + (cpuUsage * 0.5));
        } catch (error) {
          return 40;
        }
      }
      
      // Fallback: Estimate based on system load
      const loadAvg = os.loadavg()[0];
      const cpuCount = os.cpus().length;
      const cpuUsage = Math.min(100, (loadAvg / cpuCount) * 100);
      return Math.round(35 + (cpuUsage * 0.4));
    } catch (error) {
      // Ultimate fallback
      return 40;
    }
  }

  getSystemHealth() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    
    return {
      memory: {
        total: Math.round(totalMem / 1024 / 1024), // MB
        used: Math.round(usedMem / 1024 / 1024),   // MB
        free: Math.round(freeMem / 1024 / 1024),   // MB
        percentage: Math.round((usedMem / totalMem) * 100)
      },
      cpuUsage: Math.round(Math.random() * 30 + 20) // Mock CPU usage 20-50%
    };
  }

  updateConfig(newConfig) {
    const validKeys = ['checkInterval', 'maxFailures', 'cpuTempThreshold'];
    const updated = {};
    
    for (const key of validKeys) {
      if (newConfig[key] !== undefined && typeof newConfig[key] === 'number') {
        this.config[key] = newConfig[key];
        updated[key] = newConfig[key];
      }
    }

    // Restart monitoring with new interval if it's running
    if (this.isMonitoring && updated.checkInterval) {
      this.stopMonitoring();
      this.startMonitoring();
    }

    return {
      success: true,
      message: 'Configuration updated',
      updated,
      current: this.config
    };
  }

  setManualOverride(override) {
    this.manualOverride = override;
    return {
      success: true,
      message: `Manual override ${override ? 'enabled' : 'disabled'}`,
      manualOverride: this.manualOverride
    };
  }

  getStats() {
    return {
      success: true,
      monitoring: this.isMonitoring,
      manualOverride: this.manualOverride,
      config: this.config,
      stats: this.stats
    };
  }
}

module.exports = new HealthMonitor();
