import { Router } from 'express';
import { getDashboard, getRescueNow, resetDatabase } from '../controllers/dashboardController.js';

const router = Router();

router.get('/dashboard', getDashboard);
router.get('/rescue-now', getRescueNow);
router.post('/seed/reset', resetDatabase);

export default router;

