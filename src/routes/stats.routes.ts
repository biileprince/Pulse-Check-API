import { Router } from 'express';
import { statsController } from '../controllers/stats.controller';

const router: Router = Router();

// System-wide health summary
router.get('/', statsController.getStats);

export default router;
