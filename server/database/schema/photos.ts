import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const photos = sqliteTable('photos', {
  id: text('id').primaryKey(),
  filename: text('filename').notNull(),
  originalFilename: text('original_filename').notNull(),
  uploadedAt: integer('uploaded_at').notNull().default(Date.now()),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  latitude: text('latitude'),
  longitude: text('longitude'),
  description: text('description'),
});
