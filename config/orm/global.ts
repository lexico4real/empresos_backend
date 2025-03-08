import { ConnectionOptions } from 'typeorm';
import * as config from 'config';
import 'dotenv';

const dbConfig = config.get('db');

export const typeOrmConfig: ConnectionOptions = {
  type: dbConfig['type'] || 'postgres',
  host: process.env.DATABASE_HOST || dbConfig['host'],
  port: process.env.DATABASE_PORT || dbConfig['port'],
  username: process.env.DATABASE_USERNAME || dbConfig['username'],
  password: process.env.DATABASE_PASSWORD || dbConfig['password'],
  database: process.env.DATABASE_NAME || dbConfig['database'],
  synchronize: process.env.TYPEORM_SYNC || dbConfig['synchronize'],
  migrationsRun: true,
  logging: true,
  logger: 'file',
  migrations: [__dirname + '/migrations/**/*{.ts, .js}'],
  cli: {
    migrationsDir: 'src/migrations',
  },
};
