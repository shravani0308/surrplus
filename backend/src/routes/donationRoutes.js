import { Router } from 'express';
import { getDonations, createDonation, cancelDonation } from '../controllers/donationController.js';

const router = Router();

router.get('/', getDonations);
router.post('/', createDonation);
router.post('/:id/cancel', cancelDonation);

export default router;

