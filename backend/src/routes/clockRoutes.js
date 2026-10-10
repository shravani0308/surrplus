import { Router } from 'express';
import { getClock, updateClock } from '../controllers/clockController.js';

const router = Router();

router.get('/', getClock);
router.post('/', updateClock);

export default router;

