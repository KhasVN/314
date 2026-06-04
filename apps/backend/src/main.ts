import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { toNodeHandler } from 'better-auth/node';
import { AppModule } from './app/app.module';
import { auth } from './app/auth/auth';
import { DatabaseErrorFilter } from './app/common/database-error.filter';
import './app/common/openapi.config';
import { generateOpenApiDocument } from './app/common/openapi.schemas';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  const webOrigins = (process.env.WEB_ORIGIN ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({ origin: webOrigins, credentials: true });
  app.useGlobalFilters(new DatabaseErrorFilter());
  app
    .getHttpAdapter()
    .getInstance()
    .all('/api/auth/*splat', toNodeHandler(auth));

  const docBuilder = new DocumentBuilder()
    .setTitle('Talent Matching API')
    .setDescription(
      'REST API for the CSIT314 talent-matching platform. ' +
        'Auth is cookie-based via better-auth; protected routes require a valid session. ' +
        'All UUIDs follow RFC 4122 v4 format.',
    )
    .setVersion('0.1.0')
    .addTag('auth', 'better-auth: sign-in, sign-up, sign-out, session, password reset')
    .addTag('candidates', 'Profile management and AI-powered candidate search')
    .addTag('employers', 'Profile management')
    .addTag('jobs', 'Job posting CRUD and search')
    .addTag('applications', 'Job application lifecycle')
    .addTag('saved-jobs', 'Candidate job bookmarks');

  const docConfig = docBuilder.build();

  const zodSpec = generateOpenApiDocument(
    'Talent Matching API',
    docConfig.info?.description ?? '',
    docConfig.info?.version ?? '0.1.0',
  );

  const document = {
    ...zodSpec,
    info: zodSpec.info ?? docConfig.info,
    servers: zodSpec.servers ?? docConfig.servers ?? [],
    tags: [...(zodSpec.tags ?? []), ...(docConfig.tags ?? [])],
  };

  if (process.env.ENABLE_API_DOCS !== 'false') {
    app.getHttpAdapter().get('/openapi.json', (_req, res) => res.json(document));
    app.use('/reference', apiReference({ content: document }));
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
