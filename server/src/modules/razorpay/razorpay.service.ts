import { eq, and, sql, desc, gte, lte } from 'drizzle-orm';
import { db } from '../../database/client';
import {
  gatewayAccounts,
  paymentOrders,
  paymentAttempts,
  capturedPayments,
  refunds,
  rawWebhookEvents,
  customers,
  customerIdentifiers,
  leads,
  leadTouchpoints,
  companies,
} from '../../database/schema/index';
import { verifyRazorpaySignature } from '../../utils/crypto';
import { env } from '../../config/env';

export interface WebhookProcessingResult {
  status: 'PROCESSED' | 'IGNORED_DUPLICATE' | 'INVALID_SIGNATURE' | 'FAILED';
  message: string;
  paymentId?: string;
  orderId?: string;
  amountPaise?: number;
}

export class RazorpayService {
  /**
   * Get the webhook secret corresponding to an account / route slug
   */
  getSecretForSlug(slug: string): { secret: string; entityName: string; companyCode: string } {
    switch (slug.toLowerCase()) {
      case 'vastuwheel-report':
        return {
          secret: env.RAZORPAY_WEBHOOK_SECRET_VASTUWHEEL,
          entityName: 'GlobalInch (VastuWheel Reports & Palmistry)',
          companyCode: 'GLOBALINCH',
        };
      case 'vastu-webinar':
        return {
          secret: env.RAZORPAY_WEBHOOK_SECRET_WEBINAR,
          entityName: 'Mango Tree Technology (Vastu Webinar)',
          companyCode: 'MANGO_TREE',
        };
      case 'consultancy':
        return {
          secret: env.RAZORPAY_WEBHOOK_SECRET_CONSULTANCY,
          entityName: 'Vastu Shikhar (Consultancy)',
          companyCode: 'VASTU_SHIKHAR',
        };
      default:
        throw new Error(`Invalid or unsupported Razorpay account slug: ${slug}. Allowed slugs: vastuwheel-report, vastu-webinar, consultancy.`);
    }
  }

