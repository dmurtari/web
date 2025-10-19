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

  image: {
    cloudflare: {
      baseURL: 'https://images.kazusan.me',
      modifiers: {
        format: 'webp',
        quality: 80,
      },
    },
    domains: ['images.kazusan.me', 'localhost'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
  },

  typescript: {
    typeCheck: true,
  },

  css: ['~/assets/css/main.css', 'maplibre-gl/dist/maplibre-gl.css'],

  icon: {
    mode: 'css',
    cssLayer: 'base',
  },

  vite: {
    plugins: [
      tailwindcss(),
      {
        /**
         * Ignore sourcemap warnings from Tailwind, until resolved:
         * https://github.com/tailwindlabs/tailwindcss/discussions/16119
         */
        apply: 'build',
        name: 'vite-plugin-ignore-sourcemap-warnings',
        configResolved(config) {
          const originalOnWarn = config.build.rollupOptions.onwarn;
          config.build.rollupOptions.onwarn = (warning, warn) => {
            if (
              warning.code === 'SOURCEMAP_BROKEN' &&
              warning.plugin === '@tailwindcss/vite:generate:build'
            ) {
              return;
            }

            if (originalOnWarn) {
              originalOnWarn(warning, warn);
            } else {
              warn(warning);
            }
          };
        },
      },
    ],
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

  runtimeConfig: {
    cloudflarePolicyAud: '',
    cloudflareTeamUrl: '',
    public: {
      parseExifInFrontend: true,
    },
  },
});
