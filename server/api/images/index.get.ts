import type { H3Event } from 'h3';
import { PhotoService } from '../../services/photoService';

/**
 * Endpoint to get all photos with their metadata
 */
export default defineEventHandler(async (event: H3Event) => {
  try {
    const photoService = new PhotoService(event);
    const photos = await photoService.getAllPhotos();

    return {
      success: true,
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
