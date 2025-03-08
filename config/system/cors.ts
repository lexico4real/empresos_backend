import * as config from 'config';
import Logger from 'config/log4js/logger';

const serverConfig = config.get('server');
const logger = new Logger();

export default class CorsConfig {
  async set(app: any) {
    if (process.env.NODE_ENV === 'development') {
      await app.enableCors();
    } else {
      await app.enableCors({
        origin: serverConfig['origin'],
      });
      logger.log(
        'app',
        'trace',
        `accepting request from ${serverConfig['origin']}`,
        'server-request',
      );
    }
  }
}
