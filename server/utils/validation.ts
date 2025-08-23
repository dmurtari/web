import type { ServerFile } from '~/types/image';
import { FileValidationConfig } from '~/types/image';

export interface FileValidationResult {
  success: boolean;
  filename?: string;
  size?: number;
  type?: string;
  error?: string;
}

export function validateFile(file: ServerFile): FileValidationResult {
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
