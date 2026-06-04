import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { toNodeHandler } from 'better-auth/node';
import { AppModule } from './app/app.module';
import { auth } from './app/auth/auth';
import { DatabaseErrorFilter } from './app/common/database-error.filter';
// Side-effect import: registers all OpenAPI paths so they're included
// in the generated document.
import './app/common/openapi.config';
import { generateOpenApiDocument } from './app/common/openapi.schemas';

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
  // Build a NestJS DocumentBuilder spec (info + tags) and merge it
  // with the Zod-registered schemas and paths from openapi.schemas.ts
  // so Scalar sees full request/response definitions.
  const docBuilder = new DocumentBuilder()
    .setTitle('Talent Matching API')
    .setDescription(
      'REST API for the CSIT314 talent-matching platform. ' +
        'Auth is cookie-based via better-auth; protected routes require a valid session. ' +
        'All UUIDs follow RFC 4122 v4 format.',
    )
    .setVersion('0.1.0')
    .addTag('auth', 'better-auth: sign-in, sign-up, sign-out, session management, password reset')
    .addTag('candidates', 'Candidate profile management and AI-powered search')
    .addTag('employers', 'Employer profile management')
    .addTag('jobs', 'Job posting CRUD and search')
    .addTag('applications', 'Job application lifecycle')
    .addTag('saved-jobs', 'Candidate job bookmarks');

  const docConfig = docBuilder.build();

  // Generate the full OpenAPI spec from all Zod-registered schemas/paths,
  // then layer in the DocumentBuilder info (title, description, version, tags).
  const zodSpec = generateOpenApiDocument(
    'Talent Matching API',
    docConfig.info?.description ?? '',
    docConfig.info?.version ?? '0.1.0',
  );

  // NestJS/Scalar expects the merged document with both Zod schemas
  // and DocumentBuilder metadata.
  const document = {
    ...zodSpec,
    info: zodSpec.info ?? docConfig.info,
    servers: zodSpec.servers ?? docConfig.servers ?? [],
    tags: [
      ...(zodSpec.tags ?? []),
      ...(docConfig.tags ?? []),
    ],
  };

  if (process.env.ENABLE_API_DOCS !== 'false') {
    // Raw OpenAPI JSON for Postman, code generators, etc.
    app
      .getHttpAdapter()
      .get('/openapi.json', (_req, res) => res.json(document));
    // Scalar API reference UI.
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
