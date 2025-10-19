import type { H3Event } from 'h3';

import type { ImageMeta } from '~/types/image';

import { getAllPhotos } from '~~/server/utils/database';
import { handleApiError, createSuccessResponse } from '~~/server/utils/responses';
import logger from '~~/server/utils/logger';

export default defineEventHandler(async (event: H3Event) => {
  try {
    logger.info('Processing request to list all photos');
    const photos: ImageMeta[] = await getAllPhotos(event);

    // Environment-aware URL generation
    const isDevelopment = process.env.NODE_ENV === 'development';

    const photosWithUrls = photos.map((photo) => ({
      ...photo,
      url: isDevelopment
        ? `/api/images/${photo.id}`
        : `https://images.kazusan.me/uploads/${photo.id}`,
    }));

    logger.info(`Successfully fetched ${photos.length} photos`);

    return createSuccessResponse({
      count: photos.length,
      photos: photosWithUrls,
    });
  } catch (error) {
    return handleApiError(event, error, 'Failed to fetch photos');
  }
});
