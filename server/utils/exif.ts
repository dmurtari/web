import { z } from 'zod';
import type { ExifData } from '~/types/image';
import { ExifDataSchema } from '~/types/image';

import { extractExif } from '~~/shared/exif';

import logger from '~~/server/utils/logger';

export interface ExifProcessingResult {
  success: boolean;
  data: ExifData;
  error?: string;
}

/**
 * Processes EXIF data from image buffer
 */
export async function processExifData(imageBuffer: Buffer): Promise<ExifProcessingResult> {
  try {
    const extractedData = await extractExif(imageBuffer);
    return {
      success: true,
      data: extractedData,
    };
  } catch (error) {
    logger.error('EXIF processing error:', error);

    let errorMessage = 'Failed to process EXIF data';
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ');
      errorMessage = `EXIF validation errors: ${fieldErrors}`;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      success: false,
      data: {},
      error: errorMessage,
    };
  }
}

/**
 * Parses EXIF data from form data field
 */
export function parseExifFromFormData(
  exifDataField: { data?: Buffer; name?: string } | undefined,
): ExifData | null {
  if (!exifDataField || !exifDataField.data) {
    return null;
  }

  try {
    const exifDataString = exifDataField.data.toString('utf-8');
    const parsedExifData = JSON.parse(exifDataString);
    return ExifDataSchema.parse(parsedExifData);
  } catch (error) {
    logger.warn('Failed to parse EXIF data from form field:', error);
    return null;
  }
}
