import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  nitro: {
    preset: 'cloudflare_module',

    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
    },
  },

  modules: ['@nuxt/eslint', '@nuxt/icon', '@nuxt/fonts', '@nuxt/image', 'nitro-cloudflare-dev'],

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
    '/manage/**': {
      ssr: true,
    },
  },
});
