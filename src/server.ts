import cluster from "cluster";
import os from "os";
import type { Server } from "http";
import app from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { prisma } from "./config/db";
import { redis } from "./config/redis";

const ENABLE_CLUSTERING = env.isProduction;

const startWorker = () => {
  const server: Server = app.listen(env.PORT, () => {
    logger.info(`Worker ${process.pid} listening on port ${env.PORT} (${env.NODE_ENV})`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received, shutting down worker ${process.pid} gracefully`);
    server.close(async () => {
      await Promise.allSettled([prisma.$disconnect(), redis.quit()]);
      process.exit(0);
    });

    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

if (ENABLE_CLUSTERING && cluster.isPrimary) {
  const numWorkers = os.cpus().length;
  logger.info(`Primary ${process.pid} starting ${numWorkers} workers`);

  for (let i = 0; i < numWorkers; i++) cluster.fork();

  cluster.on("exit", (worker, code, signal) => {
    logger.warn(`Worker ${worker.process.pid} exited (code=${code}, signal=${signal}); restarting`);
    cluster.fork();
  });
} else {
  startWorker();
}
