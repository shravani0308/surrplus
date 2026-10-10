import { Router } from 'express';
import { getClaims, createClaim, collectClaim, cancelClaim } from '../controllers/claimController.js';

const router = Router();

router.get('/', getClaims);
router.post('/', createClaim);
router.post('/:id/collect', collectClaim);
router.post('/:id/cancel', cancelClaim);

export default router;

