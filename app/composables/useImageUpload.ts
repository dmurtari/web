import type { SingleFileUploadResponse, ExifData } from '~/types/image-upload';
import {
  UploadFileSchema,
  SingleFileUploadResponseSchema,
  FileValidationConfig,
} from '~/types/image-upload';
import { formatFileSize } from '~/utils/helpers';
import { extractExif, ExifExtractionError } from '~~/shared/services/exif';
import { z } from 'zod';

export interface FileUploadStatus {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress?: number;
  result?: SingleFileUploadResponse;
  error?: string;
}

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
    try {
      const arrayBuffer = await file.arrayBuffer();
      return await extractExif(arrayBuffer);
    } catch (error) {
      if (error instanceof ExifExtractionError) {
        throw error;
      }
      throw new ExifExtractionError('Failed to extract EXIF data from file', error);
    }
  }

  async function uploadSingleFile(
    file: File,
    exifData?: ExifData,
  ): Promise<SingleFileUploadResponse> {
    console.log('Uploading file:', file.name, exifData);
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
    return SingleFileUploadResponseSchema.parse(data);
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

    // Initialize upload statuses
    const uploadStatuses: FileUploadStatus[] = files.map((file) => ({
      file,
      status: 'pending' as const,
    }));

    // Notify initial status
    onProgress?.(uploadStatuses);

    // Process files in parallel
    const uploadPromises = files.map(async (file, index): Promise<FileUploadStatus> => {
      const currentStatus = uploadStatuses[index];
      if (!currentStatus) {
        // This shouldn't happen, but handle it gracefully
        return {
          file,
          status: 'error',
          error: 'Internal error: missing upload status',
        };
      }

      try {
        // Update status to uploading
        currentStatus.status = 'uploading';
        onProgress?.(uploadStatuses);

        let exifData: ExifData | undefined;

        // Extract EXIF data in frontend if required
        if (parseExifInFrontend) {
          try {
            exifData = await extractExifFromFile(file);
          } catch (error) {
            // EXIF extraction failure should fail the upload
            currentStatus.status = 'error';
            currentStatus.error =
              error instanceof ExifExtractionError ? error.message : 'Failed to extract EXIF data';
            onProgress?.(uploadStatuses);
            return currentStatus;
          }
        }

        // Upload the file
        const result = await uploadSingleFile(file, exifData);

        currentStatus.status = result.success ? 'success' : 'error';
        currentStatus.result = result;
        if (!result.success) {
          currentStatus.error = result.file.success === false ? result.file.error : 'Upload failed';
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
    extractExifFromFile,
    uploadSingleFile,
    uploadFiles,
    getFilePreviewUrl,
    revokeFilePreviewUrl,
    getHumanFileSize,
    allowedFileTypes,
    maxFileSize: FileValidationConfig.MaxFileSize,
    allowedMimeTypes: FileValidationConfig.AllowedMimeTypes,
  };
}
