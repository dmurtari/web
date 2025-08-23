import { createD1Client } from '~~/server/database/client';
import type { H3Event } from 'h3';
import type { ImageMeta } from '~/types/image';
import { ImageMetaSchema } from '~/types/image';
import { eq } from 'drizzle-orm';

export function getDatabase(event: H3Event) {
  const d1Database = event.context.cloudflare.env.DB as D1Database;
  return createD1Client(d1Database);
}

/**
 * Wrapper function to execute database operations with consistent client setup
 */
async function withDatabase<T>(
  event: H3Event,
  operation: (db: ReturnType<typeof createD1Client>) => Promise<T>,
): Promise<T> {
  const dbClient = getDatabase(event);
  return await operation(dbClient);
}

export async function savePhoto(event: H3Event, photo: Omit<ImageMeta, 'url' | 'uploadedAt'>) {
  return await withDatabase(event, async ({ db, schema }) => {
    return await db.insert(schema.photos).values({
      ...photo,
      uploadedAt: Date.now(),
    });
  });
}

export async function updatePhoto(
  event: H3Event,
  id: string,
  updates: Partial<Omit<ImageMeta, 'id' | 'url' | 'uploadedAt'>>,
) {
  return await withDatabase(event, async ({ db, schema }) => {
    return await db.update(schema.photos).set(updates).where(eq(schema.photos.id, id));
  });
}

export async function getAllPhotos(event: H3Event): Promise<ImageMeta[]> {
  return await withDatabase(event, async ({ db, schema }) => {
    const rawPhotos = await db.select().from(schema.photos);

    // Transform null values to undefined using Zod schema
    return rawPhotos.map((photo) => ImageMetaSchema.parse(photo));
  });
}

export async function deletePhoto(event: H3Event, id: string) {
  return await withDatabase(event, async ({ db, schema }) => {
    return await db.delete(schema.photos).where(eq(schema.photos.id, id)).limit(1);
  });
}
