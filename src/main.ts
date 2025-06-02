import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidateInputPipe } from './core/pipes/validate.pipe';
import * as dotenv from 'dotenv';
import * as bodyParser from 'body-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidateInputPipe());

  app.use('/api/payments/webhook', bodyParser.raw({ type: '*/*' }));

  const config = new DocumentBuilder()
    .setTitle('O’Ben Brands API')
    .setDescription('API documentation for the O’Ben Brands project')
    .setVersion('1.0')
    .addTag('O’Ben')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(3000);
}
bootstrap();
