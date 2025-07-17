import { drizzle } from 'drizzle-orm/d1';
import type { AnyD1Database } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import * as schema from '../schema';

/**
 * Creates a D1 database client using Drizzle ORM
 *
 * @param d1Database The D1 database instance from the Cloudflare environment
 * @returns A Drizzle ORM client configured for D1
 */
export function createD1Client(d1Database: AnyD1Database) {
  const db = drizzle(d1Database, { schema });

  return {
    db,
    schema,

    // Helper methods can be added here for common operations
    getPhotoById: (id: string) => db.select().from(schema.photos).where(eq(schema.photos.id, id)),

    // Add more helper methods as needed
  };
}
