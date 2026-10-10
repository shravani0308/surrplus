import { Router } from 'express';
import { getVolunteers } from '../controllers/volunteerController.js';

const router = Router();

router.get('/', getVolunteers);

export default router;

