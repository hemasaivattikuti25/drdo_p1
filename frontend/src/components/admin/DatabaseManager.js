import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';

const initialConfig = {
  checkInterval: '',
  maxFailures: '',
  cpuTempThreshold: ''
};

export default function DatabaseManager() {
  const [status, setStatus] = useState(null);
  const [monitorStats, setMonitorStats] = useState(null);
  const [configForm, setConfigForm] = useState(initialConfig);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchJson = async (url, options = {}) => {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      ...options
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || data.error || `Request failed: ${res.status}`);
    }
    return data;
  };

  const loadStatus = async () => {
    const data = await fetchJson('/api/admin/status');
    setStatus(data);
  };

  const loadMonitorStats = async () => {
    const data = await fetchJson('/api/admin/monitor/stats');
    setMonitorStats(data);
    if (data.config) {
      setConfigForm({
        checkInterval: data.config.checkInterval,
        maxFailures: data.config.maxFailures,
        cpuTempThreshold: data.config.cpuTempThreshold
      });
    }
  };

  const refreshAll = async () => {
    await Promise.all([loadStatus(), loadMonitorStats().catch(() => {})]);
  };

  useEffect(() => {
    setLoading(true);
    refreshAll()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSwitchMode = async (mode) => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const data = await fetchJson('/api/admin/switch-db', {
        method: 'POST',
        body: JSON.stringify({ mode })
      });
      setMessage(data.message || `Switched to ${mode}`);
      await refreshAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMonitorCommand = async (path) => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const data = await fetchJson(path, { method: 'POST' });
      if (data.message) setMessage(data.message);
      await refreshAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    setConfigForm((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const handleConfigSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const data = await fetchJson('/api/admin/monitor/config', {
        method: 'PUT',
        body: JSON.stringify(configForm)
      });
      setMessage(data.message || 'Configuration updated');
      await loadMonitorStats();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentDb = status?.database || {};
  const monitor = monitorStats || {};

  return (
    <div className="row">
      <div className="col-12 col-md-2">
        <Sidebar />
      </div>
      <div className="col-12 col-md-10">
        <h1 className="my-4">Database Management</h1>

        {loading && <div className="alert alert-info">Working...</div>}
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="row mb-4">
          <div className="col-md-6 mb-3">
            <div className="card">
              <div className="card-header">Current Database Status</div>
              <div className="card-body">
                <p><strong>Mode:</strong> {currentDb.mode || 'unknown'}</p>
                <p><strong>Connected:</strong> {String(currentDb.connected)}</p>
                <p><strong>Host:</strong> {currentDb.host || '-'}</p>
                <p><strong>Ready State:</strong> {currentDb.readyStateText} ({currentDb.readyState})</p>
                <p><strong>Healthy:</strong> {String(currentDb.healthy)}</p>
              </div>
            </div>
          </div>

          <div className="col-md-6 mb-3">
            <div className="card">
              <div className="card-header">CPU & Memory (Last Check)</div>
              <div className="card-body">
                <p><strong>CPU Temp:</strong> {monitor?.stats?.lastCheck ? `${monitor?.lastResult?.cpu?.temperature || 'N/A'} °C` : 'Use health check'} </p>
                <p><strong>Monitoring:</strong> {String(monitor.monitoring)}</p>
                <p><strong>Total Checks:</strong> {monitor?.stats?.totalChecks ?? 0}</p>
                <p><strong>DB Switches:</strong> {monitor?.stats?.dbSwitches ?? 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-6 mb-3">
            <div className="card">
              <div className="card-header">Manual Database Switch</div>
              <div className="card-body">
                <button
                  className="btn btn-outline-primary mr-2"
                  onClick={() => handleSwitchMode('standalone')}
                >
                  Use Standalone
                </button>
                <button
                  className="btn btn-outline-success mr-2"
                  onClick={() => handleSwitchMode('replica')}
                >
                  Use Replica
                </button>
                <button
                  className="btn btn-outline-secondary mt-2"
                  onClick={() => handleMonitorCommand('/api/admin/clear-override')}
                >
                  Clear Manual Override
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-6 mb-3">
            <div className="card">
              <div className="card-header">Health Monitoring Controls</div>
              <div className="card-body">
                <button
                  className="btn btn-success mr-2"
                  onClick={() => handleMonitorCommand('/api/admin/monitor/start')}
                >
                  Start Monitoring
                </button>
                <button
                  className="btn btn-warning mr-2"
                  onClick={() => handleMonitorCommand('/api/admin/monitor/stop')}
                >
                  Stop Monitoring
                </button>
                <button
                  className="btn btn-info mt-2"
                  onClick={() => handleMonitorCommand('/api/admin/monitor/check')}
                >
                  Run Health Check Now
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header">Monitor Configuration</div>
              <div className="card-body">
                <form onSubmit={handleConfigSubmit}>
                  <div className="form-group">
                    <label htmlFor="checkInterval">Check Interval (ms)</label>
                    <input
                      type="number"
                      id="checkInterval"
                      name="checkInterval"
                      className="form-control"
                      value={configForm.checkInterval}
                      onChange={handleConfigChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="maxFailures">Max Failures Before Switch</label>
                    <input
                      type="number"
                      id="maxFailures"
                      name="maxFailures"
                      className="form-control"
                      value={configForm.maxFailures}
                      onChange={handleConfigChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cpuTempThreshold">CPU Temp Threshold (°C)</label>
                    <input
                      type="number"
                      id="cpuTempThreshold"
                      name="cpuTempThreshold"
                      className="form-control"
                      value={configForm.cpuTempThreshold}
                      onChange={handleConfigChange}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary mt-2">
                    Save Configuration
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
