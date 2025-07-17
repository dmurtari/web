import { validateRuntimeConfig } from '~/utils/validate-config';

export default defineNuxtPlugin({
  name: 'env-validator',
  enforce: 'pre',
  setup() {
    const config = useRuntimeConfig();

    try {
      validateRuntimeConfig(config);
      console.info('Environment variables validated successfully');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(errorMessage);
      throw error;
    }
  },
});
