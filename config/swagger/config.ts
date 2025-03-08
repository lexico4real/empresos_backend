import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export default class SwaggerConfig {
  async set(app: INestApplication) {
    const options = new DocumentBuilder()
      .setTitle('Event Ticket Booking System')
      .setDescription(
        'Node.js server that provides a RESTful API for an event ticket booking system with the following core functionalities: \n1. Initialize an event with a set number of available tickets. \n2. Allow users to book tickets concurrently. \n3. Implement a waiting list for when tickets are sold out. \n4. Provide endpoints to view available tickets and the waiting list. \n5. Handle ticket cancellations and automatic assignment to waiting list users. \n6. Save the order details to a RDBMs.',
      )
      .setVersion('1.0')
      .addTag('Test API')
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
    SwaggerModule.setup('api', app, document);
  }
}
