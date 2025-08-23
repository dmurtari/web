import { z } from 'zod';

import type { UploadResponse, ExifData, FileUploadStatus } from '~/types/image';
import { UploadFileSchema, UploadResponseSchema, FileValidationConfig } from '~/types/image';

import { extractExif, ExifExtractionError } from '~~/shared/exif';

import { formatFileSize } from '~/utils/helpers';

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
        const errorMessages = error.issues.map((err) => err.message).join(', ');
        return { isValid: false, error: errorMessages };
      }
      return { isValid: false, error: 'Invalid file' };
    }
  }

  async function extractExifFromFile(file: File): Promise<ExifData> {
    const arrayBuffer = await file.arrayBuffer();
    return await extractExif(arrayBuffer);
  }

  async function uploadSingleFile(file: File, exifData?: ExifData): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);

    if (exifData && Object.keys(exifData).length > 0) {
      formData.append('exifData', JSON.stringify(exifData));
    }

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

  async function uploadFiles(
    files: File[],
    onProgress?: (statuses: FileUploadStatus[]) => void,
  ): Promise<FileUploadStatus[]> {
    if (!files.length) {
      throw new Error('No files to upload');
    }

    const runtimeConfig = useRuntimeConfig();
    const parseExifInFrontend = runtimeConfig.public.parseExifInFrontend;

    const uploadStatuses: FileUploadStatus[] = files.map((file) => ({
      file,
      status: 'pending' as const,
    }));

    onProgress?.(uploadStatuses);

    const uploadPromises = files.map(async (file, index): Promise<FileUploadStatus> => {
      const currentStatus = uploadStatuses[index]!;

      try {
        currentStatus.status = 'uploading';
        onProgress?.(uploadStatuses);

        let exifData: ExifData | undefined;

        if (parseExifInFrontend) {
          try {
            exifData = await extractExifFromFile(file);
          } catch (error) {
            currentStatus.status = 'error';
            currentStatus.error =
              error instanceof ExifExtractionError ? error.message : 'Failed to extract EXIF data';
            onProgress?.(uploadStatuses);
            return currentStatus;
          }
        }

        const result = await uploadSingleFile(file, exifData);

        currentStatus.status = result.success ? 'success' : 'error';
        currentStatus.result = result;
        if (!result.success) {
          currentStatus.error = result.file.error || 'Upload failed';
        }

        onProgress?.(uploadStatuses);
        return currentStatus;
      } catch (error) {
        currentStatus.status = 'error';
        currentStatus.error = error instanceof Error ? error.message : 'Upload failed';
        onProgress?.(uploadStatuses);
        return currentStatus;
      }
    });

    await Promise.all(uploadPromises);
    return uploadStatuses;
  }

  const allowedFileTypes = FileValidationConfig.AllowedMimeTypes.map(
    (type) => `.${type.split('/')[1]}`,
  ).join(', ');

  return {
    validateFile,
    extractExifFromFile,
    uploadSingleFile,
    uploadFiles,
    getFilePreviewUrl: (file: File) => URL.createObjectURL(file),
    revokeFilePreviewUrl: (url: string) => URL.revokeObjectURL(url),
    getHumanFileSize: (bytes: number) => formatFileSize(bytes),
    allowedFileTypes,
    maxFileSize: FileValidationConfig.MaxFileSize,
    allowedMimeTypes: FileValidationConfig.AllowedMimeTypes,
  };
}
