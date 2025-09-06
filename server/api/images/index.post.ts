import type { H3Event } from 'h3';
import { readMultipartFormData } from 'h3';

import { UploadResponseSchema } from '~/types/image';

import { verifyCloudflareAccessToken } from '~~/server/utils/auth';
import { processImageUpload, extractUploadData } from '~~/server/utils/upload';
import {
  handleApiError,
  validateContentType,
  createErrorResponse,
} from '~~/server/utils/responses';
import logger from '~~/server/utils/logger';

export default defineEventHandler(async (event: H3Event) => {
  try {
    logger.info('Processing image upload request');
    await verifyCloudflareAccessToken(event);

    const runtimeConfig = useRuntimeConfig();
    const parseExifInFrontend = runtimeConfig.public.parseExifInFrontend;
    logger.info('Should have parsed EXIF in the frontend?', parseExifInFrontend);

    validateContentType(event, 'multipart/form-data');

    const formData = await readMultipartFormData(event);
    if (!formData || formData.length === 0) {
      logger.warn('Upload attempt with no form data');
      return createErrorResponse('No data was uploaded.', 400);
    }
    const { imageFile, exifData, lqipString, error } = extractUploadData(formData);
    if (error) {
      logger.warn('Upload data validation failed:', error);
      return createErrorResponse(error, 400);
    }

    if (!imageFile) {
      logger.warn('No valid image file found in upload');
      return createErrorResponse('No valid image file found.', 400);
    }

    if (parseExifInFrontend && !exifData) {
      logger.warn('EXIF data missing despite frontend parsing enabled');
      return createErrorResponse('EXIF data is required but missing.', 400);
    }

    if (!lqipString) {
      logger.warn('LQIP string missing from upload');
      return createErrorResponse('LQIP string is required but missing.', 400);
    }

    logger.info('Starting image processing', {
      filename: imageFile.filename,
      size: imageFile.data?.length,
    });

    const result = await processImageUpload(event, imageFile, exifData, lqipString, {
      parseExifInFrontend,
    });

    logger.success('Image upload processed successfully', { fileName: result?.file.filename });
    return UploadResponseSchema.parse(result);
  } catch (error) {
    return handleApiError(event, error, 'Failed to process image upload.');
  }
});
