import type { H3Event } from 'h3';

/**
 * Service for managing S3 operations
 */
export class S3Service {
  private r2Bucket: R2Bucket;

  constructor(event: H3Event) {
    this.r2Bucket = event.context.cloudflare.env.BUCKET;
  }

  async uploadFile(fileBuffer: Buffer, filename: string, mimeType: string): Promise<string> {
    try {
      const key = `uploads/${Date.now()}-${filename}`;
      const uint8Array = new Uint8Array(fileBuffer);

      await this.r2Bucket.put(key, uint8Array, {
        httpMetadata: {
          contentType: mimeType,
        },
      });

      const imageId = key.split('/').pop() || '';
      return imageId;
    } catch (error) {
      console.error('S3 upload error:', error);
      throw error;
    }
  }
}
