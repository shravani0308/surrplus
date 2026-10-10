import { Donor, Volunteer, Donation, Claim, AppState } from '../models/index.js';
import { getMinutesDifference, calculateRemainingKg, getDonationStatus } from '../utils/timeUtils.js';

// Get current simulated clock
export async function getClock() {
  const state = await AppState.findOne({ key: 'main' });
  if (!state) {
    return '2026-10-09T18:00';
  }
  return state.clock;
}

// Move simulated clock forward
export async function setClock(newClockTime) {
  let state = await AppState.findOne({ key: 'main' });
  if (!state) {
    state = await AppState.create({ key: 'main', clock: '2026-10-09T18:00', is_seeded: true });
  }

  // Never move backwards (setting same time is allowed)
  if (newClockTime < state.clock) {
    throw new Error(`Clock cannot move backwards. Current clock is ${state.clock}`);
  }

  state.clock = newClockTime;
  await state.save();

  // Trigger missed claim transitions:
  // When the clock moves past a donation's pickup_until, its ACTIVE claims become MISSED
  await updateMissedClaims(newClockTime);

  return state.clock;
}

// Update ACTIVE claims to MISSED when clock > donation.pickup_until
export async function updateMissedClaims(now) {
  const expiredDonations = await Donation.find({ pickup_until: { $lt: now } });
  const expiredDonationIds = expiredDonations.map(d => d.id);

  if (expiredDonationIds.length > 0) {
    await Claim.updateMany(
      {
        donation_id: { $in: expiredDonationIds },
        status: 'ACTIVE'
      },
      {
        $set: { status: 'MISSED' }
      }
    );
  }
}

// Get all donations with calculated fields
export async function getAllDonations() {
  const now = await getClock();
  await updateMissedClaims(now);

  const [donations, donors, claims] = await Promise.all([
    Donation.find().sort({ createdAt: -1 }),
    Donor.find(),
    Claim.find()
  ]);

  const donorMap = new Map();
  donors.forEach(d => donorMap.set(d.id, d));

  return donations.map(donation => {
    const donor = donorMap.get(donation.donor_id) || { name: 'Unknown', zone: 'Unknown' };
    const donationClaims = claims.filter(c => c.donation_id === donation.id);

    const remaining_kg = calculateRemainingKg(donation, claims);
    const status = getDonationStatus(donation, claims, now);

    const collected_kg = donationClaims
      .filter(c => c.status === 'COLLECTED')
      .reduce((sum, c) => sum + c.quantity_kg, 0);

    const reserved_kg = donationClaims
      .filter(c => c.status === 'ACTIVE')
      .reduce((sum, c) => sum + c.quantity_kg, 0);

    const missed_kg = donationClaims
      .filter(c => c.status === 'MISSED')
      .reduce((sum, c) => sum + c.quantity_kg, 0);

    // Collected progress = collected kilograms / original donation kilograms * 100
    const rescue_progress = donation.quantity_kg > 0
      ? Math.min(100, Math.round((collected_kg / donation.quantity_kg) * 100))
      : 0;

    // A donor can cancel a donation only while it is OPEN and has no ACTIVE or COLLECTED claims
    const hasActiveOrCollected = donationClaims.some(c => c.status === 'ACTIVE' || c.status === 'COLLECTED');
    const can_cancel = status === 'OPEN' && !hasActiveOrCollected;

    return {
      id: donation.id,
      donor_id: donation.donor_id,
      donor_name: donor.name,
      zone: donor.zone,
      description: donation.description,
      quantity_kg: donation.quantity_kg,
      pickup_from: donation.pickup_from,
      pickup_until: donation.pickup_until,
      is_cancelled: donation.is_cancelled,
      status,
      remaining_kg,
      collected_kg,
      reserved_kg,
      missed_kg,
      rescue_progress,
      can_cancel,
      claims: donationClaims
    };
  });
}

// Post a new donation
export async function createDonation({ donor_id, description, quantity_kg, pickup_from, pickup_until }) {
  const now = await getClock();

  const donor = await Donor.findOne({ id: donor_id });
  if (!donor) {
    throw new Error('Donor not found');
  }

  const qty = Number(quantity_kg);
  if (!Number.isInteger(qty) || qty < 1) {
    throw new Error('Quantity must be a whole number of at least 1 kg');
  }

  if (pickup_from >= pickup_until) {
    throw new Error('pickup_from must be strictly before pickup_until');
  }

  if (pickup_until < now) {
    throw new Error('pickup_until cannot be before the simulated current time');
  }

  const id = 'don_' + Date.now();
  const newDonation = await Donation.create({
    id,
    donor_id,
    description: description.trim(),
    quantity_kg: qty,
    pickup_from,
    pickup_until,
    is_cancelled: false
  });

  return newDonation;
}