  /**
   * Process incoming webhook event with cryptographic HMAC verification and idempotency
   */
  async handleWebhook(
    slug: string,
    rawBody: string,
    signature: string,
    headers: Record<string, any>
  ): Promise<WebhookProcessingResult> {
    const { secret, entityName, companyCode } = this.getSecretForSlug(slug);

    // 1. Verify HMAC-SHA256 signature
    const isValid = verifyRazorpaySignature(rawBody, signature, secret);

    let parsedPayload: any;
    try {
      parsedPayload = JSON.parse(rawBody);
    } catch (e: any) {
      await db.insert(rawWebhookEvents).values({
        eventType: 'UNKNOWN_INVALID_JSON',
        headers,
        rawPayload: rawBody,
        signature,
        signatureValid: false,
        status: 'FAILED',
        processingError: 'Failed to parse JSON payload',
      });
      return { status: 'FAILED', message: 'Invalid JSON payload' };
    }

    const eventType = parsedPayload.event || 'unknown';
    const eventId = headers['x-razorpay-event-id'] || parsedPayload.id || `evt_${Date.now()}`;

    // 2. Check for duplicate event ID (Idempotency Step 1)
    const [existingEvent] = await db
      .select()
      .from(rawWebhookEvents)
      .where(eq(rawWebhookEvents.eventId, eventId))
      .limit(1);

    if (existingEvent && existingEvent.status === 'PROCESSED') {
      return {
        status: 'IGNORED_DUPLICATE',
        message: `Event ${eventId} has already been processed previously.`,
      };
    }

    // 3. Log raw webhook event
    const [recordedEvent] = await db
      .insert(rawWebhookEvents)
      .values({
        eventId,
        eventType,
        headers,
        rawPayload: rawBody,
        signature,
        signatureValid: isValid,
        status: isValid ? 'RECEIVED' : 'FAILED',
        processingError: isValid ? null : 'Signature verification failed',
      })
      .returning();

    if (!isValid) {
      return {
        status: 'INVALID_SIGNATURE',
        message: 'Cryptographic signature mismatch. Webhook rejected.',
      };
    }

    // 4. Find or create Gateway Account record
    let [gateway] = await db
      .select()
      .from(gatewayAccounts)
      .where(eq(gatewayAccounts.webhookEndpointPath, `/api/v1/webhooks/razorpay/${slug}`))
      .limit(1);

    if (!gateway) {
      const [comp] = await db.select().from(companies).where(eq(companies.code, companyCode)).limit(1);
      if (comp) {
        [gateway] = await db
          .insert(gatewayAccounts)
          .values({
            companyId: comp.id,
            provider: 'RAZORPAY',
            merchantId: parsedPayload.account_id || null,
            webhookEndpointPath: `/api/v1/webhooks/razorpay/${slug}`,
            name: `${entityName} Gateway`,
          })
          .returning();
      }
    }

    // Update raw event with gateway ID
    if (gateway && recordedEvent) {
      await db
        .update(rawWebhookEvents)
        .set({ gatewayAccountId: gateway.id })
        .where(eq(rawWebhookEvents.id, recordedEvent.id));
    }

    // 5. Route by Event Type
    try {
      if (eventType === 'payment.captured' || eventType === 'order.paid') {
        const paymentEntity = parsedPayload.payload?.payment?.entity || parsedPayload.payload?.order?.entity;
        if (!paymentEntity) {
          throw new Error('No payment entity found in payload');
        }

        const rzpPaymentId = paymentEntity.id;
        const rzpOrderId = paymentEntity.order_id || `order_manual_${rzpPaymentId}`;
        const amountPaise = paymentEntity.amount;
        const feePaise = paymentEntity.fee || 0;
        const taxPaise = paymentEntity.tax || 0;
        const netPaise = amountPaise - feePaise - taxPaise;
        const customerEmail = paymentEntity.email;
        const customerPhone = paymentEntity.contact;
        const method = paymentEntity.method;

        // Idempotency Step 2: Check if payment already exists in captured_payments
        const [existingCapture] = await db
          .select()
          .from(capturedPayments)
          .where(eq(capturedPayments.razorpayPaymentId, rzpPaymentId))
          .limit(1);

        if (existingCapture) {
          await db
            .update(rawWebhookEvents)
            .set({ status: 'IGNORED_DUPLICATE', processedAt: new Date() })
            .where(eq(rawWebhookEvents.id, recordedEvent.id));

          return {
            status: 'IGNORED_DUPLICATE',
            message: `Payment ${rzpPaymentId} is already captured and recorded. Revenue preserved without double-counting.`,
            paymentId: rzpPaymentId,
          };
        }

        // Link or create Customer
        let customerId: string | null = null;
        if (customerPhone) {
          const [foundCust] = await db
            .select()
            .from(customers)
            .where(eq(customers.phone, customerPhone))
            .limit(1);

          if (foundCust) {
            customerId = foundCust.id;
            await db
              .update(customers)
              .set({
                totalOrders: foundCust.totalOrders + 1,
                totalSpentPaise: foundCust.totalSpentPaise + amountPaise,
                lastActiveAt: new Date(),
              })
              .where(eq(customers.id, foundCust.id));
          } else if (gateway) {
            const [newCust] = await db
              .insert(customers)
              .values({
                companyId: gateway.companyId,
                fullName: paymentEntity.notes?.customer_name || 'Razorpay Customer',
                email: customerEmail || null,
                phone: customerPhone,
                totalOrders: 1,
                totalSpentPaise: amountPaise,
              })
              .returning();
            customerId = newCust.id;

            // Add identifier
            await db.insert(customerIdentifiers).values({
              customerId: newCust.id,
              identifierType: 'PHONE',
              identifierValue: customerPhone,
              isPrimary: true,
            });
          }
        }

        // Link or create Lead
        let leadId: string | null = null;
        if (customerId && gateway) {
          const [existingLead] = await db
            .select()
            .from(leads)
            .where(eq(leads.customerId, customerId))
            .orderBy(desc(leads.createdAt))
            .limit(1);

          if (existingLead) {
            leadId = existingLead.id;
            await db
              .update(leads)
              .set({ status: 'CONVERTED', stage: 'CLOSED_WON', updatedAt: new Date() })
              .where(eq(leads.id, existingLead.id));
          }
        }

        // Upsert Payment Order
        let [order] = await db
          .select()
          .from(paymentOrders)
          .where(eq(paymentOrders.razorpayOrderId, rzpOrderId))
          .limit(1);

        if (!order && gateway) {
          [order] = await db
            .insert(paymentOrders)
            .values({
              gatewayAccountId: gateway.id,
              customerId,
              leadId,
              razorpayOrderId: rzpOrderId,
              receipt: paymentEntity.notes?.receipt || null,
              amountPaise,
              currency: paymentEntity.currency || 'INR',
              status: 'paid',
              notes: paymentEntity.notes || null,
            })
            .returning();
        } else if (order) {
          await db
            .update(paymentOrders)
            .set({ status: 'paid', updatedAt: new Date() })
            .where(eq(paymentOrders.id, order.id));
        }

        // Insert Payment Attempt
        if (order) {
          await db.insert(paymentAttempts).values({
            paymentOrderId: order.id,
            razorpayPaymentId: rzpPaymentId,
            status: 'captured',
            method,
            vpa: paymentEntity.vpa || null,
            bank: paymentEntity.bank || null,
            wallet: paymentEntity.wallet || null,
            email: customerEmail || null,
            contact: customerPhone || null,
            feePaise,
            taxPaise,
          });

          // Insert Captured Payment
          await db.insert(capturedPayments).values({
            paymentOrderId: order.id,
            gatewayAccountId: gateway.id,
            razorpayPaymentId: rzpPaymentId,
            amountPaise,
            currency: paymentEntity.currency || 'INR',
            status: 'captured',
            method,
            feePaise,
            taxPaise,
            netPaise,
            capturedAt: new Date(paymentEntity.created_at ? paymentEntity.created_at * 1000 : Date.now()),
            rzpCreatedAt: new Date(paymentEntity.created_at ? paymentEntity.created_at * 1000 : Date.now()),
          });

          // Record Touchpoint if lead exists
          if (leadId) {
            await db.insert(leadTouchpoints).values({
              leadId,
              channel: 'PAYMENT_GATEWAY',
              touchpointType: 'PAYMENT_SUCCESS',
              direction: 'INBOUND',
              summary: `Captured payment of ₹${(amountPaise / 100).toFixed(2)} via Razorpay (${method})`,
              payload: { rzpPaymentId, amountPaise, method },
            });
          }
        }

        // Mark webhook as PROCESSED
        await db
          .update(rawWebhookEvents)
          .set({ status: 'PROCESSED', processedAt: new Date() })
          .where(eq(rawWebhookEvents.id, recordedEvent.id));

        return {
          status: 'PROCESSED',
          message: `Successfully processed captured payment ${rzpPaymentId} (₹${(amountPaise / 100).toFixed(2)})`,
          paymentId: rzpPaymentId,
          orderId: rzpOrderId,
          amountPaise,
        };
      }

      if (eventType === 'refund.created' || eventType === 'refund.processed') {
        const refundEntity = parsedPayload.payload?.refund?.entity;
        if (refundEntity) {
          const rzpPaymentId = refundEntity.payment_id;
          const [capture] = await db
            .select()
            .from(capturedPayments)
            .where(eq(capturedPayments.razorpayPaymentId, rzpPaymentId))
            .limit(1);

          if (capture) {
            await db.insert(refunds).values({
              capturedPaymentId: capture.id,
              razorpayRefundId: refundEntity.id,
              amountPaise: refundEntity.amount,
              status: refundEntity.status || 'processed',
              reason: refundEntity.notes?.reason || 'Customer request',
              speed: refundEntity.speed_processed || 'normal',
            });
          }
        }

        await db
          .update(rawWebhookEvents)
          .set({ status: 'PROCESSED', processedAt: new Date() })
          .where(eq(rawWebhookEvents.id, recordedEvent.id));

        return {
          status: 'PROCESSED',
          message: `Processed refund event for payment ${refundEntity?.payment_id}`,
        };
      }

      // Default: mark other events as PROCESSED
      await db
        .update(rawWebhookEvents)
        .set({ status: 'PROCESSED', processedAt: new Date() })
        .where(eq(rawWebhookEvents.id, recordedEvent.id));

      return {
        status: 'PROCESSED',
        message: `Event ${eventType} recorded successfully`,
      };
    } catch (err: any) {
      await db
        .update(rawWebhookEvents)
        .set({ status: 'FAILED', processingError: err.message, processedAt: new Date() })
        .where(eq(rawWebhookEvents.id, recordedEvent.id));

      return {
        status: 'FAILED',
        message: `Processing failed: ${err.message}`,
      };
    }
  }

