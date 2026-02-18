import 'dotenv/config';
import app from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import { logger } from './utils/logger';
import { startScheduler } from './jobs/scheduler';

async function start(): Promise<void> {
  // Start HTTP server first so Railway sees a healthy port
  app.listen(Number(env.PORT), '0.0.0.0', () => {
    logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });

  // Then connect to database (retries internally)
  await connectDatabase();

  // Start cron jobs after DB is ready
  startScheduler();
}

start().catch((error) => {
  logger.error({ error }, 'Failed to start server');
});
