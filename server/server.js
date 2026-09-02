const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { initDB } = require('./database/db');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Smart Service Desk API'
  });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`Smart Service Desk Backend running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
