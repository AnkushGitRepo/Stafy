import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';

import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api', (req, res) => {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: 'Not found.', details: {} },
  });
});

app.use(errorHandler);

export default app;
