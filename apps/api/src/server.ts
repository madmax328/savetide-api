import 'dotenv/config';
import app from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import { logger } from './utils/logger';
import { startScheduler } from './jobs/scheduler';

async function start(): Promise<void> {
  await connectDatabase();

  app.listen(Number(env.PORT), () => {
    logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);

    // Start cron jobs after server is ready
    startScheduler();
  });
}

start().catch((error) => {
  logger.error({ error }, 'Failed to start server');
  process.exit(1);
});
