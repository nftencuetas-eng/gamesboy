import assert from 'assert';
import { getDb } from '../server/config/database.js';
import { holdSellerEscrow, releaseSellerPayout, getWallet } from '../server/services/walletService.js';

console.log('🧪 Starting GamesBoy Voice Features Verification Test Suite...');

// 1. Verify Escrow & Custody Workflow (GoSplit Model)
console.log('\n--- 1. Testing GoSplit Custody & Escrow Workflow ---');
const db = getDb();
const initialSellerWallet = getWallet('usr_seller1');
const prevPending = initialSellerWallet.pendingEscrowUsd || 0;
const prevBalance = initialSellerWallet.balanceUsd || 0;

// Hold escrow for $3.33 USD (25.000 Gs) with 10% commission
const holdResult = holdSellerEscrow('usr_seller1', 3.33, 10);
console.log('Hold Escrow result:', holdResult);
assert.strictEqual(holdResult.commission, 0.33, 'Commission should be 10% of 3.33');
assert.strictEqual(holdResult.sellerNet, 3.00, 'Seller net should be 3.00');

// Create a simulated user slot in custody
const testSlot = {
  id: `test_slot_${Date.now()}`,
  subscriptionId: 'sub_netflix_official',
  serviceName: 'Netflix Premium 4K',
  sellerId: 'usr_seller1',
  buyerId: 'usr_client1',
  slotNumber: 2,
  pricePaidUsd: 3.33,
  pricePaidPyg: 25000,
  commissionPercent: 10,
  netPayoutUsd: 3.00,
  netPayoutPyg: 22500,
  expiresAt: new Date(Date.now() - 1000).toISOString(), // Expired / Ready
  payoutStatus: 'custody',
  createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
};

db.user_slots.unshift(testSlot);

// Release seller payout manually by admin
console.log('\n--- 2. Testing Admin Manual Release Payout ("Listo para Pagar") ---');
const releaseResult = releaseSellerPayout(testSlot.id, 'usr_admin');
console.log('Release Payout result:', {
  netPayoutPyg: releaseResult.netPayoutPyg,
  netPayoutUsd: releaseResult.netPayoutUsd,
  payoutStatus: testSlot.payoutStatus,
  releasedBy: testSlot.payoutReleasedBy
});

assert.strictEqual(testSlot.payoutStatus, 'paid', 'Slot payoutStatus should be marked as paid');
assert.strictEqual(releaseResult.netPayoutPyg, 22500, 'Net payout in PYG should be 22.500 Gs.');
assert.strictEqual(releaseResult.netPayoutUsd, 3.00, 'Net payout in USD should be $3.00');

// 3. Verify Default Streaming Services Configuration
console.log('\n--- 3. Testing Streaming Services Config (GoSplit Predefined Catalog) ---');
const servicesConfig = db.streaming_services_config;
assert(servicesConfig, 'streaming_services_config should exist');
assert(servicesConfig.netflix, 'Netflix config should exist');
assert.strictEqual(servicesConfig.netflix.pricePerSlotPyg, 25000, 'Netflix price should be 25.000 Gs.');
assert.strictEqual(servicesConfig.netflix.commissionPercent, 10, 'Netflix commission should be 10%');
assert.strictEqual(servicesConfig.netflix.netPayoutPyg, 22500, 'Netflix net earnings should be 22.500 Gs.');

console.log('\n✅ ALL VERIFICATION TESTS PASSED SUCCESSFULLY! 🚀');
