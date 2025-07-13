import type { UploadResponse } from '~/types/image-upload';
import { UploadFileSchema, UploadResponseSchema, FileValidationConfig } from '~/types/image-upload';
import { formatFileSize } from '~/utils/helpers';
import { z } from 'zod';

export function useImageUpload() {
  function validateFile(file: File): { isValid: boolean; error?: string } {
    try {
      UploadFileSchema.parse({
        name: file.name,
        size: file.size,
        type: file.type,
      });
      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((err) => err.message).join(', ');
        return { isValid: false, error: errorMessages };
      }
      return { isValid: false, error: 'Invalid file' };
    }
  }

  async function uploadFiles(files: File[]): Promise<UploadResponse> {
    if (!files.length) {
      throw new Error('No files to upload');
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('image', file);
    });

    const response = await fetch('/api/images', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    const data = await response.json();
    return UploadResponseSchema.parse(data);
  }

  function getFilePreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  function revokeFilePreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
  }

  function getHumanFileSize(bytes: number): string {
    return formatFileSize(bytes);
  }

  const allowedFileTypes = FileValidationConfig.AllowedMimeTypes.map(
    (type) => `.${type.split('/')[1]}`,
  ).join(', ');

  return {
    validateFile,
    uploadFiles,
    getFilePreviewUrl,
    revokeFilePreviewUrl,
    getHumanFileSize,
    allowedFileTypes,
    maxFileSize: FileValidationConfig.MaxFileSize,
    allowedMimeTypes: FileValidationConfig.AllowedMimeTypes,
  };
}
