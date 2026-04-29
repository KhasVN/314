import { Injectable, Logger } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);
  private vectorSupport: boolean | undefined;

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

}

function messageFrom(error: unknown) {
  return error instanceof Error ? error.message : 'Database capability check failed';
}
