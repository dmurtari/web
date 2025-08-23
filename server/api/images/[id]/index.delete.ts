import type { H3Event } from 'h3';

import { verifyCloudflareAccessToken } from '~~/server/utils/auth';
import { deletePhoto } from '~~/server/utils/database';
import { deleteFile, createImageStorageKey } from '~~/server/utils/storage';
import {
  validateRouteParam,
  handleApiError,
  createSuccessResponse,
} from '~~/server/utils/responses';
import logger from '~~/server/utils/logger';

export default defineEventHandler(async (event: H3Event) => {
  try {
    logger.info('Processing image deletion request');
    await verifyCloudflareAccessToken(event);

    const id = validateRouteParam(event, 'id', 'Missing image ID');
    logger.debug('Deleting from database', { imageId: id });
    await deletePhoto(event, id);

    const key = createImageStorageKey(id);
    logger.debug('Deleting from storage', { imageId: id, key });
    await deleteFile(event, key);

    logger.success('Image deleted successfully', { imageId: id });
    return createSuccessResponse(null, 'Image deleted successfully');
  } catch (error) {
    return handleApiError(event, error, 'Failed to delete image');
  }
});
