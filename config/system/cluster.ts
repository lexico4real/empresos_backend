import Logger from 'config/log4js/logger';
import * as cluster from 'cluster';
import * as config from 'config';
import * as os from 'os';

const serverConfig = config.get('server');
const logger = new Logger();
const numCPUs = os.cpus();

export default class ClusterConfig {
  async set(app: any) {
    if (process.env.NODE_ENV !== 'development') {
      try {
        if (await cluster['isPrimary']) {
          await logger.log(
            'cluster',
            'info',
            `Master ${process.pid} is running`,
            'cluster',
          );
          for (let i = 0; i < numCPUs.length; i++) {
            await cluster['fork']();
            process.stdout.on('error', async function (error) {
              if (error.code == 'EPIPE') {
                await process.exit(0);
              }
            });
            await logger.log(
              'cluster',
              'info',
              `Worker ${process.pid} is running`,
              'cluster',
            );
          }
          await cluster['on'](
            'exit',
            async (
              worker: { process: { pid: any } },
              code: any,
              signal: any,
            ) => {
              await logger.log(
                'cluster',
                'warn',
                `Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`,
                'cluster',
              );
              await logger.log(
                'cluster',
                'info',
                'Starting a new worker',
                'cluster',
              );
            },
          );
        } else {
          await app.listen(process.env.PORT || serverConfig['port']);
          await logger.log(
            'app',
            'info',
            `Server started on port ${serverConfig['port']}`,
            'bootstrap',
          );
        }
      } catch (error) {
        await logger.log(
          'cluster',
          'error',
          JSON.stringify(error) as any,
          'cluster',
        );
      }
    } else {
      await app.listen(process.env.PORT || serverConfig['port']);
      await logger.log(
        'app',
        'info',
        `Server started on port ${serverConfig['port']}`,
        'bootstrap',
      );
    }
  }
}
