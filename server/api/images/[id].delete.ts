import type { H3Event } from 'h3';
import { PhotoService } from '~~/server/services/photoService';
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
    const photoService = new PhotoService(event);
    const key = `uploads/${id}`;

    await photoService.deletePhoto(id);
    await s3Service.deleteFile(key);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw createError({ statusCode: 500, message: 'Failed to delete image' });
  }
});
