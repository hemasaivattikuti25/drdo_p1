import axios from 'axios';
import {
  getStatusRequest,
  getStatusSuccess,
  getStatusFail,
  getHealthRequest,
  getHealthSuccess,
  getHealthFail,
  switchDbRequest,
  switchDbSuccess,
  switchDbFail,
  getMonitorStatsRequest,
  getMonitorStatsSuccess,
  getMonitorStatsFail,
  startMonitorRequest,
  startMonitorSuccess,
  startMonitorFail,
  stopMonitorRequest,
  stopMonitorSuccess,
  stopMonitorFail
} from '../slices/databaseSlice';

// Get database status
export const getDatabaseStatus = () => async (dispatch) => {
  try {
    dispatch(getStatusRequest());
    const { data } = await axios.get('/api/admin/status');
    dispatch(getStatusSuccess(data));
  } catch (error) {
    dispatch(getStatusFail(error.response?.data?.message || 'Failed to get database status'));
  }
};

// Get database health
export const getDatabaseHealth = () => async (dispatch) => {
  try {
    dispatch(getHealthRequest());
    const { data } = await axios.get('/api/admin/health');
    dispatch(getHealthSuccess(data));
  } catch (error) {
    dispatch(getHealthFail(error.response?.data?.message || 'Failed to get database health'));
  }
};

// Switch database mode
export const switchDatabase = (mode) => async (dispatch) => {
  try {
    dispatch(switchDbRequest());
    const { data } = await axios.post('/api/admin/switch-db', { mode });
    dispatch(switchDbSuccess(data));
  } catch (error) {
    dispatch(switchDbFail(error.response?.data?.message || 'Failed to switch database'));
  }
};

// Get monitor statistics
export const getMonitorStats = () => async (dispatch) => {
  try {
    dispatch(getMonitorStatsRequest());
    const { data } = await axios.get('/api/admin/monitor/stats');
    dispatch(getMonitorStatsSuccess(data));
  } catch (error) {
    dispatch(getMonitorStatsFail(error.response?.data?.message || 'Failed to get monitor stats'));
  }
};

// Start health monitoring
export const startMonitoring = () => async (dispatch) => {
  try {
    dispatch(startMonitorRequest());
    const { data } = await axios.post('/api/admin/monitor/start');
    dispatch(startMonitorSuccess());
    return data;
  } catch (error) {
    dispatch(startMonitorFail(error.response?.data?.message || 'Failed to start monitoring'));
    throw error;
  }
};

// Stop health monitoring
export const stopMonitoring = () => async (dispatch) => {
  try {
    dispatch(stopMonitorRequest());
    const { data } = await axios.post('/api/admin/monitor/stop');
    dispatch(stopMonitorSuccess());
    return data;
  } catch (error) {
    dispatch(stopMonitorFail(error.response?.data?.message || 'Failed to stop monitoring'));
    throw error;
  }
};

// Perform manual health check
export const performHealthCheck = () => async () => {
  try {
    const { data } = await axios.post('/api/admin/monitor/check');
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to perform health check');
  }
};

