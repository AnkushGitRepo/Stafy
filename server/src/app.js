import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';

import { errorHandler } from './middleware/errorHandler.js';
import attendanceRoutes from './routes/attendance.js';
import attendanceHistoryRoutes from './routes/attendanceHistory.js';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import employeesRoutes from './routes/employees.js';
import leaveRoutes from './routes/leave.js';

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/attendance', attendanceHistoryRoutes);
app.use('/api/leave-requests', leaveRoutes);
app.use('/api/employees', employeesRoutes);

app.use('/api', (req, res) => {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: 'Not found.', details: {} },
  });
});

app.use(errorHandler);

export default app;
