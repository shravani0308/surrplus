import { Router } from 'express';
import clockRoutes from './clockRoutes.js';
import donorRoutes from './donorRoutes.js';
import volunteerRoutes from './volunteerRoutes.js';
import donationRoutes from './donationRoutes.js';
import claimRoutes from './claimRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';

const apiRouter = Router();

apiRouter.use('/clock', clockRoutes);
apiRouter.use('/donors', donorRoutes);
apiRouter.use('/volunteers', volunteerRoutes);
apiRouter.use('/donations', donationRoutes);
apiRouter.use('/claims', claimRoutes);
apiRouter.use('/', dashboardRoutes);

export default apiRouter;

