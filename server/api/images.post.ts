import type { H3Event } from 'h3';
import { sendError, createError } from 'h3';
import type { ServerFile, FileValidationResult, UploadResponse } from '~/types/image-upload';
import {
  FileValidationResultSchema,
  UploadResponseSchema,
  FileValidationConfig,
} from '~/types/image-upload';
import { uploadToS3 } from '~/utils/s3-client';

function validateFile(file: ServerFile): FileValidationResult {
  if (!file.filename) {
    return { success: false, error: 'Missing filename' };
  }

  if (
    !file.type ||
    !FileValidationConfig.AllowedMimeTypes.includes(
      file.type as (typeof FileValidationConfig.AllowedMimeTypes)[number],
    )
  ) {
    return {
      success: false,
      filename: file.filename,
      error: `Invalid file type: ${file.type || 'unknown'}. Allowed: ${FileValidationConfig.AllowedMimeTypes.join(', ')}`,
    };
  }

  if (!file.data || file.data.length === 0) {
    return { success: false, filename: file.filename, error: 'Empty file' };
  }

  if (file.data.length > FileValidationConfig.MaxFileSize) {
    return {
      success: false,
      filename: file.filename,
      error: `File too large: ${(file.data.length / (1024 * 1024)).toFixed(2)}MB. Maximum: ${FileValidationConfig.MaxFileSize / (1024 * 1024)}MB`,
    };
  }

  return {
    success: true,
    filename: file.filename,
    size: file.data.length,
    type: file.type,
  };
}

export default defineEventHandler(async (event: H3Event) => {
  try {
    const contentType = event.node.req.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      return sendError(
        event,
        createError({
          statusCode: 400,
          statusMessage: 'Invalid content type. Expected multipart/form-data.',
        }),
      );
    }

    const formData = await readMultipartFormData(event);
    if (!formData || formData.length === 0) {
      return sendError(
        event,
        createError({
          statusCode: 400,
          statusMessage: 'No files were uploaded.',
        }),
      );
    }

    const uploadResults = await Promise.all(
      formData
        .filter((file) => file.name === 'image')
        .map(async (file) => {
          try {
            const parsedFile = {
              name: file.name,
              filename: file.filename,
              type: file.type,
              data: file.data,
            };

            const result = validateFile(parsedFile as ServerFile);

            if (result.success) {
              const url = await uploadToS3(file.data, file.filename || '', file.type || '');
              result.url = url;
            }

            return FileValidationResultSchema.parse(result);
          } catch {
            return {
              success: false,
              filename: file.filename,
              error: 'Failed to upload',
            } as FileValidationResult;
          }
        }),
    );

    if (uploadResults.length === 0) {
      return sendError(
        event,
        createError({
          statusCode: 400,
          statusMessage: 'No image files were found in the upload.',
        }),
      );
    }

    const response: UploadResponse = {
      success: true,
      files: uploadResults,
      message: 'Image upload processed successfully. Note: Files are not permanently stored yet.',
    };

    return UploadResponseSchema.parse(response);
  } catch (error) {
    console.error('Error processing image upload:', error);
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: 'Failed to process image upload.',
      }),
    );
  }
});
