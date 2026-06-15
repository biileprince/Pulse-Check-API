import { Request, Response } from 'express';
import { monitorStore } from '../store/monitorStore';
import { alertStore } from '../store/alertStore';

/**
 * Stats controller.
 * Returns system-wide health summary (Developer's Choice feature).
 */
export const statsController = {
  /** GET /stats */
  getStats(_req: Request, res: Response): void {
    const monitors = monitorStore.getAll();
    const alerts = alertStore.getAll();

    const stats = {
      monitors: {
        total: monitors.length,
        active: monitors.filter((m) => m.status === 'active').length,
        down: monitors.filter((m) => m.status === 'down').length,
        paused: monitors.filter((m) => m.status === 'paused').length,
      },
      alerts: {
        total: alerts.length,
      },
    };

    res.json({ success: true, data: stats });
  },
};
