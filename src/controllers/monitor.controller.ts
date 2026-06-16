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
    /*
      #swagger.tags = ['Monitors']
      #swagger.summary = 'Register a new monitor'
      #swagger.parameters['body'] = {
        in: 'body',
        description: 'Monitor configuration',
        required: true,
        schema: {
          id: 'device-123',
          timeout: 60,
          alert_email: 'admin@critmon.com'
        }
      }
      #swagger.responses[201] = {
        description: 'Monitor created successfully',
        schema: {
          success: true,
          message: "Monitor 'device-123' created. Timer set for 60s.",
          data: {
            id: 'device-123',
            timeout: 60,
            alertEmail: 'admin@critmon.com',
            status: 'active',
            createdAt: '2026-06-16T12:00:00.000Z',
            lastHeartbeat: null,
            updatedAt: '2026-06-16T12:00:00.000Z'
          }
        }
      }
    */
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
    /*
      #swagger.tags = ['Monitors']
      #swagger.summary = 'List all monitors'
      #swagger.responses[200] = {
        description: 'List of all registered monitors',
        schema: {
          success: true,
          count: 1,
          data: [{
            id: 'device-123',
            timeout: 60,
            alertEmail: 'admin@critmon.com',
            status: 'active',
            createdAt: '2026-06-16T12:00:00.000Z',
            lastHeartbeat: null,
            updatedAt: '2026-06-16T12:00:00.000Z'
          }]
        }
      }
    */
    const monitors = monitorService.getAll();
    res.json({
      success: true,
      data: monitors,
      count: monitors.length,
    });
  },

  /** GET /monitors/:id */
  getById(req: Request<{ id: string }>, res: Response, next: NextFunction): void {
    /*
      #swagger.tags = ['Monitors']
      #swagger.summary = 'Get a specific monitor'
      #swagger.responses[200] = {
        description: 'Monitor details',
        schema: {
          success: true,
          data: {
            id: 'device-123',
            timeout: 60,
            alertEmail: 'admin@critmon.com',
            status: 'active',
            createdAt: '2026-06-16T12:00:00.000Z',
            lastHeartbeat: null,
            updatedAt: '2026-06-16T12:00:00.000Z'
          }
        }
      }
    */
    try {
      const monitor = monitorService.getById(req.params.id);
      res.json({ success: true, data: monitor });
    } catch (err) {
      next(err);
    }
  },

  /** POST /monitors/:id/heartbeat */
  heartbeat(req: Request<{ id: string }>, res: Response, next: NextFunction): void {
    /*
      #swagger.tags = ['Monitors']
      #swagger.summary = 'Send a heartbeat to reset the timer'
      #swagger.responses[200] = {
        description: 'Timer reset successfully',
        schema: {
          success: true,
          message: "Heartbeat received. Timer reset to 60s.",
          data: {
            id: 'device-123',
            status: 'active',
            lastHeartbeat: '2026-06-16T12:01:00.000Z'
          }
        }
      }
    */
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
    /*
      #swagger.tags = ['Monitors']
      #swagger.summary = 'Pause a monitor (Snooze)'
      #swagger.responses[200] = {
        description: 'Monitor paused successfully',
        schema: {
          success: true,
          message: "Monitor 'device-123' paused. No alerts will fire.",
          data: {
            id: 'device-123',
            status: 'paused'
          }
        }
      }
    */
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
    /*
      #swagger.tags = ['Monitors']
      #swagger.summary = 'Delete a monitor'
      #swagger.responses[200] = {
        description: 'Monitor deleted successfully',
        schema: {
          success: true,
          message: "Monitor 'device-123' deleted."
        }
      }
    */
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
    /*
      #swagger.tags = ['Monitors']
      #swagger.summary = 'Get alert history for a device'
      #swagger.responses[200] = {
        description: 'Alert history',
        schema: {
          success: true,
          count: 1,
          data: [{
            monitorId: 'device-123',
            alertedAt: '2026-06-16T12:01:00.000Z',
            message: 'Device device-123 is down!'
          }]
        }
      }
    */
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
