import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },

  modules: ['@nuxt/eslint', '@nuxt/icon', '@nuxt/fonts', '@nuxt/image'],

  typescript: {
    typeCheck: true,
  },

  future: {
    compatibilityVersion: 4,
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
});