// Cancel a donation
export async function cancelDonation(donationId, donorId) {
  const now = await getClock();
  const donation = await Donation.findOne({ id: donationId });
  if (!donation) {
    throw new Error('Donation not found');
  }

  if (donation.donor_id !== donorId) {
    throw new Error('You can only cancel your own donation');
  }

  const claims = await Claim.find({ donation_id: donationId });
  const status = getDonationStatus(donation, claims, now);

  const hasActiveOrCollected = claims.some(c => c.status === 'ACTIVE' || c.status === 'COLLECTED');

  if (status !== 'OPEN' || hasActiveOrCollected) {
    throw new Error('A donation can only be cancelled while it is OPEN and has no ACTIVE or COLLECTED claims');
  }

  donation.is_cancelled = true;
  await donation.save();
  return donation;
}

// Claim a donation with validation of all 7 rules
export async function createClaim({ donation_id, volunteer_id, quantity_kg, planned_pickup_time }) {
  const now = await getClock();
  await updateMissedClaims(now);

  const qty = Number(quantity_kg);
  if (!Number.isInteger(qty) || qty < 1) {
    return {
      success: false,
      errors: ['Claimed quantity must be a whole number of at least 1 kg']
    };
  }

  if (!planned_pickup_time || typeof planned_pickup_time !== 'string') {
    return {
      success: false,
      errors: ['Valid planned pickup time is required']
    };
  }

  const volunteer = await Volunteer.findOne({ id: volunteer_id });
  if (!volunteer) {
    return { success: false, errors: ['Volunteer not found'] };
  }

  const donation = await Donation.findOne({ id: donation_id });
  if (!donation) {
    return { success: false, errors: ['Donation not found'] };
  }

  const donor = await Donor.findOne({ id: donation.donor_id });
  const donationZone = donor ? donor.zone : null;

  const allClaims = await Claim.find();
  const donationStatus = getDonationStatus(donation, allClaims, now);
  const remainingKg = calculateRemainingKg(donation, allClaims);

  const errors = [];

  // Rule 1: The donation is not CANCELLED or EXPIRED
  if (donationStatus === 'CANCELLED' || donationStatus === 'EXPIRED') {
    errors.push('Rule 1: The donation is CANCELLED or EXPIRED.');
  }

  // Rule 2: kg is at most V's capacity
  if (qty > volunteer.capacity_kg) {
    errors.push(`Rule 2: Claimed kg (${qty} kg) exceeds volunteer capacity (${volunteer.capacity_kg} kg).`);
  }

  // Rule 3: kg is at most the donation's remaining kg
  if (qty > remainingKg) {
    errors.push(`Rule 3: Claimed kg (${qty} kg) exceeds remaining donation quantity (${remainingKg} kg).`);
  }

  // Rule 4: The donation's zone is one of V's zones
  if (!volunteer.zones || !volunteer.zones.includes(donationZone)) {
    errors.push(`Rule 4: Donation zone "${donationZone}" is not in volunteer's allowed zones (${(volunteer.zones || []).join(', ')}).`);
  }

  // Rule 5: T is between pickup_from and pickup_until, both inclusive
  if (planned_pickup_time < donation.pickup_from || planned_pickup_time > donation.pickup_until) {
    errors.push(`Rule 5: Planned pickup time (${planned_pickup_time}) is not within pickup window (${donation.pickup_from} to ${donation.pickup_until}).`);
  }

  // Rule 6: T is not before now
  if (planned_pickup_time < now) {
    errors.push(`Rule 6: Planned pickup time (${planned_pickup_time}) cannot be before current simulated time (${now}).`);
  }

  // Rule 7: T is at least 60 minutes from the planned time of every other ACTIVE or COLLECTED claim of V
  const volunteerClaims = allClaims.filter(c =>
    c.volunteer_id === volunteer_id &&
    (c.status === 'ACTIVE' || c.status === 'COLLECTED')
  );

  const conflictClaim = volunteerClaims.find(c => {
    const diff = getMinutesDifference(planned_pickup_time, c.planned_pickup_time);
    return diff < 60;
  });

  if (conflictClaim) {
    errors.push(`Rule 7: Planned pickup time must be at least 60 minutes apart from other active/collected claims (conflicts with claim planned at ${conflictClaim.planned_pickup_time}).`);
  }

  if (errors.length > 0) {
    return {
      success: false,
      errors
    };
  }

  // Concurrency check on DB level
  const currentDonationClaims = await Claim.find({ donation_id, status: { $ne: 'CANCELLED' } });
  const currentClaimedTotal = currentDonationClaims.reduce((acc, c) => acc + c.quantity_kg, 0);
  if (donation.quantity_kg - currentClaimedTotal < qty) {
    return {
      success: false,
      errors: ['Rule 3: Another volunteer just claimed available kilograms. Remaining quantity is insufficient.']
    };
  }

  const claimId = 'claim_' + Date.now();
  const newClaim = await Claim.create({
    id: claimId,
    donation_id,
    volunteer_id,
    quantity_kg: qty,
    planned_pickup_time,
    status: 'ACTIVE'
  });

  return {
    success: true,
    claim: newClaim
  };
}

