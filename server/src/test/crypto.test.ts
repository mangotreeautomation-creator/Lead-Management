import test from 'node:test';
import assert from 'node:assert';
import { hashPassword, comparePassword, verifyRazorpaySignature, generateHmacSha256 } from '../utils/crypto';

test('Crypto: Password hashing and comparison', async () => {
  const plaintext = 'Admin@2026!';
  const hash = await hashPassword(plaintext);

  assert.ok(hash.startsWith('$2'), 'Hash should be valid bcrypt format');
  assert.notStrictEqual(hash, plaintext, 'Hash must not match plaintext');

  const match = await comparePassword(plaintext, hash);
  assert.strictEqual(match, true, 'Correct password must verify');

  const wrongMatch = await comparePassword('WrongPassword123!', hash);
  assert.strictEqual(wrongMatch, false, 'Incorrect password must fail');
});

test('Crypto: Razorpay HMAC-SHA256 signature verification', () => {
  const secret = 'whsec_vastuwheel_globalinch_2026';
  const payload = JSON.stringify({
    entity: 'event',
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: 'pay_test_12345',
          amount: 99900,
          currency: 'INR',
          status: 'captured',
        },
      },
    },
  });

  const validSignature = generateHmacSha256(payload, secret);
  assert.ok(validSignature.length === 64, 'Signature should be 64-char hex');

  const isValid = verifyRazorpaySignature(payload, validSignature, secret);
  assert.strictEqual(isValid, true, 'Valid signature must return true');

  const isInvalid = verifyRazorpaySignature(payload, 'invalid_signature_hex_000000000000000000000000000000000000000000000000', secret);
  assert.strictEqual(isInvalid, false, 'Invalid signature must return false');

  const wrongSecret = verifyRazorpaySignature(payload, validSignature, 'wrong_secret_key');
  assert.strictEqual(wrongSecret, false, 'Wrong secret must return false');
});
