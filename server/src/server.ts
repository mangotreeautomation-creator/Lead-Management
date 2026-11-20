import { buildApp } from './app';
import { env } from './config/env';

async function bootstrap() {
  const app = buildApp();

  try {
    const address = await app.listen({
      port: env.PORT,
      host: env.HOST,
    });
    console.log(`\n============================================================`);
    console.log(`🚀 LEADPULSE ENTERPRISE BACKEND SERVER RUNNING`);
    console.log(`   Address: ${address}`);
    console.log(`   Health:  ${address}/health`);
    console.log(`   Webhook: ${address}/api/v1/webhooks/razorpay/*`);
    console.log(`   Mode:    ${env.NODE_ENV}`);
    console.log(`============================================================\n`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

bootstrap();
