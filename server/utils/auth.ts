import * as jose from 'jose';
import type { H3Event } from 'h3';
import { useRuntimeConfig, createError } from '#imports';

/**
 * Verifies a Cloudflare Access JWT token and returns the user payload
 * @param event
 * @throws
 * https://developers.cloudflare.com/cloudflare-one/identity/authorization-cookie/validating-json/#javascript-example
 */
export async function verifyCloudflareAccessToken(event: H3Event) {
  if (import.meta.dev) {
    return;
  }

  const config = useRuntimeConfig();

  const AUD = config.cloudflarePolicyAud;
  const TEAM_DOMAIN = config.cloudflareTeamUrl;

  if (!AUD || !TEAM_DOMAIN) {
    throw createError({
      statusCode: 403,
    });
  }

  const CERTS_URL = `${TEAM_DOMAIN}/cdn-cgi/access/certs`;
  const JWKS = jose.createRemoteJWKSet(new URL(CERTS_URL));

  const token = getCookie(event, 'CF_Authorization');

  if (!token) {
    throw createError({
      statusCode: 403,
    });
  }

  try {
    const result = await jose.jwtVerify(token, JWKS, {
      issuer: TEAM_DOMAIN,
      audience: AUD,
    });

    return result.payload;
  } catch {
    throw createError({
      statusCode: 401,
    });
  }
}
