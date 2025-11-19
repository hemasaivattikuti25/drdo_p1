const mongoose = require('mongoose');

class DatabaseManager {
  constructor() {
    this.connection = null;
    this.currentMode = null;
    this.isConnected = false;
    this.eventsBound = false;
  }

  async connect(mode = 'standalone') {
    try {
      if (this.isConnected && this.currentMode === mode) {
        console.log(`📊 Already connected to ${mode} database`);
        return this.connection;
      }

      if (this.isConnected) {
        await this.disconnect();
      }

      const uri = mode === 'replica' 
        ? process.env.MONGO_URI_REPLICA 
        : process.env.MONGO_URI_STANDALONE;

      if (!uri) {
        throw new Error(`No MongoDB URI found for ${mode} mode`);
      }

      console.log(`🔗 Connecting to ${mode} database...`);
      
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        heartbeatFrequencyMS: 2000,
        ...(mode === 'replica' && {
          readPreference: 'primaryPreferred',
          replicaSet: 'rs0'
        })
      };

      this.connection = await mongoose.connect(uri, options);
      this.currentMode = mode;
      this.isConnected = true;

      console.log(`✅ Connected to ${mode} database: ${this.connection.connection.host}`);
      
      // Set up connection event handlers
      this.setupEventHandlers();
      
      return this.connection;
    } catch (error) {
      console.error(`❌ Database connection failed (${mode}):`, error.message);
      this.isConnected = false;
      throw error;
    }
  }

  setupEventHandlers() {
    if (this.eventsBound) {
      return;
    }

    mongoose.connection.on('connected', () => {
      console.log('📊 Database connected');
      this.isConnected = true;
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Database error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📊 Database disconnected');
      this.isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('📊 Database reconnected');
      this.isConnected = true;
    });

    this.eventsBound = true;
  }

  async disconnect() {
    try {
      if (this.isConnected) {
        await mongoose.disconnect();
        console.log('📊 Database disconnected');
      }
      this.isConnected = false;
      this.currentMode = null;
      this.connection = null;
    } catch (error) {
      console.error('❌ Error disconnecting database:', error.message);
    }
  }

  getStatus() {
    return {
      connected: this.isConnected,
      mode: this.currentMode,
      host: this.isConnected ? mongoose.connection.host : null,
      readyState: mongoose.connection.readyState,
      readyStateText: this.getReadyStateText()
    };
  }

  getReadyStateText() {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    return states[mongoose.connection.readyState] || 'unknown';
  }

  async checkHealth() {
    try {
      if (!this.isConnected) {
        return { healthy: false, error: 'Not connected' };
      }

      await mongoose.connection.db.admin().ping();
      return { 
        healthy: true, 
        mode: this.currentMode,
        host: mongoose.connection.host 
      };
    } catch (error) {
      return { 
        healthy: false, 
        error: error.message 
      };
    }
  }
}

module.exports = new DatabaseManager();
