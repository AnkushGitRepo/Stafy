import app from './app.js';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';

const port = process.env.PORT || 4000;

app.listen(port, () => {
  logger.info({ port, env: env.NODE_ENV }, 'server listening');
});
