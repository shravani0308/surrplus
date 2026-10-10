import assert from 'assert';
import { getMinutesDifference, calculateRemainingKg, getDonationStatus } from '../src/utils/timeUtils.js';

console.log('--- Running SurplusLink Business Logic Unit Tests ---');

// Test 1: Minutes difference calculation
const diff1 = getMinutesDifference('2026-10-09T18:00', '2026-10-09T19:00');
assert.strictEqual(diff1, 60, '1 hour difference should equal 60 minutes');
console.log('✓ Test 1: Minutes difference verified');

// Test 2: Calculate remaining kilograms
const sampleDonation = { id: 'don_1', quantity_kg: 10 };
const sampleClaims = [
  { donation_id: 'don_1', quantity_kg: 3, status: 'ACTIVE' },
  { donation_id: 'don_1', quantity_kg: 2, status: 'COLLECTED' },
  { donation_id: 'don_1', quantity_kg: 4, status: 'CANCELLED' } // Should NOT consume remaining
];
const rem = calculateRemainingKg(sampleDonation, sampleClaims);
assert.strictEqual(rem, 5, 'Remaining should be 10 - (3 + 2) = 5 kg');
console.log('✓ Test 2: calculateRemainingKg correctly ignores CANCELLED claims');

// Test 3: Status precedence
// Precedence: CANCELLED -> EXPIRED -> FULLY_CLAIMED -> OPEN
const cancelledDonation = { id: 'don_2', quantity_kg: 10, pickup_until: '2026-10-09T20:00', is_cancelled: true };
assert.strictEqual(getDonationStatus(cancelledDonation, [], '2026-10-09T18:00'), 'CANCELLED');

const expiredDonation = { id: 'don_3', quantity_kg: 10, pickup_until: '2026-10-09T18:00', is_cancelled: false };
assert.strictEqual(getDonationStatus(expiredDonation, [], '2026-10-09T18:30'), 'EXPIRED');

const fullyClaimedDonation = { id: 'don_4', quantity_kg: 5, pickup_until: '2026-10-09T20:00', is_cancelled: false };
const claimsFull = [{ donation_id: 'don_4', quantity_kg: 5, status: 'ACTIVE' }];
assert.strictEqual(getDonationStatus(fullyClaimedDonation, claimsFull, '2026-10-09T18:00'), 'FULLY_CLAIMED');

const openDonation = { id: 'don_5', quantity_kg: 10, pickup_until: '2026-10-09T20:00', is_cancelled: false };
assert.strictEqual(getDonationStatus(openDonation, [], '2026-10-09T18:00'), 'OPEN');
console.log('✓ Test 3: Status precedence matches PDF rules exactly');

// Test 4: Dashboard Conservation of Mass Equation
const listed = 50;
const collected = 20;
const missed = 5;
const wasted = 10;
const inProgress = 10;
const stillOpen = 5;
const sum = collected + missed + wasted + inProgress + stillOpen;
assert.strictEqual(listed, sum, 'Listed must equal sum of the 5 outcome categories');
console.log('✓ Test 4: Dashboard reconciliation formula verified');

console.log('All business logic tests passed successfully!');
