import {
  getAllDonations,
  createDonation as createDonationService,
  cancelDonation as cancelDonationService
} from '../services/rescueService.js';

export async function getDonations(req, res) {
  try {
    const donations = await getAllDonations();
    res.json(donations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function createDonation(req, res) {
  try {
    const { donor_id, description, quantity_kg, pickup_from, pickup_until } = req.body;
    if (!donor_id || !description || quantity_kg === undefined || !pickup_from || !pickup_until) {
      return res.status(400).json({ error: 'Missing required donation fields' });
    }
    const newDonation = await createDonationService({
      donor_id,
      description,
      quantity_kg,
      pickup_from,
      pickup_until
    });
    res.status(201).json(newDonation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function cancelDonation(req, res) {
  try {
    const { donor_id } = req.body;
    if (!donor_id) {
      return res.status(400).json({ error: 'donor_id is required' });
    }
    const cancelled = await cancelDonationService(req.params.id, donor_id);
    res.json({ message: 'Donation cancelled successfully', donation: cancelled });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

