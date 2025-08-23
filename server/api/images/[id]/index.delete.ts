import type { H3Event } from 'h3';

import { verifyCloudflareAccessToken } from '~~/server/utils/auth';
import { deletePhoto } from '~~/server/utils/database';
import { deleteFile, createImageStorageKey } from '~~/server/utils/storage';
import {
  validateRouteParam,
  handleApiError,
  createSuccessResponse,
} from '~~/server/utils/responses';

export default defineEventHandler(async (event: H3Event) => {
  try {
    await verifyCloudflareAccessToken(event);

    const id = validateRouteParam(event, 'id', 'Missing image ID');
    const key = createImageStorageKey(id);

    await deletePhoto(event, id);
    await deleteFile(event, key);

    return createSuccessResponse(null, 'Image deleted successfully');
  } catch (error) {
    return handleApiError(event, error, 'Failed to delete image');
  }
});
