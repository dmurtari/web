import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const photos = sqliteTable('photos', {
  id: text('id').primaryKey(),
  filename: text('filename').notNull(),
  originalFilename: text('original_filename').notNull(),
  uploadedAt: integer('uploaded_at').notNull().default(Date.now()),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  lqip: text('lqip'),
  description: text('description'),
  latitude: text('latitude'),
  longitude: text('longitude'),
  cameraMake: text('camera_make'),
  cameraModel: text('camera_model'),
  exposureTime: text('exposure_time'),
  aperture: text('aperture'),
  iso: text('iso'),
  focalLength: text('focal_length'),
  takenAt: integer('taken_at'),
});
