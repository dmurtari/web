#!/usr/bin/env node
import { config } from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import { z } from 'zod';

// Load environment variables from .env files
config();

const __dirname = dirname(fileURLToPath(import.meta.url));

// Define schema for environment validation
const envSchema = z.object({
  NUXT_AWS_ACCESS_KEY_ID: z.string().min(1, 'AWS Access Key ID is required'),
  NUXT_AWS_SECRET_ACCESS_KEY: z.string().min(1, 'AWS Secret Access Key is required'),
  NUXT_AWS_S3_BUCKET_NAME: z.string().min(1, 'AWS S3 Bucket Name is required'),
  NUXT_R2_ACCOUNT_ID: z.string().min(1, 'R2 Account ID is required'),
  NUXT_D1_API_KEY: z.string().min(1, 'D1 API Key is required'),
});

try {
  // Read package.json to display the app name
  const packageJson = JSON.parse(readFileSync(resolve(__dirname, '..', 'package.json'), 'utf-8'));

  console.log(`\n🔍 Checking environment variables for ${packageJson.name}...\n`);

  // Validate the environment variables
  envSchema.parse(process.env);

  console.log('✅ All required environment variables are present!\n');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Environment validation failed:');

  if (error.errors) {
    error.errors.forEach((err) => {
      const varName = err.path.join('.');
      console.error(`  - ${varName}: ${err.message}`);
    });
  } else {
    console.error(error);
  }

  console.log('\n❗ Fix the above issues before continuing.\n');
  process.exit(1);
}
