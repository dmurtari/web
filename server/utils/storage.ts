import type { H3Event } from 'h3';

import logger from '~~/server/utils/logger';

export function getBucket(event: H3Event): R2Bucket {
  return event.context.cloudflare.env.BUCKET as R2Bucket;
}

export function createStorageKey(filename: string): string {
  return `uploads/${Date.now()}-${filename}`;
}

export function createImageStorageKey(imageId: string): string {
  return `uploads/${imageId}`;
}

export async function uploadFile(
  event: H3Event,
  fileBuffer: Buffer,
  filename: string,
  mimeType: string,
): Promise<string> {
  try {
    const bucket = getBucket(event);
    const key = createStorageKey(filename);
    const uint8Array = new Uint8Array(fileBuffer);

    await bucket.put(key, uint8Array, {
      httpMetadata: {
        contentType: mimeType,
      },
    });

    const imageId = key.split('/').pop() || '';
    return imageId;
  } catch (error) {
    logger.error('Storage upload error:', error);
    throw error;
  }
}

export async function getFile(event: H3Event, key: string) {
  try {
    const bucket = getBucket(event);
    const object = await bucket.get(key);
    if (!object) {
      throw new Error('Object not found');
    }

    const arrayBuffer = await object.arrayBuffer();

    return new Response(arrayBuffer, {
      headers: {
        'Content-Type': object.httpMetadata?.contentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000', // Cache for a year
        'Content-Length': object.size.toString(),
      },
    });
  } catch (error) {
    logger.error('Storage retrieval error:', error);
    throw error;
  }
}

export async function deleteFile(event: H3Event, key: string): Promise<void> {
  try {
    logger.debug('Deleting file from R2 storage', { key });

    const bucket = getBucket(event);
    await bucket.delete(key);

    logger.info('File deleted from R2 storage successfully', { key });
  } catch (error) {
    logger.error('Storage delete error:', error);
    throw error;
  }
}
