import Logger from '../log4js/logger';

const logger = new Logger();

export default class CorsConfig {
  async set(app: any) {
    if (process.env.NODE_ENV === 'development') {
      await app.enableCors();
    } else {
      await app.enableCors({
        origin: process.env.ORIGIN,
      });
      logger.log(
        'app',
        'trace',
        `accepting request from ${process.env.ORIGIN}`,
        'server-request',
      );
    }
  }
}
