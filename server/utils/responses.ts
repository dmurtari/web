import type { H3Event } from 'h3';
import { createError, sendError } from 'h3';

import logger from '~~/server/utils/logger';

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data?: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  statusCode?: number;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Creates a standardized success response
 */
export function createSuccessResponse<T>(data?: T, message?: string): ApiSuccessResponse<T> {
  return {
    success: true,
    ...(data !== undefined && { data }),
    ...(message && { message }),
  };
}

/**
 * Creates a standardized error response
 */
export function createErrorResponse(error: string, statusCode?: number): ApiErrorResponse {
  return {
    success: false,
    error,
    ...(statusCode && { statusCode }),
  };
}

/**
 * Handles API errors consistently across endpoints
 */
export function handleApiError(
  event: H3Event,
  error: unknown,
  defaultMessage: string = 'Internal server error',
  defaultStatusCode: number = 500,
) {
  logger.error('API Error:', error);

  const errorMessage = error instanceof Error ? error.message : defaultMessage;

  return sendError(
    event,
    createError({
      statusCode: defaultStatusCode,
      statusMessage: errorMessage,
    }),
  );
}

/**
 * Validates required route parameters
 */
export function validateRouteParam(
  event: H3Event,
  paramName: string,
  errorMessage?: string,
): string {
  const param = getRouterParam(event, paramName);

  if (!param) {
    throw createError({
      statusCode: 400,
      statusMessage: errorMessage || `Missing required parameter: ${paramName}`,
    });
  }

  return param;
}

/**
 * Validates request content type
 */
export function validateContentType(
  event: H3Event,
  expectedType: string,
  errorMessage?: string,
): void {
  const contentType = event.node.req.headers['content-type'] || '';

  if (!contentType.includes(expectedType)) {
    throw createError({
      statusCode: 400,
      statusMessage: errorMessage || `Invalid content type. Expected ${expectedType}.`,
    });
  }
}
