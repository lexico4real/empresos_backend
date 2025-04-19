import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export default class SwaggerConfig {
  async set(app: INestApplication) {
    const options = new DocumentBuilder()
      .setTitle('Empresos App Backend')
      .setDescription(
        'Empresos is a secure and innovative digital banking platform that provides seamless financial services, including account management, fund transfers, bill payments, and investment options. Designed for both individuals and businesses, it ensures fast, reliable, and user-friendly banking experiences.',
      )
      .setVersion('1.0.0')
      .addTag('Empresos App Backend')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'authorization',
          description: 'Enter JWT token',
          in: 'header',
        },
        'token',
      )
      .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api-docs', app, document);
  }
}
