import { Volunteer } from '../models/index.js';

export async function getVolunteers(req, res) {
  try {
    const volunteers = await Volunteer.find().sort({ name: 1 });
    res.json(volunteers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

