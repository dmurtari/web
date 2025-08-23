import type { ServerFile } from '~/types/image';
import { FileValidationConfig } from '~/types/image';

import logger from '~~/server/utils/logger';

export interface FileValidationResult {
  success: boolean;
  filename?: string;
  size?: number;
  type?: string;
  error?: string;
}

export function validateFile(file: ServerFile): FileValidationResult {
  logger.debug('Starting file validation', {
    filename: file.filename,
    type: file.type,
    size: file.data?.length,
  });

  if (!file.filename) {
    logger.warn('File validation failed: missing filename');
    return { success: false, error: 'Missing filename' };
  }

  if (
    !file.type ||
    !FileValidationConfig.AllowedMimeTypes.includes(
      file.type as (typeof FileValidationConfig.AllowedMimeTypes)[number],
    )
  ) {
    logger.warn('File validation failed: invalid mime type', {
      filename: file.filename,
      providedType: file.type,
      allowedTypes: FileValidationConfig.AllowedMimeTypes,
    });
    return {
      success: false,
      filename: file.filename,
      error: `Invalid file type: ${file.type || 'unknown'}. Allowed: ${FileValidationConfig.AllowedMimeTypes.join(', ')}`,
    };
  }

  if (!file.data || file.data.length === 0) {
    logger.warn('File validation failed: empty file', { filename: file.filename });
    return { success: false, filename: file.filename, error: 'Empty file' };
  }

  if (file.data.length > FileValidationConfig.MaxFileSize) {
    logger.warn('File validation failed: file too large', {
      filename: file.filename,
      size: file.data.length,
      maxSize: FileValidationConfig.MaxFileSize,
      sizeMB: (file.data.length / (1024 * 1024)).toFixed(2),
    });
    return {
      success: false,
      filename: file.filename,
      error: `File too large: ${(file.data.length / (1024 * 1024)).toFixed(2)}MB. Maximum: ${FileValidationConfig.MaxFileSize / (1024 * 1024)}MB`,
    };
  }

  logger.debug('File validation successful', {
    filename: file.filename,
    type: file.type,
    size: file.data.length,
  });

  return {
    success: true,
    filename: file.filename,
    size: file.data.length,
    type: file.type,
  };
}
