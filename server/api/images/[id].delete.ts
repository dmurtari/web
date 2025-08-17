import type { H3Event } from 'h3';
import { DbService } from '~~/server/services/dbService';
import { S3Service } from '~~/server/services/s3Service';

export default defineEventHandler(async (event: H3Event) => {
  try {
    await verifyCloudflareAccessToken(event);

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
    const photoService = new DbService(event);
    const key = `uploads/${id}`;

    console.log('Deleting image with ID:', id);
    await photoService.deletePhoto(id);
    console.log('Deleting from S3 with key:', key);
    await s3Service.deleteFile(key);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw createError({ statusCode: 500, message: 'Failed to delete image' });
  }
});
