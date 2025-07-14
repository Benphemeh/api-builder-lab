import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidateInputPipe } from './core/pipes/validate.pipe';
import * as dotenv from 'dotenv';
import * as bodyParser from 'body-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as client from 'prom-client';
import { Response } from 'express';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidateInputPipe());
  app.use('/api/payments/webhook', bodyParser.raw({ type: '*/*' }));

  // Swagger documentation setup
  const config = new DocumentBuilder()
    .setTitle('O’Ben Brands API')
    .setDescription('API documentation for the O’Ben Brands project')
    .setVersion('1.0')
    .addTag('O’Ben')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // Prometheus metrics setup
  client.collectDefaultMetrics();
  app
    .getHttpAdapter()
    .getInstance()
    .get('/metrics', async (req, res: Response) => {
      res.set('Content-Type', client.register.contentType);
      res.end(await client.register.metrics());
    });

  await app.listen(3030);
}
bootstrap();
