import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { validateRuntimeConfig } from '~/utils/validate-config';
import type { ValidatedEnvConfig } from '~/utils/validate-config';

/**
 * Service for managing S3 operations
 */
export class S3Service {
  private s3Client: S3Client;
  private validatedConfig: ValidatedEnvConfig;

  constructor() {
    const runtimeConfig = useRuntimeConfig();
    this.validatedConfig = validateRuntimeConfig(runtimeConfig);
    this.s3Client = this.createS3Client();
  }

  /**
   * Creates an S3 client with the proper configuration
   */
  private createS3Client(): S3Client {
    return new S3Client({
      region: 'auto',
      endpoint: `https://${this.validatedConfig.r2AccountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.validatedConfig.awsAccessKeyId,
        secretAccessKey: this.validatedConfig.awsSecretAccessKey,
      },
    });
  }

  /**
   * Uploads a file to S3/R2 storage
   * @param fileBuffer The file content as a Buffer
   * @param filename The name of the file
   * @param mimeType The MIME type of the file
   * @returns The image ID (filename)
   */
  async uploadFile(fileBuffer: Buffer, filename: string, mimeType: string): Promise<string> {
    try {
      const key = `uploads/${Date.now()}-${filename}`;

      const command = new PutObjectCommand({
        Bucket: this.validatedConfig.awsS3BucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: mimeType,
      });

      await this.s3Client.send(command);

      const imageId = key.split('/').pop() || '';
      return imageId;
    } catch (error) {
      console.error('S3 upload error:', error);
      throw error;
    }
  }
}
