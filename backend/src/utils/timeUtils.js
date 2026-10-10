// Helper functions for date/time and business calculations

/**
 * Returns difference in minutes between two YYYY-MM-DDTHH:MM strings
 */
export function getMinutesDifference(time1, time2) {
  const d1 = new Date(time1);
  const d2 = new Date(time2);
  return Math.abs((d1.getTime() - d2.getTime()) / (1000 * 60));
}

/**
 * Calculate remaining kg for a donation given its claims
 * Remaining kg = quantity minus the kg of all claims that are not CANCELLED
 */
export function calculateRemainingKg(donation, claims) {
  const donationClaims = claims.filter(c => c.donation_id === donation.id && c.status !== 'CANCELLED');
  const claimedKg = donationClaims.reduce((sum, c) => sum + c.quantity_kg, 0);
  return Math.max(0, donation.quantity_kg - claimedKg);
}

/**
 * Calculate donation status according to PDF rules:
 * Status is the first that applies:
 * 1. CANCELLED (donor cancelled it)
 * 2. EXPIRED (now is after pickup_until)
 * 3. FULLY_CLAIMED (remaining is 0)
 * 4. OPEN
 */
export function getDonationStatus(donation, claims, now) {
  if (donation.is_cancelled) {
    return 'CANCELLED';
  }
  if (now > donation.pickup_until) {
    return 'EXPIRED';
  }
  const remaining = calculateRemainingKg(donation, claims);
  if (remaining === 0) {
    return 'FULLY_CLAIMED';
  }
  return 'OPEN';
}

