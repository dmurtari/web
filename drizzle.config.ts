import type { Config } from 'drizzle-kit';

export default {
  schema: './server/database/schema/*',
  out: './server/database/migrations',
  driver: 'd1-http',
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
    token: process.env.CLOUDFLARE_D1_TOKEN!,
  },
  verbose: true,
  dialect: 'sqlite',
} satisfies Config;
