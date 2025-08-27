import type { H3Event } from 'h3';

import type { ImageMeta } from '~/types/image';
import logger from '~~/server/utils/logger';

export default defineEventHandler(async (event: H3Event) => {
  try {
    logger.info('Processing update request');
    await verifyCloudflareAccessToken(event);

    const id = validateRouteParam(event, 'id', 'Missing image ID');
    const photoUpdate: ImageMeta = await updatePhoto(event, id, await readBody(event));

    return photoUpdate;
  } catch (error) {
    logger.error('Failed to update photo', { error });
    throw createError({ statusCode: 500, statusMessage: 'Failed to update photo' });
  }
});
