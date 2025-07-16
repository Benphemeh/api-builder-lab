const crypto = require('crypto');

// Your Paystack secret key
const PAYSTACK_SECRET = 'sk_test_563dbdd2eceff34d4af17578ec9d6d54b7d1f780';

// Function to generate signature
function generateSignature(payload) {
  const jsonString = JSON.stringify(payload);
  const signature = crypto
    .createHmac('sha512', PAYSTACK_SECRET)
    .update(jsonString, 'utf8')
    .digest('hex');
  
  return { jsonString, signature };
}

// Test payloads
const successPayload = {
  event: 'charge.success',
  data: {
    reference: 'test_postman_success',
    status: 'success',
    amount: 500000,
    customer: {
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User'
    },
    gateway_response: 'Successful',
    paid_at: '2025-07-16T10:30:00.000Z',
    channel: 'card'
  }
};

const failedPayload = {
  event: 'charge.failed',
  data: {
    reference: 'test_postman_failed',
    status: 'failed',
    amount: 250000,
    customer: {
      email: 'failed@test.com',
      first_name: 'Jane',
      last_name: 'Smith'
    },
    gateway_response: 'Insufficient funds',
    channel: 'card'
  }
};

// Generate signatures
console.log('🎯 POSTMAN WEBHOOK TEST DATA\n');
console.log('='.repeat(50));

console.log('\n📋 SUCCESS WEBHOOK TEST:');
console.log('URL: POST http://localhost:3030/api/payments/webhook');
console.log('\nHeaders:');
console.log('Content-Type: application/json');

const successResult = generateSignature(successPayload);
console.log(`x-paystack-signature: ${successResult.signature}`);

console.log('\nBody (JSON):');
console.log(successResult.jsonString);

console.log('\n' + '='.repeat(50));

console.log('\n📋 FAILED WEBHOOK TEST:');
console.log('URL: POST http://localhost:3030/api/payments/webhook');
console.log('\nHeaders:');
console.log('Content-Type: application/json');

const failedResult = generateSignature(failedPayload);
console.log(`x-paystack-signature: ${failedResult.signature}`);

console.log('\nBody (JSON):');
console.log(failedResult.jsonString);

console.log('\n' + '='.repeat(50));
console.log('\n🚀 Copy the above data into Postman and send the requests!');
console.log('Expected response: 201 Created with success message');

console.log('\n📝 CUSTOM PAYLOAD GENERATOR');
console.log('To generate signature for custom payload, modify the payload object above and run this script again.');

// For custom payloads
function generateCustomSignature(customPayload) {
  const result = generateSignature(customPayload);
  console.log('\n🔧 CUSTOM PAYLOAD:');
  console.log('Headers:');
  console.log('Content-Type: application/json');
  console.log(`x-paystack-signature: ${result.signature}`);
  console.log('\nBody (JSON):');
  console.log(result.jsonString);
}

// Example: Generate signature for a different amount
const customPayload = {
  event: 'charge.success',
  data: {
    reference: 'test_custom_amount',
    status: 'success',
    amount: 1000000, // ₦10,000
    customer: {
      email: 'custom@test.com',
      first_name: 'Custom',
      last_name: 'Test'
    }
  }
};

console.log('\n' + '='.repeat(50));
generateCustomSignature(customPayload);