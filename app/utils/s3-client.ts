import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export function createS3Client() {
  const runtimeConfig = useRuntimeConfig();

  if (
    !runtimeConfig.awsAccessKeyId ||
    !runtimeConfig.awsSecretAccessKey ||
    !runtimeConfig.r2AccountId
  ) {
    throw new Error('AWS credentials are not configured properly.');
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${runtimeConfig.r2AccountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: runtimeConfig.awsAccessKeyId,
      secretAccessKey: runtimeConfig.awsSecretAccessKey,
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
    const s3Client = createS3Client();

    const key = `uploads/${Date.now()}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: runtimeConfig.awsS3BucketName || '',
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
