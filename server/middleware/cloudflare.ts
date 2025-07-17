import type { H3Event } from 'h3';

/**
 * Middleware to set up Cloudflare bindings in the event context
 */
export default defineEventHandler((event: H3Event) => {
  event.context.cloudflare = event.context.cloudflare || {
    env: {
      DB: event.context.cloudflare?.env?.DB || null,
    },
  };
});
