import { z } from 'zod';

// Configuration
export const FileValidationConfig = {
  MaxFileSize: 10 * 1024 * 1024, // 10MB
  AllowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
};

// Helper function to create optional nullable fields that transform null to undefined
const optionalNullableString = () =>
  z
    .string()
    .nullable()
    .transform((val) => val ?? undefined)
    .optional();

const optionalNullableNumber = () =>
  z
    .number()
    .nullable()
    .transform((val) => val ?? undefined)
    .optional();

// Helper for fields that can come as either string or number (like ISO)
const optionalNullableStringOrNumber = () =>
  z
    .union([z.string(), z.number()])
    .nullable()
    .transform((val) => (val != null ? String(val) : undefined))
    .optional();

// Core EXIF data schema - single source of truth
// Transform null to undefined for cleaner TypeScript types
export const ExifDataSchema = z.object({
  cameraMake: optionalNullableString(),
  cameraModel: optionalNullableString(),
  exposureTime: optionalNullableString(),
  aperture: optionalNullableString(),
  iso: optionalNullableStringOrNumber(),
  focalLength: optionalNullableString(),
  takenAt: optionalNullableNumber(),
  latitude: optionalNullableString(),
  longitude: optionalNullableString(),
});

// File validation schemas
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
    ? z.any()
    : z.instanceof(typeof Buffer !== 'undefined' ? Buffer : Object),
});

// Image metadata schema - includes all image information
export const ImageMetaSchema = z
  .object({
    id: z.string(),
    filename: z.string(),
    originalFilename: z.string(),
    uploadedAt: z.number().default(() => Date.now()),
    mimeType: z.string(),
    size: z.number(),
    lqip: optionalNullableString(),
    url: z.string().optional(),
    description: optionalNullableString(),
  })
  .merge(ExifDataSchema);

// Upload response schemas
export const FileValidationResultSchema = z.object({
  success: z.boolean(),
  filename: z.string().optional(),
  size: z.number().optional(),
  type: z.string().optional(),
  url: z.string().optional(),
  error: z.string().optional(),
});

export const UploadResponseSchema = z.object({
  success: z.boolean(),
  file: FileValidationResultSchema,
  message: z.string(),
});

// Type exports
export type ExifData = z.infer<typeof ExifDataSchema>;
export type UploadFile = z.infer<typeof UploadFileSchema>;
export type ServerFile = z.infer<typeof ServerFileSchema>;
export type ImageMeta = z.infer<typeof ImageMetaSchema>;
export type FileValidationResult = z.infer<typeof FileValidationResultSchema>;
export type UploadResponse = z.infer<typeof UploadResponseSchema>;

// Upload status interface
export interface FileUploadStatus {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  result?: UploadResponse;
  error?: string;
}
