import { useCookies } from '@vueuse/integrations/useCookies';

export function usePermissions() {
  const cookies = useCookies(['CF_Authorization']);

  const isAuthenticated = computed<boolean>(() => {
    if (import.meta.dev) {
      return true;
    }

    return cookies.get('CF_Authorization');
  });

  return {
    isAuthenticated,
  };
}
