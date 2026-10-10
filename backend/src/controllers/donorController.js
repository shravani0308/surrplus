import { Donor } from '../models/index.js';

export async function getDonors(req, res) {
  try {
    const donors = await Donor.find().sort({ name: 1 });
    res.json(donors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

