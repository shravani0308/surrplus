import { Router } from 'express';
import { getDonors } from '../controllers/donorController.js';

const router = Router();

router.get('/', getDonors);

export default router;

