import type { H3Event } from 'h3';
import type { ImageMeta } from '~~/app/types/image';
import { PhotoService } from '~~/server/services/dbService';

/**
 * Endpoint to get all photos with their metadata
 */
export default defineEventHandler(async (event: H3Event) => {
  try {
    const photoService = new PhotoService(event);
    const photos: ImageMeta[] = await photoService.getAllPhotos();

    return {
      success: true,
      count: photos.length,
      photos: photos.map((photo) => ({
        ...photo,
        url: `/api/images/${photo.id}`,
      })),
    };
  } catch (error) {
    console.error('Error fetching photos:', error);
    throw createError({ statusCode: 500, message: 'Failed to fetch photos' });
  }
});
