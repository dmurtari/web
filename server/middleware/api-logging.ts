import logger from '~~/server/utils/logger';

export default defineEventHandler(async (event) => {
  if (!event.node.req.url?.startsWith('/api/')) {
    return;
  }

  const startTime = Date.now();
  const method = event.method;
  const url = getRequestURL(event);
  const userAgent = getHeader(event, 'user-agent');
  const ip = getRequestIP(event);

  logger.info('API Request received', {
    method,
    path: url.pathname,
    query: url.search,
    ip,
    userAgent,
  });

  event.context.onAfterResponse = () => {
    const duration = Date.now() - startTime;
    const statusCode = event.node.res.statusCode;

    logger.info('API Request completed', {
      method,
      path: url.pathname,
      statusCode,
      duration: `${duration}ms`,
      ip,
    });
  };

  event.context.onError = (error: unknown) => {
    const duration = Date.now() - startTime;

    logger.error('API Request failed with uncaught error', {
      method,
      path: url.pathname,
      duration: `${duration}ms`,
      ip,
      error: error instanceof Error ? error.message : String(error),
    });
  };
});
