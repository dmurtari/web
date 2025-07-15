import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export async function uploadToS3(
  fileBuffer: Buffer,
  filename: string,
  mimeType: string,
): Promise<string> {
  try {
    const runtimeConfig = useRuntimeConfig();

    if (
      !runtimeConfig.awsAccessKeyId ||
      !runtimeConfig.awsSecretAccessKey ||
      !runtimeConfig.awsRegion ||
      !runtimeConfig.awsS3BucketName
    ) {
      throw new Error('AWS credentials are not configured properly.');
    }

    const s3Client = new S3Client({
      region: runtimeConfig.awsRegion,
      credentials: {
        accessKeyId: runtimeConfig.awsAccessKeyId,
        secretAccessKey: runtimeConfig.awsSecretAccessKey,
      },
    });

    const key = `uploads/${Date.now()}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: runtimeConfig.awsS3BucketName || '',
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
    });

    await s3Client.send(command);

    return `https://${runtimeConfig.awsS3BucketName}.s3.${runtimeConfig.awsRegion || 'us-east-1'}.amazonaws.com/${key}`;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw error;
  }
}
