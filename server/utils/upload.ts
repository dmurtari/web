import type { H3Event } from 'h3';
import { type ServerFile, type UploadResponse, type ExifData, ExifDataSchema } from '~/types/image';

import { resizeImage } from '~~/shared/image';

import { savePhoto } from '~~/server/utils/database';
import { uploadFile } from '~~/server/utils/storage';
import { validateFile } from '~~/server/utils/validation';
import logger from '~~/server/utils/logger';

export interface UploadFileData {
  name?: string;
  filename?: string;
  type?: string;
  data: Buffer;
}

export interface ProcessUploadOptions {
  parseExifInFrontend: boolean;
}

/**
 * Processes a single image upload from start to finish
 */
export async function processImageUpload(
  event: H3Event,
  imageFile: UploadFileData,
  frontendExifData: ExifData,
  lqipString: string,
  options: ProcessUploadOptions,
): Promise<UploadResponse> {
  try {
    logger.debug('Starting image upload processing', {
      filename: imageFile.filename,
      type: imageFile.type,
      size: imageFile.data?.length,
    });
    const parsedFile: ServerFile = {
      name: imageFile.name,
      filename: imageFile.filename,
      type: imageFile.type,
      data: imageFile.data,
    };

    logger.debug('Validating uploaded file', { filename: imageFile.filename });
    const validationResult = validateFile(parsedFile);
    if (!validationResult.success) {
      logger.warn('File validation failed', {
        filename: imageFile.filename,
        error: validationResult.error,
      });
      return {
        success: false,
        file: validationResult,
        message: 'Image upload failed.',
      };
    }
    logger.debug('File validation successful', { filename: imageFile.filename });
    logger.debug('Resizing image', {
      filename: imageFile.filename,
      originalSize: imageFile.data?.length,
    });
    const resizedImageBuffer = await resizeImage(imageFile.data);
    logger.debug('Image resized successfully', {
      filename: imageFile.filename,
      newSize: resizedImageBuffer.length,
    });

    let exifResult: ExifProcessingResult = { success: false, data: {} };

    if (options.parseExifInFrontend) {
      const validatedData = ExifDataSchema.parse(frontendExifData);

      exifResult = {
        success: true,
        data: validatedData,
      };
    } else {
      logger.debug('Processing EXIF data', {
        filename: imageFile.filename,
      });
      const exifResult = await processExifData(imageFile.data);

      if (!exifResult.success) {
        logger.warn('EXIF processing failed', {
          filename: imageFile.filename,
          error: exifResult.error,
        });
        return {
          success: false,
          file: {
            success: false,
            filename: imageFile.filename,
            error: exifResult.error || 'Failed to process EXIF data',
          },
          message: 'Image upload failed.',
        };
      }
      logger.debug('EXIF processing successful', { filename: imageFile.filename });
    }

    logger.debug('Uploading file to storage', { filename: imageFile.filename });
    const fileId = await uploadFile(
      event,
      resizedImageBuffer,
      imageFile.filename || '',
      imageFile.type || '',
    );
    logger.info('File uploaded to storage successfully', {
      filename: imageFile.filename,
      fileId,
    });
    logger.debug('Saving photo metadata to database', { fileId });
    await savePhoto(event, {
      id: fileId,
      filename: fileId,
      originalFilename: imageFile.filename || 'unknown',
      mimeType: imageFile.type || 'application/octet-stream',
      size: resizedImageBuffer.length,
      lqip: lqipString,
      ...exifResult.data,
    });
    logger.info('Photo metadata saved to database', { fileId });

    return {
      success: true,
      file: {
        success: true,
        filename: validationResult.filename,
        size: validationResult.size,
        type: validationResult.type,
        url: fileId,
      },
      message: 'Image uploaded successfully.',
    };
  } catch (error) {
    logger.error('Error processing image upload:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to upload';

    return {
      success: false,
      file: {
        success: false,
        filename: imageFile.filename,
        error: errorMessage,
      },
      message: 'Failed to process image upload.',
    };
  }
}

/**
 * Extracts and validates form data for image upload
 */
export function extractUploadData(
  formData: Array<{ name?: string; filename?: string; type?: string; data?: Buffer }>,
): {
  imageFile?: UploadFileData;
  exifData: ExifData;
  lqipString: string;
  error?: string;
} {
  const imageFile = formData.find((file) => file.name === 'image');
  if (!imageFile) {
    return {
      exifData: {},
      lqipString: '',
      error: 'No image file found in upload.',
    };
  }

  const exifDataField = formData.find((field) => field.name === 'exifData');
  const exifData = parseExifFromFormData(exifDataField);

  if (exifDataField && !exifData) {
    return {
      exifData: {},
      lqipString: '',
      error: 'Invalid EXIF data format',
    };
  }

  const lqipField = formData.find((field) => field.name === 'lqip');
  const lqipString = lqipField?.data?.toString('utf-8');

  if (lqipField && !lqipString) {
    return {
      exifData: {},
      lqipString: '',
      error: 'Invalid LQIP data format',
    };
  }

  const uploadData = {
    imageFile: {
      name: imageFile.name,
      filename: imageFile.filename,
      type: imageFile.type,
      data: imageFile.data!,
    },
    exifData: exifData || {},
    lqipString: lqipString || '',
  };

  logger.debug('Extracted upload data', uploadData);

  return uploadData;
}
