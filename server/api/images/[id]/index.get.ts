import type { H3Event } from 'h3';

import { getFile, createImageStorageKey } from '~~/server/utils/storage';
import { validateRouteParam, handleApiError } from '~~/server/utils/responses';
import logger from '~~/server/utils/logger';

export default defineEventHandler(async (event: H3Event) => {
  try {
    const id = validateRouteParam(event, 'id', 'Missing image ID');
    logger.info('Fetching image file', { imageId: id });

    const key = createImageStorageKey(id);
    const imageObject = await getFile(event, key);

    logger.debug('Image file retrieved successfully', { imageId: id, key });
    return imageObject;
  } catch (error) {
    return handleApiError(event, error, 'Failed to fetch image');
  }
});
