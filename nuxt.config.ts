import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },

  modules: ['@nuxt/eslint', '@nuxt/icon', '@nuxt/fonts', '@nuxt/image'],

  typescript: {
    typeCheck: true,
  },

  css: ['~/assets/css/main.css', 'maplibre-gl/dist/maplibre-gl.css'],

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['maplibre-gl'],
    },
  },

  routeRules: {
    '/map': {
      ssr: false,
    },
  },

  runtimeConfig: {
    awsAccessKeyId: process.env.NUXT_AWS_ACCESS_KEY_ID,
    awsSecretAccessKey: process.env.NUXT_AWS_SECRET_ACCESS_KEY,
    awsS3BucketName: process.env.NUXT_AWS_S3_BUCKET_NAME,
    r2AccountId: process.env.NUXT_R2_ACCOUNT_ID,
  },
});
