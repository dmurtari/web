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

export const UploadResponseSchema = z.object({
  success: z.boolean(),
  files: z.array(FileValidationResultSchema),
  message: z.string(),
});

export type UploadFile = z.infer<typeof UploadFileSchema>;
export type ServerFile = z.infer<typeof ServerFileSchema>;
export type FileValidationError = z.infer<typeof FileValidationErrorSchema>;
export type FileValidationSuccess = z.infer<typeof FileValidationSuccessSchema>;
export type FileValidationResult = z.infer<typeof FileValidationResultSchema>;
export type UploadResponse = z.infer<typeof UploadResponseSchema>;
