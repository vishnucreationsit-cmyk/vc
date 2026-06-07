const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');

const app = express();

// Security and Middleware
app.use(helmet());
app.use(cors({
  origin: [process.env.FRONTEND_URL, 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
