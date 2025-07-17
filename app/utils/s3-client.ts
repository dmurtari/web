import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { validateRuntimeConfig } from './validate-config';

export function createS3Client() {
  const runtimeConfig = useRuntimeConfig();
  const validatedConfig = validateRuntimeConfig(runtimeConfig);

  return new S3Client({
    region: 'auto',
    endpoint: `https://${validatedConfig.r2AccountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: validatedConfig.awsAccessKeyId,
      secretAccessKey: validatedConfig.awsSecretAccessKey,
    },
  });
}

export async function uploadToS3(
  fileBuffer: Buffer,
  filename: string,
  mimeType: string,
): Promise<string> {
  try {
    const runtimeConfig = useRuntimeConfig();
    const validatedConfig = validateRuntimeConfig(runtimeConfig);
    const s3Client = createS3Client();

    const key = `uploads/${Date.now()}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: validatedConfig.awsS3BucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
    });

    await s3Client.send(command);

    const imageId = key.split('/').pop() || '';
    return imageId;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw error;
  }
}
