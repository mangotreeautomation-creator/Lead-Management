import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { authService } from './auth.service';
import { requireAuth } from '../../middleware/auth.middleware';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function authRoutes(app: FastifyInstance) {
  /**
   * POST /api/v1/auth/login
   */
  app.post('/api/v1/auth/login', async (request: FastifyRequest, reply: FastifyReply) => {
    const parseResult = loginSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: 'Invalid email or password format',
        details: parseResult.error.format(),
      });
    }

    const { email, password } = parseResult.data;
    const ipAddress = request.ip;
    const userAgent = request.headers['user-agent'];

    const { user, token, expiresAt } = await authService.login(email, password, ipAddress, userAgent);

    // Set secure HTTP-only cookie
    reply.setCookie('leadpulse_session', token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
    });

    return reply.status(200).send({
      success: true,
      user,
      token, // Also return in JSON for authorization header fallback
      expiresAt: expiresAt.toISOString(),
    });
  });

  /**
   * POST /api/v1/auth/logout
   */
  app.post('/api/v1/auth/logout', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    let token = request.cookies?.leadpulse_session;
    if (!token && request.headers.authorization) {
      const parts = request.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
        token = parts[1];
      }
    }

    if (token) {
      await authService.logout(token);
    }

    reply.clearCookie('leadpulse_session', { path: '/' });

    return reply.status(200).send({
      success: true,
      message: 'Logged out successfully',
    });
  });

  /**
   * GET /api/v1/auth/me
   */
  app.get('/api/v1/auth/me', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.status(200).send({
      success: true,
      user: request.user,
    });
  });
}
