const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');

const errorMiddleware = require('./middlewares/error');

dotenv.config({ path: path.join(__dirname, 'config/config.env') });

const databaseManager = require('./config/database');
const app = express();

// Core middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration
const productionOrigin =
  process.env.FRONTEND_URL ||
  process.env.BACKEND_URL ||
  'http://localhost:3000';

app.use(
  cors({
    origin: process.env.NODE_ENV === 'production' ? productionOrigin : true,
    credentials: true
  })
);

// Optional middlewares
try {
  const helmet = require('helmet');
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }
    })
  );
} catch (error) {
  console.log('Helmet not available, continuing without additional security headers');
}

try {
  const morgan = require('morgan');
  app.use(morgan('combined'));
} catch (error) {
  console.log('Morgan not available, continuing without request logging');
}

// Static assets
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/v1', require('./routes/product'));
app.use('/api/v1', require('./routes/auth'));
app.use('/api/v1', require('./routes/order'));
app.use('/api/v1', require('./routes/payment'));
app.use('/api/products', require('./routes/products'));
app.use('/api/admin', require('./routes/admin'));

app.get('/api/health', async (req, res) => {
  try {
    const status = databaseManager.getStatus();
    const health = await databaseManager.checkHealth();
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      database: {
        ...status,
        ...health
      },
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        node: process.version
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/build/index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      message: 'FAVcart API Server',
      timestamp: new Date().toISOString(),
      database: databaseManager.getStatus()
    });
  });
}

// Error handling
app.use(errorMiddleware);

module.exports = app;