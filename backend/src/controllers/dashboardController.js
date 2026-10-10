import { getDashboardStats, getRescueNowQueue } from '../services/rescueService.js';
import { resetToSeed } from '../services/seedService.js';

export async function getDashboard(req, res) {
  try {
    const stats = await getDashboardStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getRescueNow(req, res) {
  try {
    const queue = await getRescueNowQueue(req.query.volunteer_id);
    res.json(queue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function resetDatabase(req, res) {
  try {
    await resetToSeed();
    res.json({ message: 'Database reset to seed data successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

