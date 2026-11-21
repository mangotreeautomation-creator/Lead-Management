import test from 'node:test';
import assert from 'node:assert';
import { razorpayService } from '../modules/razorpay/razorpay.service';

test('Razorpay Security: Reject unknown account slugs', () => {
  assert.throws(
    () => {
      razorpayService.getSecretForSlug('unknown_malicious_slug');
    },
    /Invalid or unsupported Razorpay account slug/,
    'Should throw error on unknown slug'
  );
});

test('Razorpay Security: Correct secrets mapped to known slugs', () => {
  const s1 = razorpayService.getSecretForSlug('vastuwheel-report');
  assert.strictEqual(s1.companyCode, 'GLOBALINCH');

  const s2 = razorpayService.getSecretForSlug('vastu-webinar');
  assert.strictEqual(s2.companyCode, 'MANGO_TREE');

  const s3 = razorpayService.getSecretForSlug('consultancy');
  assert.strictEqual(s3.companyCode, 'VASTU_SHIKHAR');
});
