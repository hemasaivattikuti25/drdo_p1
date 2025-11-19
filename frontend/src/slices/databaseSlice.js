import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  status: null,
  health: null,
  monitorStats: null,
  error: null,
  switchSuccess: false
};

const databaseSlice = createSlice({
  name: 'database',
  initialState,
  reducers: {
    // Status actions
    getStatusRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getStatusSuccess: (state, action) => {
      state.loading = false;
      state.status = action.payload;
    },
    getStatusFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Health actions
    getHealthRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getHealthSuccess: (state, action) => {
      state.loading = false;
      state.health = action.payload;
    },
    getHealthFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Switch database actions
    switchDbRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.switchSuccess = false;
    },
    switchDbSuccess: (state, action) => {
      state.loading = false;
      state.switchSuccess = true;
      state.status = action.payload.status;
    },
    switchDbFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.switchSuccess = false;
    },
    
    // Monitor actions
    getMonitorStatsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getMonitorStatsSuccess: (state, action) => {
      state.loading = false;
      state.monitorStats = action.payload;
    },
    getMonitorStatsFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    startMonitorRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    startMonitorSuccess: (state) => {
      state.loading = false;
    },
    startMonitorFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    stopMonitorRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    stopMonitorSuccess: (state) => {
      state.loading = false;
    },
    stopMonitorFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Clear actions
    clearError: (state) => {
      state.error = null;
    },
    clearSwitchSuccess: (state) => {
      state.switchSuccess = false;
    }
  }
});

export const {
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
  stopMonitorFail,
  clearError,
  clearSwitchSuccess
} = databaseSlice.actions;

export default databaseSlice.reducer;

