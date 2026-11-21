import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import { env } from './config/env';
import { handleFastifyError } from './utils/errors';
import { checkDatabaseHealth } from './database/client';

// Route modules
import { authRoutes } from './modules/auth/auth.routes';
import { razorpayRoutes } from './modules/razorpay/razorpay.routes';
import { metaAdsRoutes } from './modules/meta-ads/meta-ads.routes';
import { whatsappAiRoutes } from './modules/whatsapp-ai/whatsapp-ai.routes';
import { leadsRoutes } from './modules/leads/leads.routes';
import { customersRoutes } from './modules/customers/customers.routes';
import { overviewRoutes } from './modules/overview/overview.routes';
import { integrationsRoutes } from './modules/integrations/integrations.routes';

export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      transport:
        env.NODE_ENV === 'development'
          ? {
              target: 'pino-pretty',
              options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
              },
            }
          : undefined,
    },
  });

  // 1. Content type parser for raw body preservation on webhook routes
  app.addContentTypeParser(
    ['application/json', 'text/plain'],
    { parseAs: 'buffer' },
    (req, body, done) => {
      try {
        const rawString = body.toString('utf-8');
        (req as any).rawBody = rawString;
        const parsed = JSON.parse(rawString);
        done(null, parsed);
      } catch (err: any) {
        // If parsing fails, preserve raw body string
        (req as any).rawBody = body.toString('utf-8');
        done(null, {});
      }
    }
  );

  // 2. Security Plugins
  app.register(helmet, {
    contentSecurityPolicy: false, // Managed by Next.js frontend
  });

  const origins = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());
  app.register(cors, {
    origin: (origin, cb) => {
      if (!origin || origins.includes(origin) || origin.includes('localhost')) {
        cb(null, true);
        return;
      }
      cb(new Error('CORS Not Allowed'), false);
    },
    credentials: true,
  });

  app.register(cookie, {
    secret: env.COOKIE_SECRET,
    parseOptions: {},
  });

  app.register(rateLimit, {
    max: 200,
    timeWindow: '1 minute',
  });

  // 3. RFC 7807 Centralized Error Handler
  app.setErrorHandler(handleFastifyError);

  // 4. System Health Endpoints
  const getHealthHandler = async () => {
    const dbHealth = await checkDatabaseHealth();
    return {
      status: dbHealth.ok ? 'HEALTHY' : 'DEGRADED',
      uptimeSeconds: Math.floor(process.uptime()),
      database: dbHealth,
      timestamp: new Date().toISOString(),
    };
  };

  app.get('/health', getHealthHandler);
  app.get('/api/v1/health', getHealthHandler);

  app.get('/api/v1/system/info', async () => {
    return {
      name: 'LeadPulse Enterprise Backend',
      version: '1.0.0',
      nodeVersion: process.version,
      environment: env.NODE_ENV,
      metaApiVersion: env.META_GRAPH_API_VERSION,
    };
  });

  // 5. Register Feature Routes
  app.register(authRoutes);
  app.register(razorpayRoutes);
  app.register(metaAdsRoutes);
  app.register(whatsappAiRoutes);
  app.register(leadsRoutes);
  app.register(customersRoutes);
  app.register(overviewRoutes);
  app.register(integrationsRoutes);

  return app;
}
