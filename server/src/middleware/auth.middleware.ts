import { FastifyRequest, FastifyReply } from 'fastify';
import { authService, AuthenticatedUser } from '../modules/auth/auth.service';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

// Extend FastifyRequest interface to include user property
declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthenticatedUser;
    rawBody?: string;
  }
}

/**
 * Fastify hook/middleware to require valid session authentication
 */
export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  // Extract token from Cookie or Bearer Authorization header
  let token = request.cookies?.leadpulse_session;

  if (!token && request.headers.authorization) {
    const parts = request.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
      token = parts[1];
    }
  }

  if (!token) {
    throw new UnauthorizedError('Authentication required. Please sign in.', 'MISSING_SESSION');
  }

  try {
    const user = await authService.validateSession(token);
    request.user = user;
  } catch (err) {
    throw new UnauthorizedError('Session expired or invalid. Please sign in again.', 'INVALID_SESSION');
  }
}

/**
 * Fastify preHandler to require a specific permission code
 */
export function requirePermission(permissionCode: string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      throw new UnauthorizedError('Authentication required', 'NOT_AUTHENTICATED');
    }

    const { roles, permissions } = request.user;

    // Super Admin has universal access
    if (roles.includes('SUPER_ADMIN') || permissions.includes('*')) {
      return;
    }

    if (!permissions.includes(permissionCode)) {
      throw new ForbiddenError(
        `You do not have the required permission (${permissionCode}) to perform this action.`,
        'INSUFFICIENT_PERMISSIONS'
      );
    }
  };
}
