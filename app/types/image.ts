import { z } from 'zod';

export const ImageMetaSchema = z.object({
  id: z.string(),
  filename: z.string(),
  originalFilename: z.string(),
  uploadedAt: z.number().default(() => Date.now()),
  mimeType: z.string(),
  size: z.number(),
  url: z.url().optional(),
  latitude: z.string().nullable().optional(),
  longitude: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

export type ImageMeta = z.infer<typeof ImageMetaSchema>;
