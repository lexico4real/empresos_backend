import Logger from './../../config/log4js/logger';
import cluster from 'cluster';
import * as os from 'os';

const logger = new Logger();
const numCPUs = os.cpus().length;

export default class ClusterConfig {
  async set(app: any) {
    if (process.env.NODE_ENV !== 'development') {
      try {
        if (cluster.isPrimary) {
          await logger.log(
            'cluster',
            'info',
            `Master ${process.pid} is running`,
            'cluster',
          );
          for (let i = 0; i < numCPUs; i++) {
            cluster.fork();
            process.stdout.on('error', function (error) {
              if (error.code == 'EPIPE') {
                process.exit(0);
              }
            });
            logger.log(
              'cluster',
              'info',
              `Worker ${process.pid} is running`,
              'cluster',
            );
          }
          cluster.on(
            'exit',
            async (
              worker: { process: { pid: any } },
              code: any,
              signal: any,
            ) => {
              logger.log(
                'cluster',
                'warn',
                `Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`,
                'cluster',
              );
              logger.log('cluster', 'info', 'Starting a new worker', 'cluster');
            },
          );
        } else {
          await app.listen(process.env.PORT);
          logger.log(
            'app',
            'info',
            `Server started on port ${process.env.PORT}`,
            'bootstrap',
          );
        }
      } catch (error) {
        logger.log('cluster', 'error', JSON.stringify(error) as any, 'cluster');
      }
    } else {
      await app.listen(process.env.PORT);
      logger.log(
        'app',
        'info',
        `Server started on port ${process.env.PORT}`,
        'bootstrap',
      );
    }
  }
}
