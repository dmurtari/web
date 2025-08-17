import { z } from 'zod';

export const ImageMetaSchema = z.object({
  id: z.string(),
  filename: z.string(),
  originalFilename: z.string(),
  uploadedAt: z.number().default(() => Date.now()),
  mimeType: z.string(),
  size: z.number(),
  url: z.url().optional(),
  description: z.string().nullable().optional(),

  latitude: z.string().nullable().optional(),
  longitude: z.string().nullable().optional(),
  cameraMake: z.string().nullable().optional(),
  cameraModel: z.string().nullable().optional(),
  exposureTime: z.string().nullable().optional(),
  aperture: z.string().nullable().optional(),
  iso: z.string().nullable().optional(),
  focalLength: z.string().nullable().optional(),
  takenAt: z.number().nullable().optional(),
});

export type ImageMeta = z.infer<typeof ImageMetaSchema>;
