/**
 * LeadPulse Enterprise: Razorpay Webhook Simulator & Idempotency Verifier
 * Tests all 3 business sources with valid HMAC-SHA256 signatures and idempotency guarantees.
 *
 * Usage:
 *   node scripts/simulate_razorpay_webhook.js [optional_base_url]
 * Default target: http://127.0.0.1:4000
 */

const crypto = require('crypto');
const http = require('http');

const targetBaseUrl = process.argv[2] || 'http://127.0.0.1:4000';
console.log(`\n============================================================`);
console.log(`⚡ LEADPULSE ENTERPRISE: RAZORPAY WEBHOOK SIMULATOR`);
console.log(`   Target Server: ${targetBaseUrl}`);
console.log(`============================================================\n`);

const accounts = [
  {
    name: 'GlobalInch (VastuWheel Reports & Palmistry)',
    endpoint: '/api/v1/webhooks/razorpay/vastuwheel-report',
    secret: 'whsec_vastuwheel_globalinch_2026',
    accountId: 'acc_globalinch_vastuwheel',
    paymentId: `pay_globalinch_${Date.now()}`,
    orderId: `order_palmistry_${Date.now()}`,
    amountPaise: 99900, // ₹999.00
    customer: {
      name: 'Ravi Kumar Verification',
      contact: '+919876543210',
      email: 'ravi.verification@example.com'
    }
  },
  {
    name: 'Mango Tree Technology (Vastu Webinar)',
    endpoint: '/api/v1/webhooks/razorpay/vastu-webinar',
    secret: 'whsec_webinar_mangotree_2026',
    accountId: 'acc_mangotree_webinar',
    paymentId: `pay_mangotree_${Date.now()}`,
    orderId: `order_webinar_${Date.now()}`,
    amountPaise: 49900, // ₹499.00
    customer: {
      name: 'Pooja Verma',
      contact: '+919811223344',
      email: 'pooja.verma@example.com'
    }
  },
  {
    name: 'Vastu Shikhar (Consultancy)',
    endpoint: '/api/v1/webhooks/razorpay/consultancy',
    secret: 'whsec_consultancy_vastushikhar_2026',
    accountId: 'acc_vastushikhar_consultancy',
    paymentId: `pay_vastushikhar_${Date.now()}`,
    orderId: `order_consultancy_${Date.now()}`,
    amountPaise: 500000, // ₹5,000.00
    customer: {
      name: 'Dr. Suresh Mehta',
      contact: '+919822334455',
      email: 'suresh.mehta@example.com'
    }
  }
];

function sendWebhook(endpoint, payloadString, signature) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, targetBaseUrl);
    const req = http.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': signature,
        'x-razorpay-event-id': `evt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: body ? JSON.parse(body) : null
        });
      });
    });

    req.on('error', reject);
    req.write(payloadString);
    req.end();
  });
}

async function runSimulation() {
  for (const acc of accounts) {
    console.log(`▶ Testing Ingress for: ${acc.name}`);
    console.log(`  Endpoint: ${acc.endpoint}`);
    console.log(`  Amount: ₹${(acc.amountPaise / 100).toFixed(2)} | Payment ID: ${acc.paymentId}`);

    const payload = {
      entity: 'event',
      account_id: acc.accountId,
      event: 'payment.captured',
      contains: ['payment'],
      payload: {
        payment: {
          entity: {
            id: acc.paymentId,
            entity: 'payment',
            amount: acc.amountPaise,
            currency: 'INR',
            status: 'captured',
            order_id: acc.orderId,
            method: 'upi',
            contact: acc.customer.contact,
            email: acc.customer.email,
            fee: Math.round(acc.amountPaise * 0.02),
            tax: Math.round(acc.amountPaise * 0.02 * 0.18),
            notes: {
              customer_name: acc.customer.name,
              receipt: `rcpt_${acc.orderId}`
            },
            created_at: Math.floor(Date.now() / 1000)
          }
        }
      }
    };

    const payloadString = JSON.stringify(payload);
    const validSignature = crypto.createHmac('sha256', acc.secret).update(payloadString).digest('hex');

    // Step A: Send Initial Captured Payment
    try {
      const res1 = await sendWebhook(acc.endpoint, payloadString, validSignature);
      console.log(`  ✔ First Delivery Status [HTTP ${res1.statusCode}]:`, res1.body?.status || res1.body?.message || res1.body);

      // Step B: Send Duplicate Webhook (Idempotency Test)
      console.log(`  🔄 Sending duplicate webhook to verify idempotency protection...`);
      const res2 = await sendWebhook(acc.endpoint, payloadString, validSignature);
      console.log(`  ✔ Duplicate Delivery Status [HTTP ${res2.statusCode}]:`, res2.body?.status, '-', res2.body?.message);

      if (res2.body?.status === 'IGNORED_DUPLICATE') {
        console.log(`  🎉 Idempotency PASS: Double counting prevented!`);
      }
    } catch (err) {
      console.error(`  ❌ Webhook delivery error:`, err.message);
    }

    console.log('------------------------------------------------------------');
  }
}

runSimulation();
