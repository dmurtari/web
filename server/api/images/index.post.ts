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

export default defineEventHandler(async (event: H3Event) => {
  try {
    await verifyCloudflareAccessToken(event);

    validateContentType(event, 'multipart/form-data');

    const formData = await readMultipartFormData(event);
    if (!formData || formData.length === 0) {
      return createErrorResponse('No data was uploaded.', 400);
    }

    // Extract and validate upload data
    const { imageFile, exifData, error } = extractUploadData(formData);
    if (error) {
      return createErrorResponse(error, 400);
    }

    if (!imageFile) {
      return createErrorResponse('No valid image file found.', 400);
    }

    // Get runtime configuration
    const runtimeConfig = useRuntimeConfig();
    const parseExifInFrontend = runtimeConfig.public.parseExifInFrontend === 'true';

    // Process the upload
    const result = await processImageUpload(event, imageFile, exifData, {
      parseExifInFrontend,
    });

    return UploadResponseSchema.parse(result);
  } catch (error) {
    return handleApiError(event, error, 'Failed to process image upload.');
  }
});