  /**
   * Check connection status of Razorpay integrations
   */
  async getConnectionStatus() {
    const isVastuWheelLive =
      !!env.RAZORPAY_KEY_ID_VASTUWHEEL &&
      !env.RAZORPAY_KEY_ID_VASTUWHEEL.includes('placeholder') &&
      !!env.RAZORPAY_KEY_SECRET_VASTUWHEEL &&
      !env.RAZORPAY_KEY_SECRET_VASTUWHEEL.includes('placeholder');

    const accounts = await db.select().from(gatewayAccounts);

    const [totalCaptured] = await db
      .select({
        count: sql<number>`count(*)`,
        totalGrossPaise: sql<number>`coalesce(sum(${capturedPayments.amountPaise}), 0)`,
      })
      .from(capturedPayments);

    return {
      status: 'CONFIGURED',
      accounts: [
        {
          slug: 'vastuwheel-report',
          name: 'GlobalInch (VastuWheel Reports & Palmistry)',
          merchantId: env.RAZORPAY_ACCOUNT_ID_VASTUWHEEL,
          keyId: isVastuWheelLive ? env.RAZORPAY_KEY_ID_VASTUWHEEL.slice(0, 10) + '...' : 'AWAITING_KEY',
          webhookConfigured: true,
          liveReady: isVastuWheelLive,
        },
        {
          slug: 'vastu-webinar',
          name: 'Mango Tree Technology (Vastu Webinar)',
          merchantId: env.RAZORPAY_ACCOUNT_ID_WEBINAR,
          keyId: 'AWAITING_KEY',
          webhookConfigured: true,
          liveReady: false,
        },
        {
          slug: 'consultancy',
          name: 'Vastu Shikhar (Consultancy)',
          merchantId: env.RAZORPAY_ACCOUNT_ID_CONSULTANCY,
          keyId: 'AWAITING_KEY',
          webhookConfigured: true,
          liveReady: false,
        },
      ],
      totalCapturedCount: Number(totalCaptured?.count || 0),
      totalGrossRupees: Number(totalCaptured?.totalGrossPaise || 0) / 100,
    };
  }

