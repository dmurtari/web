import { z } from 'zod';

export const FileValidationConfig = {
  MaxFileSize: 10 * 1024 * 1024, // 10MB
  AllowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
};

export const UploadFileSchema = z.object({
  name: z.string(),
  size: z
    .number()
    .max(
      FileValidationConfig.MaxFileSize,
      `File too large. Maximum size is ${FileValidationConfig.MaxFileSize / (1024 * 1024)}MB`,
    ),
  type: z.enum(FileValidationConfig.AllowedMimeTypes, {
    message: `Invalid file type. Allowed: ${FileValidationConfig.AllowedMimeTypes.join(', ')}`,
  }),
});

export const ServerFileSchema = z.object({
  name: z.string().optional(),
  filename: z.string().optional(),
  type: z.string().optional(),
  data: import.meta.browser
    ? z.any() // In browser context, accept any
    : z.instanceof(typeof Buffer !== 'undefined' ? Buffer : Object), // In Node context, use Buffer
});

// EXIF data schema
export const ExifDataSchema = z.object({
  cameraMake: z.string().optional(),
  cameraModel: z.string().optional(),
  exposureTime: z.string().optional(),
  aperture: z.string().optional(),
  iso: z
    .union([z.string(), z.number()])
    .transform((val) => String(val))
    .optional(),
  focalLength: z.string().optional(),
  takenAt: z
    .union([z.number(), z.null()])
    .transform((val) => (val === null ? undefined : val))
    .optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
});

// Single file upload request schema
export const SingleFileUploadRequestSchema = z.object({
  image: ServerFileSchema,
  exifData: ExifDataSchema.optional(),
});

export const FileValidationErrorSchema = z.object({
  success: z.literal(false),
  filename: z.string().optional(),
  error: z.string(),
});

export const FileValidationSuccessSchema = z.object({
  success: z.literal(true),
  filename: z.string(),
  size: z.number(),
  type: z.string(),
  url: z.string().optional(),
});

export const FileValidationResultSchema = z.discriminatedUnion('success', [
  FileValidationErrorSchema,
  FileValidationSuccessSchema,
]);

// Updated response schema for single file upload
export const SingleFileUploadResponseSchema = z.object({
  success: z.boolean(),
  file: FileValidationResultSchema,
  message: z.string(),
});

// Keep the old batch response schema for compatibility during transition
export const UploadResponseSchema = z.object({
  success: z.boolean(),
  files: z.array(FileValidationResultSchema),
  message: z.string(),
});

export type UploadFile = z.infer<typeof UploadFileSchema>;
export type ServerFile = z.infer<typeof ServerFileSchema>;
export type ExifData = z.infer<typeof ExifDataSchema>;
export type SingleFileUploadRequest = z.infer<typeof SingleFileUploadRequestSchema>;
export type FileValidationError = z.infer<typeof FileValidationErrorSchema>;
export type FileValidationSuccess = z.infer<typeof FileValidationSuccessSchema>;
export type FileValidationResult = z.infer<typeof FileValidationResultSchema>;
export type SingleFileUploadResponse = z.infer<typeof SingleFileUploadResponseSchema>;
export type UploadResponse = z.infer<typeof UploadResponseSchema>;
