import type { H3Event } from 'h3';
import { sendError, createError, readMultipartFormData } from 'h3';

import type {
  ServerFile,
  FileValidationResult,
  SingleFileUploadResponse,
  ExifData,
} from '~/types/image-upload';
import {
  FileValidationResultSchema,
  SingleFileUploadResponseSchema,
  FileValidationConfig,
  ExifDataSchema,
} from '~/types/image-upload';
import { verifyCloudflareAccessToken } from '~~/server/utils/auth';
import { DbService } from '~~/server/services/dbService';
import { S3Service } from '~~/server/services/s3Service';
import { ImageProcessingService } from '~~/shared/imageProcessingService';
import { extractExif } from '~~/shared/services/exif';

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
  await verifyCloudflareAccessToken(event);

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
          statusMessage: 'No data was uploaded.',
        }),
      );
    }

    // Find the image file
    const imageFile = formData.find((file) => file.name === 'image');
    if (!imageFile) {
      return sendError(
        event,
        createError({
          statusCode: 400,
          statusMessage: 'No image file found in upload.',
        }),
      );
    }

    // Parse EXIF data if provided
    let exifData: ExifData = {};
    const exifDataField = formData.find((field) => field.name === 'exifData');
    if (exifDataField && exifDataField.data) {
      try {
        const exifDataString = exifDataField.data.toString('utf-8');
        const parsedExifData = JSON.parse(exifDataString);
        exifData = ExifDataSchema.parse(parsedExifData);
      } catch (error) {
        console.warn('Failed to parse EXIF data from request:', error);
        return sendError(
          event,
          createError({
            statusCode: 500,
            statusMessage: 'Failed to parse EXIF data from request',
          }),
        );
      }
    }

    const photoService = new DbService(event);
    const s3Service = new S3Service(event);
    const imageProcessingService = new ImageProcessingService();

    try {
      const parsedFile = {
        name: imageFile.name,
        filename: imageFile.filename,
        type: imageFile.type,
        data: imageFile.data,
      };

      const result = validateFile(parsedFile as ServerFile);

      if (result.success) {
        const resizedImageBuffer = await imageProcessingService.resizeImage(imageFile.data);

        const runtimeConfig = useRuntimeConfig();

        // Extract EXIF data on backend if not provided from frontend
        const parseExifInFrontend = runtimeConfig.public.parseExifInFrontend;

        if (!parseExifInFrontend && Object.keys(exifData).length === 0) {
          try {
            exifData = await extractExif(imageFile.data);
          } catch (error) {
            console.error('Failed to extract EXIF data on backend:', error);
            return sendError(
              event,
              createError({
                statusCode: 400,
                statusMessage: 'Failed to extract EXIF data from image.',
              }),
            );
          }
        }

        const fileId = await s3Service.uploadFile(
          resizedImageBuffer,
          imageFile.filename || '',
          imageFile.type || '',
        );
        result.url = fileId;

        try {
          await photoService.savePhoto({
            id: fileId,
            filename: fileId,
            originalFilename: imageFile.filename || 'unknown',
            mimeType: imageFile.type || 'application/octet-stream',
            size: resizedImageBuffer.length,
            ...exifData,
          });
        } catch (dbError) {
          console.error('Failed to save photo to database:', dbError);
          // TODO: Optionally delete the uploaded file from S3 here
          throw new Error('Failed to save photo to database');
        }
      }

      const validatedResult = FileValidationResultSchema.parse(result);

      const response: SingleFileUploadResponse = {
        success: validatedResult.success,
        file: validatedResult,
        message: validatedResult.success ? 'Image uploaded successfully.' : 'Image upload failed.',
      };

      return SingleFileUploadResponseSchema.parse(response);
    } catch (error) {
      console.error('Error processing upload:', error);

      const errorResult: FileValidationResult = {
        success: false,
        filename: imageFile.filename,
        error: 'Failed to upload',
      };

      const response: SingleFileUploadResponse = {
        success: false,
        file: errorResult,
        message: 'Failed to process image upload.',
      };

      return SingleFileUploadResponseSchema.parse(response);
    }
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
