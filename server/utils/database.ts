import type { H3Event } from 'h3';
import { eq } from 'drizzle-orm';

import type { ImageMeta } from '~/types/image';
import { ImageMetaSchema } from '~/types/image';

import { createD1Client } from '~~/server/database/client';
import logger from '~~/server/utils/logger';

export function getDatabase(event: H3Event) {
  const d1Database = event.context.cloudflare.env.DB as D1Database;
  return createD1Client(d1Database);
}

async function withDatabase<T>(
  event: H3Event,
  operation: (db: ReturnType<typeof createD1Client>) => Promise<T>,
): Promise<T> {
  const dbClient = getDatabase(event);
  return await operation(dbClient);
}

export async function savePhoto(event: H3Event, photo: Omit<ImageMeta, 'url' | 'uploadedAt'>) {
  logger.info('Saving photo to database', { photoId: photo.id, filename: photo.filename });
  return await withDatabase(event, async ({ db, schema }) => {
    const result = await db.insert(schema.photos).values({
      ...photo,
      uploadedAt: Date.now(),
    });
    logger.debug('Photo saved successfully', { photoId: photo.id });
    return result;
  });
}

export async function updatePhoto(
  event: H3Event,
  id: string,
  updates: Partial<Omit<ImageMeta, 'id' | 'url' | 'uploadedAt'>>,
) {
  logger.info('Updating photo in database', { photoId: id, updates: Object.keys(updates) });
  return await withDatabase(event, async ({ db, schema }) => {
    const result = await db.update(schema.photos).set(updates).where(eq(schema.photos.id, id));
    logger.debug('Photo updated successfully', { photoId: id });
    return result;
  });
}

export async function getAllPhotos(event: H3Event): Promise<ImageMeta[]> {
  logger.debug('Fetching all photos from database');
  return await withDatabase(event, async ({ db, schema }) => {
    const rawPhotos = await db.select().from(schema.photos);
    logger.info('Photos retrieved from database', { count: rawPhotos.length });

    return rawPhotos.map((photo) => ImageMetaSchema.parse(photo));
  });
}

export async function deletePhoto(event: H3Event, id: string) {
  logger.info('Deleting photo from database', { photoId: id });
  return await withDatabase(event, async ({ db, schema }) => {
    const result = await db.delete(schema.photos).where(eq(schema.photos.id, id)).limit(1);
    logger.debug('Photo deleted from database', { photoId: id });
    return result;
  });
}
