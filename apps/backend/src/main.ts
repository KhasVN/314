import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { toNodeHandler } from 'better-auth/node';
import { AppModule } from './app/app.module';
import { auth } from './app/auth/auth';
import { DatabaseErrorFilter } from './app/common/database-error.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  const webOrigins = (process.env.WEB_ORIGIN ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: webOrigins,
    credentials: true,
  });
  app.useGlobalFilters(new DatabaseErrorFilter());
  app
    .getHttpAdapter()
    .getInstance()
    .all('/api/auth/*splat', toNodeHandler(auth));

  // ── OpenAPI / Scalar reference ─────────────────────────────────────
  // Build the document with @nestjs/swagger's TS-reflection-based
  // DocumentBuilder and hand it to Scalar. Disable in production by
  // setting ENABLE_API_DOCS=false.
  const config = new DocumentBuilder()
    .setTitle('Talent Matching API')
    .setDescription(
      'REST API for the CSIT314 talent-matching platform. ' +
        'Auth is cookie-based via better-auth; protected routes require a valid session.',
    )
    .setVersion('0.1.0')
    .addTag('app')
    .addTag('candidates')
    .addTag('employers')
    .addTag('jobs')
    .addTag('applications')
    .addTag('saved-jobs')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  if (process.env.ENABLE_API_DOCS !== 'false') {
    // Raw OpenAPI JSON for tooling (Postman, code generators, etc.).
    app
      .getHttpAdapter()
      .get('/openapi.json', (_req, res) => res.json(document));
    // Scalar UI.
    app.use(
      '/reference',
      apiReference({ content: document }),
    );
    Logger.log(
      `API docs:  http://localhost:${process.env.PORT || 4000}/reference`,
    );
  }

  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 4000;
  await app.listen(port);
  Logger.log(
    `Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
