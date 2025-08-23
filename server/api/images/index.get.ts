import type { H3Event } from 'h3';

import type { ImageMeta } from '~/types/image';

import { getAllPhotos } from '~~/server/utils/database';
import { handleApiError, createSuccessResponse } from '~~/server/utils/responses';

/**
 * Endpoint to get all photos with their metadata
 */
export default defineEventHandler(async (event: H3Event) => {
  try {
    const photos: ImageMeta[] = await getAllPhotos(event);

    const photosWithUrls = photos.map((photo) => ({
      ...photo,
      url: `/api/images/${photo.id}`,
    }));

    return createSuccessResponse({
      count: photos.length,
      photos: photosWithUrls,
    });
  } catch (error) {
    return handleApiError(event, error, 'Failed to fetch photos');
  }
});