  /**
   * Import historical payments (LAST 30 DAYS ONLY) — Strictly Read-Only (GET)
   */
  async importHistoricalPayments30Days(slug: string = 'vastuwheel-report') {
    const nowSec = Math.floor(Date.now() / 1000);
    const thirtyDaysSec = 30 * 24 * 60 * 60;
    const fromSec = nowSec - thirtyDaysSec;
    const toSec = nowSec;

    let keyId = env.RAZORPAY_KEY_ID_VASTUWHEEL;
    let keySecret = env.RAZORPAY_KEY_SECRET_VASTUWHEEL;
    let merchantId = env.RAZORPAY_ACCOUNT_ID_VASTUWHEEL;

    if (slug === 'vastu-webinar') {
      keyId = env.RAZORPAY_KEY_ID_WEBINAR;
      keySecret = env.RAZORPAY_KEY_SECRET_WEBINAR;
      merchantId = env.RAZORPAY_ACCOUNT_ID_WEBINAR;
    } else if (slug === 'consultancy') {
      keyId = env.RAZORPAY_KEY_ID_CONSULTANCY;
      keySecret = env.RAZORPAY_KEY_SECRET_CONSULTANCY;
      merchantId = env.RAZORPAY_ACCOUNT_ID_CONSULTANCY;
    }

    const isLive = keyId && !keyId.includes('placeholder') && keySecret && !keySecret.includes('placeholder');

    if (!isLive) {
      return {
        success: true,
        mode: 'AWAITING_CREDENTIALS',
        message: `Razorpay live API credentials for account "${slug}" are awaiting configuration in server/.env. Zero mock data injected.`,
        recordsFetched: 0,
        recordsImported: 0,
        dateRange: {
          from: new Date(fromSec * 1000).toISOString(),
          to: new Date(toSec * 1000).toISOString(),
        },
      };
    }

    // Live Read-Only Paginated Fetch
    const [gwAccount] = await db
      .select()
      .from(gatewayAccounts)
      .where(eq(gatewayAccounts.merchantId, merchantId))
      .limit(1);

    if (!gwAccount) {
      throw new Error(`Gateway account ${merchantId} not found in database.`);
    }

    let skip = 0;
    const count = 100;
    let hasMore = true;
    let totalFetched = 0;
    let totalImported = 0;

    const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;

    while (hasMore) {
      const url = `https://api.razorpay.com/v1/payments?from=${fromSec}&to=${toSec}&count=${count}&skip=${skip}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Razorpay API responded with ${res.status}: ${errText}`);
      }

