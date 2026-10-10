import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Donor, Volunteer, Donation, Claim, AppState } from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function checkAndSeedDatabase() {
  try {
    const existingState = await AppState.findOne({ key: 'main' });
    const donorCount = await Donor.countDocuments();

    // Load only when app has no saved state
    if (existingState && donorCount > 0) {
      console.log('App state already exists in database. Skipping seed.');
      return;
    }

    console.log('No saved state found. Initializing seed data from seed.json...');
    await resetToSeed();
  } catch (error) {
    console.error('Error during database check/seed:', error);
  }
}

export async function resetToSeed() {
  const seedPath = path.resolve(__dirname, '../../seed.json');
  if (!fs.existsSync(seedPath)) {
    console.error('seed.json not found at:', seedPath);
    return;
  }

  const raw = fs.readFileSync(seedPath, 'utf-8');
  const seedData = JSON.parse(raw);

  // Clear existing collections
  await Donor.deleteMany({});
  await Volunteer.deleteMany({});
  await Donation.deleteMany({});
  await Claim.deleteMany({});
  await AppState.deleteMany({});

  // Insert Donors
  if (seedData.donors && seedData.donors.length > 0) {
    await Donor.insertMany(seedData.donors);
  }

  // Insert Volunteers
  if (seedData.volunteers && seedData.volunteers.length > 0) {
    await Volunteer.insertMany(seedData.volunteers);
  }

  // Insert Donations
  if (seedData.donations && seedData.donations.length > 0) {
    const donationsToInsert = seedData.donations.map(d => ({
      ...d,
      is_cancelled: false
    }));
    await Donation.insertMany(donationsToInsert);
  }

  // Set AppState Clock
  const startingClock = seedData.clock || '2026-10-09T18:00';
  await AppState.create({
    key: 'main',
    clock: startingClock,
    is_seeded: true
  });

  console.log(`Database seeded successfully! Clock set to ${startingClock}`);
}

