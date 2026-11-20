import { eq, and, sql, desc } from 'drizzle-orm';
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
        return {
          secret: env.RAZORPAY_WEBHOOK_SECRET_VASTUWHEEL,
          entityName: 'GlobalInch',
          companyCode: 'GLOBALINCH',
        };
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
   * Get payments with pagination and filter criteria
   */
  async listPayments(options: { page?: number; limit?: number; status?: string }) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, options.limit || 25);
    const offset = (page - 1) * limit;

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
      .orderBy(desc(capturedPayments.capturedAt))
      .limit(limit)
      .offset(offset);

    const [totalRow] = await db.select({ count: sql<number>`count(*)` }).from(capturedPayments);

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
