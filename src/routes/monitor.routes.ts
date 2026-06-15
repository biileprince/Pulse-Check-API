import { Router } from 'express';
import { monitorController } from '../controllers/monitor.controller';
import { createMonitorRules } from '../validators/monitor.validator';
import { validate } from '../middleware/validate';

const router: Router = Router();

// Register a new monitor
router.post('/', createMonitorRules, validate, monitorController.create);

// List all monitors
router.get('/', monitorController.getAll);

// Get a single monitor
router.get('/:id', monitorController.getById);

// Send a heartbeat
router.post('/:id/heartbeat', monitorController.heartbeat);

// Pause a monitor
router.post('/:id/pause', monitorController.pause);

// Delete a monitor
router.delete('/:id', monitorController.delete);

// Get alert history for a monitor
router.get('/:id/alerts', monitorController.getAlerts);

export default router;
