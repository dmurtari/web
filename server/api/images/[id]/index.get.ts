import type { H3Event } from 'h3';

import { getFile, createImageStorageKey } from '~~/server/utils/storage';
import { validateRouteParam, handleApiError } from '~~/server/utils/responses';

/**
 * Endpoint to serve individual image files from R2 storage
 */
export default defineEventHandler(async (event: H3Event) => {
  try {
    const id = validateRouteParam(event, 'id', 'Missing image ID');
    const key = createImageStorageKey(id);
    const imageObject = await getFile(event, key);

    return imageObject;
  } catch (error) {
    return handleApiError(event, error, 'Failed to fetch image');
  }
});
