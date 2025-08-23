import type { H3Event } from 'h3';
import type { ServerFile, UploadResponse, ExifData } from '~/types/image';

import { resizeImage } from '~~/shared/image';
import { savePhoto } from '~~/server/utils/database';
import { uploadFile } from '~~/server/utils/storage';
import { validateFile } from '~~/server/utils/validation';
import { processExifData, parseExifFromFormData } from '~~/server/utils/exif';

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
  options: ProcessUploadOptions,
): Promise<UploadResponse> {
  try {
    // Validate the uploaded file
    const parsedFile: ServerFile = {
      name: imageFile.name,
      filename: imageFile.filename,
      type: imageFile.type,
      data: imageFile.data,
    };

    const validationResult = validateFile(parsedFile);
    if (!validationResult.success) {
      return {
        success: false,
        file: validationResult,
        message: 'Image upload failed.',
      };
    }

    // Resize the image
    const resizedImageBuffer = await resizeImage(imageFile.data);

    // Process EXIF data
    const exifResult = await processExifData(
      imageFile.data,
      frontendExifData,
      options.parseExifInFrontend,
    );

    if (!exifResult.success) {
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

    // Upload to storage
    const fileId = await uploadFile(
      event,
      resizedImageBuffer,
      imageFile.filename || '',
      imageFile.type || '',
    );

    // Save to database
    await savePhoto(event, {
      id: fileId,
      filename: fileId,
      originalFilename: imageFile.filename || 'unknown',
      mimeType: imageFile.type || 'application/octet-stream',
      size: resizedImageBuffer.length,
      ...exifResult.data,
    });

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
    console.error('Error processing image upload:', error);

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
  error?: string;
} {
  // Find the image file
  const imageFile = formData.find((file) => file.name === 'image');
  if (!imageFile) {
    return {
      exifData: {},
      error: 'No image file found in upload.',
    };
  }

  // Parse EXIF data if provided
  const exifDataField = formData.find((field) => field.name === 'exifData');
  const exifData = parseExifFromFormData(exifDataField);

  if (exifDataField && !exifData) {
    return {
      exifData: {},
      error: 'Invalid EXIF data format',
    };
  }

  return {
    imageFile: {
      name: imageFile.name,
      filename: imageFile.filename,
      type: imageFile.type,
      data: imageFile.data!,
    },
    exifData: exifData || {},
  };
}