      const body = (await res.json()) as any;
      const items = body.items || [];
      totalFetched += items.length;

      for (const p of items) {
        // Resolve or create Customer
        let customerId: string | null = null;
        const phone = p.contact ? p.contact.replace(/\s+/g, '') : null;
        const email = p.email ? p.email.toLowerCase().trim() : null;
        const fullName = p.notes?.name || (email ? email.split('@')[0] : 'VastuWheel Customer');

        if (phone || email) {
          let existingCust: any = null;
          if (phone) {
            const [cById] = await db
              .select({ customerId: customerIdentifiers.customerId })
              .from(customerIdentifiers)
              .where(eq(customerIdentifiers.identifierValue, phone))
              .limit(1);
            if (cById) {
              const [c] = await db.select().from(customers).where(eq(customers.id, cById.customerId)).limit(1);
              existingCust = c;
            }
          }
          if (!existingCust && email) {
            const [cById] = await db
              .select({ customerId: customerIdentifiers.customerId })
              .from(customerIdentifiers)
              .where(eq(customerIdentifiers.identifierValue, email))
              .limit(1);
            if (cById) {
              const [c] = await db.select().from(customers).where(eq(customers.id, cById.customerId)).limit(1);
              existingCust = c;
            }
          }

          if (existingCust) {
            customerId = existingCust.id;
            if (p.status === 'captured') {
              await db
                .update(customers)
                .set({
                  totalOrders: (existingCust.totalOrders || 0) + 1,
                  totalSpentPaise: (existingCust.totalSpentPaise || 0) + p.amount,
                  updatedAt: new Date(),
                })
                .where(eq(customers.id, existingCust.id));
            }
          } else {
            const [newCust] = await db
              .insert(customers)
              .values({
                companyId: gwAccount.companyId,
                fullName,
                email,
                phone,
                city: p.notes?.city || 'India',
                state: 'India',
                country: 'India',
                totalOrders: p.status === 'captured' ? 1 : 0,
                totalSpentPaise: p.status === 'captured' ? p.amount : 0,
                createdAt: new Date(p.created_at * 1000),
              })
              .onConflictDoNothing()
              .returning();

            if (newCust) {
              customerId = newCust.id;
              if (phone) {
                await db
                  .insert(customerIdentifiers)
                  .values({ customerId: newCust.id, identifierType: 'PHONE', identifierValue: phone, isPrimary: true })
                  .onConflictDoNothing();
              }
              if (email) {
                await db
                  .insert(customerIdentifiers)
                  .values({ customerId: newCust.id, identifierType: 'EMAIL', identifierValue: email, isPrimary: !phone })
                  .onConflictDoNothing();
              }
            }
          }
        }

        // Resolve or create Lead
        let leadId: string | null = null;
        if (customerId && gwAccount.categoryId) {
          const leadCode = `LD-VWHL-${p.id.slice(-8).toUpperCase()}`;
          const isCaptured = p.status === 'captured';

          const [newLead] = await db
            .insert(leads)
            .values({
              customerId,
              companyId: gwAccount.companyId,
              categoryId: gwAccount.categoryId,
              leadCode,
              status: isCaptured ? 'CONVERTED' : 'NEW',
              score: isCaptured ? 90 : 40,
              stage: isCaptured ? 'CLOSED_WON' : 'DISCOVERY',
              source: 'META_ADS',
              channel: 'PAID_SOCIAL',
              createdAt: new Date(p.created_at * 1000),
            })
            .onConflictDoNothing()
            .returning();

          leadId = newLead?.id || null;
        }

        // Idempotent upsert order & payment
        const rzpOrderId = p.order_id || `order_backfill_${p.id}`;

        let [order] = await db
          .select()
          .from(paymentOrders)
          .where(eq(paymentOrders.razorpayOrderId, rzpOrderId))
          .limit(1);

        if (!order) {
          const [newOrder] = await db
            .insert(paymentOrders)
            .values({
              gatewayAccountId: gwAccount.id,
              customerId,
              leadId,
              razorpayOrderId: rzpOrderId,
              amountPaise: p.amount,
              currency: p.currency || 'INR',
              status: p.status === 'captured' ? 'paid' : p.status,
            })
            .onConflictDoNothing()
            .returning();
          order = newOrder;
        }

        if (order) {
          await db
            .insert(paymentAttempts)
            .values({
              paymentOrderId: order.id,
              razorpayPaymentId: p.id,
              status: p.status,
              method: p.method,
              vpa: p.vpa,
              email: p.email,
              contact: p.contact,
              feePaise: p.fee || 0,
              taxPaise: p.tax || 0,
              errorCode: p.error_code,
              errorDescription: p.error_description,
              createdAt: new Date(p.created_at * 1000),
            })
            .onConflictDoNothing();

          if (p.status === 'captured') {
            const fee = p.fee || 0;
            const tax = p.tax || 0;
            const net = p.amount - fee - tax;

            await db
              .insert(capturedPayments)
              .values({
                paymentOrderId: order.id,
                gatewayAccountId: gwAccount.id,
                razorpayPaymentId: p.id,
                amountPaise: p.amount,
                currency: p.currency || 'INR',
                status: 'captured',
                method: p.method,
                feePaise: fee,
                taxPaise: tax,
                netPaise: net,
                capturedAt: new Date(p.created_at * 1000),
              })
              .onConflictDoNothing();
            totalImported++;
          }
        }
      }