// Mark an ACTIVE claim as COLLECTED
export async function collectClaim(claimId, volunteerId) {
  const now = await getClock();
  const claim = await Claim.findOne({ id: claimId });
  if (!claim) {
    throw new Error('Claim not found');
  }

  if (claim.volunteer_id !== volunteerId) {
    throw new Error('You can only collect your own claim');
  }

  if (claim.status !== 'ACTIVE') {
    throw new Error(`Cannot collect claim with status ${claim.status}`);
  }

  const donation = await Donation.findOne({ id: claim.donation_id });
  if (!donation) {
    throw new Error('Associated donation not found');
  }

  if (now < donation.pickup_from || now > donation.pickup_until) {
    throw new Error(`Collection is only allowed during pickup window (${donation.pickup_from} to ${donation.pickup_until}). Current time is ${now}`);
  }

  claim.status = 'COLLECTED';
  await claim.save();
  return claim;
}

// Cancel an ACTIVE claim
export async function cancelClaim(claimId, volunteerId) {
  const now = await getClock();
  const claim = await Claim.findOne({ id: claimId });
  if (!claim) {
    throw new Error('Claim not found');
  }

  if (claim.volunteer_id !== volunteerId) {
    throw new Error('You can only cancel your own claim');
  }

  if (claim.status !== 'ACTIVE') {
    throw new Error(`Cannot cancel claim with status ${claim.status}`);
  }

  if (now >= claim.planned_pickup_time) {
    throw new Error(`Cannot cancel claim. Current time (${now}) is not strictly before planned pickup time (${claim.planned_pickup_time})`);
  }

  claim.status = 'CANCELLED';
  await claim.save();
  return claim;
}

// Calculate dashboard figures and reconciliation
export async function getDashboardStats() {
  const now = await getClock();
  await updateMissedClaims(now);

  const [donations, donors, volunteers, claims] = await Promise.all([
    Donation.find(),
    Donor.find(),
    Volunteer.find(),
    Claim.find()
  ]);

  const nonCancelledDonations = donations.filter(d => !d.is_cancelled);

  let listed = 0;
  let collected = 0;
  let missed = 0;
  let wasted = 0;
  let inProgress = 0;
  let stillOpen = 0;

  nonCancelledDonations.forEach(donation => {
    listed += donation.quantity_kg;
    const rem = calculateRemainingKg(donation, claims);
    const isExpired = now > donation.pickup_until;

    if (isExpired) {
      wasted += rem;
    } else {
      stillOpen += rem;
    }
  });

  const validDonationIds = new Set(nonCancelledDonations.map(d => d.id));
  claims.filter(c => validDonationIds.has(c.donation_id)).forEach(claim => {
    if (claim.status === 'COLLECTED') {
      collected += claim.quantity_kg;
    } else if (claim.status === 'MISSED') {
      missed += claim.quantity_kg;
    } else if (claim.status === 'ACTIVE') {
      inProgress += claim.quantity_kg;
    }
  });

  const sumOfParts = collected + missed + wasted + inProgress + stillOpen;
  const isBalanced = listed === sumOfParts;

  const donorStats = donors.map(donor => {
    const donorDonations = nonCancelledDonations.filter(d => d.donor_id === donor.id);
    const donorDonationIds = new Set(donorDonations.map(d => d.id));
    const donorCollectedKg = claims
      .filter(c => donorDonationIds.has(c.donation_id) && c.status === 'COLLECTED')
      .reduce((sum, c) => sum + c.quantity_kg, 0);

    return {
      id: donor.id,
      name: donor.name,
      zone: donor.zone,
      collected_kg: donorCollectedKg
    };
  });

  const volunteerStats = volunteers.map(vol => {
    const volClaims = claims.filter(c => c.volunteer_id === vol.id);
    const volCollectedKg = volClaims
      .filter(c => c.status === 'COLLECTED')
      .reduce((sum, c) => sum + c.quantity_kg, 0);
    const volMissedCount = volClaims
      .filter(c => c.status === 'MISSED').length;

    return {
      id: vol.id,
      name: vol.name,
      capacity_kg: vol.capacity_kg,
      zones: vol.zones,
      collected_kg: volCollectedKg,
      missed_claims_count: volMissedCount
    };
  });

  return {
    listed,
    collected,
    missed,
    wasted,
    inProgress,
    stillOpen,
    sumOfParts,
    isBalanced,
    donorStats,
    volunteerStats,
    clock: now
  };
}

// Rescue Now Queue
export async function getRescueNowQueue(volunteerId) {
  const allDonations = await getAllDonations();

  const openDonations = allDonations.filter(d => d.status === 'OPEN' && d.remaining_kg > 0);

  openDonations.sort((a, b) => {
    if (a.pickup_until !== b.pickup_until) {
      return a.pickup_until.localeCompare(b.pickup_until);
    }
    if (a.pickup_from !== b.pickup_from) {
      return a.pickup_from.localeCompare(b.pickup_from);
    }
    return a.id.localeCompare(b.id);
  });

  return openDonations;
}

