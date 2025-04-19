import { Injectable } from '@nestjs/common';
import * as packageInfo from './../package.json';

@Injectable()
export class AppService {
  getAppInfo() {
    return {
      name: packageInfo.name,
      version: packageInfo.version,
      description: packageInfo.description,
      author: packageInfo.author,
      license: packageInfo.license,
      contact: {
        email: 'support@empresos.com',
        website: 'https://www.empresos.com',
      },
    };
  }
}
