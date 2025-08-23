import * as jose from 'jose';
import type { H3Event } from 'h3';

import logger from '~~/server/utils/logger';

/**
 * https://developers.cloudflare.com/cloudflare-one/identity/authorization-cookie/validating-json/#javascript-example
 */
export async function verifyCloudflareAccessToken(event: H3Event) {
  if (import.meta.dev) {
    logger.debug('Skipping auth verification in development mode');
    return;
  }

  logger.debug('Verifying Cloudflare Access token');

  const config = useRuntimeConfig();

  const AUD = config.cloudflarePolicyAud;
  const TEAM_DOMAIN = config.cloudflareTeamUrl;

  if (!AUD || !TEAM_DOMAIN) {
    logger.error('Missing Cloudflare configuration', {
      hasAud: !!AUD,
      hasTeamDomain: !!TEAM_DOMAIN,
    });
    throw createError({
      statusCode: 403,
    });
  }

  const CERTS_URL = `${TEAM_DOMAIN}/cdn-cgi/access/certs`;
  const JWKS = jose.createRemoteJWKSet(new URL(CERTS_URL));

  const token = getCookie(event, 'CF_Authorization');

  if (!token) {
    logger.warn('No CF_Authorization cookie found');
    throw createError({
      statusCode: 403,
    });
  }

  try {
    const result = await jose.jwtVerify(token, JWKS, {
      issuer: TEAM_DOMAIN,
      audience: AUD,
    });

    logger.info('Authentication successful', {
      userId: result.payload.sub,
      email: result.payload.email,
    });
    return result.payload;
  } catch (error) {
    logger.warn('Token verification failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw createError({
      statusCode: 401,
    });
  }
}
