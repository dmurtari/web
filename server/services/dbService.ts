import { createD1Client } from '~~/server/database/client';
import type { H3Event } from 'h3';
import type { ImageMeta } from '~~/app/types/image';
import { eq } from 'drizzle-orm';

/**
 * Service for managing photo data in the D1 database
 */
export class PhotoService {
  private client;

  constructor(event: H3Event) {
    const d1Database = event.context.cloudflare.env.DB as D1Database;
    this.client = createD1Client(d1Database);
  }

  async savePhoto({
    id,
    filename,
    originalFilename,
    mimeType,
    size,
    description,
    latitude,
    longitude,
    cameraMake,
    cameraModel,
    exposureTime,
    aperture,
    iso,
    focalLength,
    takenAt,
  }: {
    id: string;
    filename: string;
    originalFilename: string;
    mimeType: string;
    size: number;
    description?: string;
    latitude?: string;
    longitude?: string;
    cameraMake?: string;
    cameraModel?: string;
    exposureTime?: string;
    aperture?: string;
    iso?: string;
    focalLength?: string;
    takenAt?: number;
  }) {
    return await this.client.db.insert(this.client.schema.photos).values({
      id,
      filename,
      originalFilename,
      mimeType,
      size,
      description,
      latitude,
      longitude,
      cameraMake,
      cameraModel,
      exposureTime,
      aperture,
      iso,
      focalLength,
      takenAt,
      uploadedAt: Date.now(),
    });
  }

  async getAllPhotos(): Promise<ImageMeta[]> {
    return await this.client.db.select().from(this.client.schema.photos);
  }

  async deletePhoto(id: string) {
    return await this.client.db
      .delete(this.client.schema.photos)
      .where(eq(this.client.schema.photos.id, id))
      .limit(1);
  }
}
