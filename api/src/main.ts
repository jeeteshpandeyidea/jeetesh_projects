import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'path';
import * as express from 'express';

const UPLOADS_DIR = join(process.cwd(), 'assets', 'uploads');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  if (!existsSync(UPLOADS_DIR)) mkdirSync(UPLOADS_DIR, { recursive: true });
  // Serve uploaded asset images at /assets/uploads/* (don't use /assets so GET /assets stays with the Nest controller)
  app.use('/assets/uploads', express.static(UPLOADS_DIR));

  // CORS configuration
  app.enableCors({
    origin: [
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      /^http:\/\/localhost:3000$/,
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Admin-Bypass'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Set referrer policy
  app.use((req, res, next) => {
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Swagger/OpenAPI config
  const config = new DocumentBuilder()
    .setTitle('Nest API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Serve Swagger UI at /api-docs
  SwaggerModule.setup('api-docs', app, document);

  // Also write swagger.json file to project root
  writeFileSync('swagger.json', JSON.stringify(document, null, 2), {
    encoding: 'utf-8',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