      if (items.length < count) {
        hasMore = false;
      } else {
        skip += count;
      }
    }

    // Fetch and store all 30-day Refunds
    let totalRefundsCount = 0;
    let totalRefundAmountPaise = 0;

    try {
      const refUrl = `https://api.razorpay.com/v1/refunds?from=${fromSec}&to=${toSec}&count=100`;
      const refRes = await fetch(refUrl, {
        method: 'GET',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
      });

      if (refRes.ok) {
        const refBody = (await refRes.json()) as any;
        const refundItems = refBody.items || [];

        for (const r of refundItems) {
          let [capture] = await db
            .select()
            .from(capturedPayments)
            .where(eq(capturedPayments.razorpayPaymentId, r.payment_id))
            .limit(1);

          if (!capture) {
            try {
              const parentRes = await fetch(`https://api.razorpay.com/v1/payments/${r.payment_id}`, {
                method: 'GET',
                headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
              });
              if (parentRes.ok) {
                const parentPayment = (await parentRes.json()) as any;
                const rzpOrderId = parentPayment.order_id || `order_backfill_${parentPayment.id}`;

                let [parentOrder] = await db
                  .select()
                  .from(paymentOrders)
                  .where(eq(paymentOrders.razorpayOrderId, rzpOrderId))
                  .limit(1);

                if (!parentOrder) {
                  const [newOrd] = await db
                    .insert(paymentOrders)
                    .values({
                      gatewayAccountId: gwAccount.id,
                      razorpayOrderId: rzpOrderId,
                      amountPaise: parentPayment.amount,
                      currency: parentPayment.currency || 'INR',
                      status: 'paid',
                    })
                    .onConflictDoNothing()
                    .returning();
                  parentOrder = newOrd;
                }

                if (parentOrder) {
                  const fee = parentPayment.fee || 0;
                  const tax = parentPayment.tax || 0;
                  const [newCap] = await db
                    .insert(capturedPayments)
                    .values({
                      paymentOrderId: parentOrder.id,
                      gatewayAccountId: gwAccount.id,
                      razorpayPaymentId: parentPayment.id,
                      amountPaise: parentPayment.amount,
                      currency: parentPayment.currency || 'INR',
                      status: 'captured',
                      method: parentPayment.method,
                      feePaise: fee,
                      taxPaise: tax,
                      netPaise: parentPayment.amount - fee - tax,
                      capturedAt: new Date(parentPayment.created_at * 1000),
                    })
                    .onConflictDoNothing()
                    .returning();
                  capture = newCap;
                }
              }
            } catch (pErr) {
              // ignore
            }
          }

          if (capture) {
            await db
              .insert(refunds)
              .values({
                capturedPaymentId: capture.id,
                razorpayRefundId: r.id,
                amountPaise: r.amount,
                status: r.status || 'processed',
                reason: r.notes?.reason || 'Customer refund',
                speed: r.speed_processed || 'normal',
                createdAt: new Date(r.created_at * 1000),
              })
              .onConflictDoUpdate({
                target: refunds.razorpayRefundId,
                set: {
                  status: r.status || 'processed',
                  amountPaise: r.amount,
                },
              });
            totalRefundsCount++;
            totalRefundAmountPaise += r.amount;
          }
        }
      }
    } catch (refErr: any) {
      console.warn('[Razorpay Import] Failed to backfill refunds:', refErr.message);
    }

    return {
      success: true,
      mode: 'LIVE_READ_ONLY',
      recordsFetched: totalFetched,
      capturedCount: totalImported,
      failedAttemptsCount: totalFetched - totalImported,
      refundsCount: totalRefundsCount,
      refundsTotalRupees: totalRefundAmountPaise / 100,
      dateRange: {
        from: new Date(fromSec * 1000).toISOString(),
        to: new Date(toSec * 1000).toISOString(),
      },
    };
  }

  /**
   * Get payments summary aggregated
   */
  async getPaymentsSummary(categoryId?: string, startDate?: string, endDate?: string) {
    const conditions: any[] = [];
    if (startDate) conditions.push(gte(capturedPayments.capturedAt, new Date(startDate)));
    if (endDate) {
      const endStr = endDate.length === 10 ? `${endDate}T23:59:59.999Z` : endDate;
      conditions.push(lte(capturedPayments.capturedAt, new Date(endStr)));
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [agg] = await db
      .select({
        count: sql<number>`count(*)`,
        totalGrossPaise: sql<number>`coalesce(sum(${capturedPayments.amountPaise}), 0)`,
        totalFeePaise: sql<number>`coalesce(sum(${capturedPayments.feePaise}), 0)`,
        totalTaxPaise: sql<number>`coalesce(sum(${capturedPayments.taxPaise}), 0)`,
        totalNetPaise: sql<number>`coalesce(sum(${capturedPayments.netPaise}), 0)`,
      })
      .from(capturedPayments)
      .where(whereClause);

    const refConditions: any[] = [];
    if (startDate) refConditions.push(gte(refunds.createdAt, new Date(startDate)));
    if (endDate) {
      const endStr = endDate.length === 10 ? `${endDate}T23:59:59.999Z` : endDate;
      refConditions.push(lte(refunds.createdAt, new Date(endStr)));
    }
    const refWhere = refConditions.length > 0 ? and(...refConditions) : undefined;

    const [refundAgg] = await db
      .select({
        count: sql<number>`count(*)`,
        totalRefundPaise: sql<number>`coalesce(sum(${refunds.amountPaise}), 0)`,
      })
      .from(refunds)
      .where(refWhere);

    const gross = Number(agg?.totalGrossPaise || 0) / 100;
    const refAmt = Number(refundAgg?.totalRefundPaise || 0) / 100;
    const net = gross - refAmt;

    return {
      totalCount: Number(agg?.count || 0),
      grossRupees: gross,
      refundCount: Number(refundAgg?.count || 0),
      refundRupees: refAmt,
      netRealizedRupees: net,
      feeRupees: Number(agg?.totalFeePaise || 0) / 100,
      taxRupees: Number(agg?.totalTaxPaise || 0) / 100,
      currency: 'INR',
    };
  }

  /**
   * Get payments with pagination and filter criteria
   */
  async listPayments(options: { page?: number; limit?: number; status?: string; startDate?: string; endDate?: string }) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(1000, options.limit || 25);
    const offset = (page - 1) * limit;

    const conditions: any[] = [];
    if (options.startDate) conditions.push(gte(capturedPayments.capturedAt, new Date(options.startDate)));
    if (options.endDate) {
      const endStr = options.endDate.length === 10 ? `${options.endDate}T23:59:59.999Z` : options.endDate;
      conditions.push(lte(capturedPayments.capturedAt, new Date(endStr)));
    }
    if (options.status && options.status !== 'ALL') {
      conditions.push(eq(capturedPayments.status, options.status));
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db
      .select({
        id: capturedPayments.id,
        paymentId: capturedPayments.razorpayPaymentId,
        amountPaise: capturedPayments.amountPaise,
        feePaise: capturedPayments.feePaise,
        taxPaise: capturedPayments.taxPaise,
        netPaise: capturedPayments.netPaise,
        currency: capturedPayments.currency,
        status: capturedPayments.status,
        method: capturedPayments.method,
        capturedAt: capturedPayments.capturedAt,
        orderId: paymentOrders.razorpayOrderId,
        gatewayName: gatewayAccounts.name,
      })
      .from(capturedPayments)
      .innerJoin(paymentOrders, eq(capturedPayments.paymentOrderId, paymentOrders.id))
      .innerJoin(gatewayAccounts, eq(capturedPayments.gatewayAccountId, gatewayAccounts.id))
      .where(whereClause)
      .orderBy(desc(capturedPayments.capturedAt))
      .limit(limit)
      .offset(offset);

    const [totalRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(capturedPayments)
      .where(whereClause);

    return {
      data: data.map((p) => ({
        ...p,
        amount: p.amountPaise / 100,
        fee: p.feePaise / 100,
        tax: p.taxPaise / 100,
        net: p.netPaise / 100,
      })),
      pagination: {
        page,
        limit,
        total: Number(totalRow?.count || 0),
        totalPages: Math.ceil(Number(totalRow?.count || 0) / limit),
      },
    };
  }
}

export const razorpayService = new RazorpayService();

