import type { H3Event } from 'h3';
import { sendError, createError } from 'h3';
import { S3Service } from '~~/server/services/s3Service';

/**
 * Endpoint to serve individual image files from R2 storage
 */
export default defineEventHandler(async (event: H3Event) => {
  try {
    const id = getRouterParam(event, 'id');
    if (!id) {
      return sendError(
        event,
        createError({
          statusCode: 400,
          statusMessage: 'Missing image ID',
        }),
      );
    }

    const s3Service = new S3Service(event);
    const key = `uploads/${id}`;
    const imageObject = await s3Service.getFile(key);

    return imageObject;
  } catch (error) {
    console.error('Error fetching image:', error);
    throw createError({ statusCode: 500, message: 'Failed to fetch image' });
  }
});
