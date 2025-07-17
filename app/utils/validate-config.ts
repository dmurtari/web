import { z } from 'zod';

const runtimeEnvSchema = z.object({
  awsAccessKeyId: z.string().min(1, 'AWS Access Key ID is required'),
  awsSecretAccessKey: z.string().min(1, 'AWS Secret Access Key is required'),
  awsS3BucketName: z.string().min(1, 'AWS S3 Bucket Name is required'),
  r2AccountId: z.string().min(1, 'R2 Account ID is required'),
});

export type ValidatedEnvConfig = z.infer<typeof runtimeEnvSchema>;

/**
 * Validates the runtime configuration and returns the validated values
 * @param config The Nuxt runtime config object
 * @returns Validated config values with proper types
 * @throws Error if validation fails
 */
export function validateRuntimeConfig(config: Record<string, unknown>): ValidatedEnvConfig {
  try {
    return runtimeEnvSchema.parse({
      awsAccessKeyId: config.awsAccessKeyId,
      awsSecretAccessKey: config.awsSecretAccessKey,
      awsS3BucketName: config.awsS3BucketName,
      r2AccountId: config.r2AccountId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .map((err) => `- ${err.path.join('.')}: ${err.message}`)
        .join('\n');

      throw new Error(`Missing or invalid environment variables:\n${missingVars}\n`);
    }
    throw new Error(`Environment validation failed: ${String(error)}`);
  }
}
