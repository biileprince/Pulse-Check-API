import { Request, Response, NextFunction } from 'express';
import { monitorService } from '../services/monitor.service';
import { alertStore } from '../store/alertStore';

/**
 * Monitor controller.
 * Handles HTTP request/response for monitor operations.
 */
export const monitorController = {
  /** POST /monitors */
  create(req: Request, res: Response, next: NextFunction): void {
    try {
      const monitor = monitorService.create(req.body);
      res.status(201).json({
        success: true,
        message: `Monitor '${monitor.id}' created. Timer set for ${monitor.timeout}s.`,
        data: monitor,
      });
    } catch (err) {
      next(err);
    }
  },

  /** GET /monitors */
  getAll(_req: Request, res: Response): void {
    const monitors = monitorService.getAll();
    res.json({
      success: true,
      data: monitors,
      count: monitors.length,
    });
  },

  /** GET /monitors/:id */
  getById(req: Request<{ id: string }>, res: Response, next: NextFunction): void {
    try {
      const monitor = monitorService.getById(req.params.id);
      res.json({ success: true, data: monitor });
    } catch (err) {
      next(err);
    }
  },

  /** POST /monitors/:id/heartbeat */
  heartbeat(req: Request<{ id: string }>, res: Response, next: NextFunction): void {
    try {
      const monitor = monitorService.heartbeat(req.params.id);
      res.json({
        success: true,
        message: `Heartbeat received. Timer reset to ${monitor.timeout}s.`,
        data: monitor,
      });
    } catch (err) {
      next(err);
    }
  },

  /** POST /monitors/:id/pause */
  pause(req: Request<{ id: string }>, res: Response, next: NextFunction): void {
    try {
      const monitor = monitorService.pause(req.params.id);
      res.json({
        success: true,
        message: `Monitor '${monitor.id}' paused. No alerts will fire.`,
        data: monitor,
      });
    } catch (err) {
      next(err);
    }
  },

  /** DELETE /monitors/:id */
  delete(req: Request<{ id: string }>, res: Response, next: NextFunction): void {
    try {
      monitorService.delete(req.params.id);
      res.json({
        success: true,
        message: `Monitor '${req.params.id}' deleted.`,
      });
    } catch (err) {
      next(err);
    }
  },

  /** GET /monitors/:id/alerts */
  getAlerts(req: Request<{ id: string }>, res: Response, next: NextFunction): void {
    try {
      // Verify monitor exists
      monitorService.getById(req.params.id);

      const alerts = alertStore.getByMonitorId(req.params.id);
      res.json({
        success: true,
        data: alerts,
        count: alerts.length,
      });
    } catch (err) {
      next(err);
    }
  },
};
