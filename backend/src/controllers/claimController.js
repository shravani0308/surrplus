import { Claim } from '../models/index.js';
import {
  createClaim as createClaimService,
  collectClaim as collectClaimService,
  cancelClaim as cancelClaimService
} from '../services/rescueService.js';

export async function getClaims(req, res) {
  try {
    const { volunteer_id, donation_id } = req.query;
    const filter = {};
    if (volunteer_id) filter.volunteer_id = volunteer_id;
    if (donation_id) filter.donation_id = donation_id;

    const claims = await Claim.find(filter).sort({ createdAt: -1 });
    res.json(claims);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function createClaim(req, res) {
  try {
    const { donation_id, volunteer_id, quantity_kg, planned_pickup_time } = req.body;
    const result = await createClaimService({
      donation_id,
      volunteer_id,
      quantity_kg,
      planned_pickup_time
    });

    if (!result.success) {
      return res.status(400).json({
        message: 'Claim validation failed',
        errors: result.errors
      });
    }

    res.status(201).json(result.claim);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function collectClaim(req, res) {
  try {
    const { volunteer_id } = req.body;
    if (!volunteer_id) {
      return res.status(400).json({ error: 'volunteer_id is required' });
    }
    const collected = await collectClaimService(req.params.id, volunteer_id);
    res.json({ message: 'Claim marked as COLLECTED', claim: collected });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function cancelClaim(req, res) {
  try {
    const { volunteer_id } = req.body;
    if (!volunteer_id) {
      return res.status(400).json({ error: 'volunteer_id is required' });
    }
    const cancelled = await cancelClaimService(req.params.id, volunteer_id);
    res.json({ message: 'Claim cancelled successfully', claim: cancelled });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

