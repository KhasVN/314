import { Injectable, Logger } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);
  private vectorSupport: boolean | undefined;
  private bm25Support: boolean | undefined;

  private readonly pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  readonly db = drizzle(this.pool);

  async hasVectorSupport() {
    if (this.vectorSupport !== undefined) {
      return this.vectorSupport;
    }

    try {
      await this.pool.query("SELECT '[1,2,3]'::vector");
      this.vectorSupport = true;
    } catch (error) {
      this.vectorSupport = false;
      this.logger.warn(messageFrom(error));
    }

    return this.vectorSupport;
  }

  async hasBm25Support() {
    if (this.bm25Support !== undefined) {
      return this.bm25Support;
    }

    try {
      const result = await this.pool.query<{ exists: boolean }>(
        "SELECT to_regproc('bm25topk') IS NOT NULL AS exists",
      );
      this.bm25Support = Boolean(result.rows[0]?.exists);
    } catch {
      this.bm25Support = false;
    }

    return this.bm25Support;
  }
}

function messageFrom(error: unknown) {
  return error instanceof Error ? error.message : 'Database capability check failed';
}
