import { getClock as fetchClock, setClock as updateClockService } from '../services/rescueService.js';

export async function getClock(req, res) {
  try {
    const clock = await fetchClock();
    res.json({ clock });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateClock(req, res) {
  try {
    const { clock } = req.body;
    if (!clock) {
      return res.status(400).json({ error: 'clock is required (YYYY-MM-DDTHH:MM)' });
    }
    const updatedClock = await updateClockService(clock);
    res.json({ clock: updatedClock, message: 'Clock updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

