import type { H3Event } from 'h3';

/**
 * Service for managing S3 operations
 */
export class S3Service {
  private r2Bucket: R2Bucket;

  constructor(event: H3Event) {
    this.r2Bucket = event.context.cloudflare.env.BUCKET as R2Bucket;
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

  async getFile(key: string) {
    try {
      const object = await this.r2Bucket.get(key);
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
      console.error('S3 retrieval error:', error);
      throw error;
    }
  }

  async deleteFile(key: string) {
    try {
      await this.r2Bucket.delete(key);
    } catch (error) {
      console.error('S3 delete error:', error);
      throw error;
    }
  }
}
