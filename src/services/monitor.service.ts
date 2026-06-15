import { Monitor, CreateMonitorInput } from '../types';
import { monitorStore } from '../store/monitorStore';
import { timerService } from './timer.service';
import AppError from '../utils/AppError';

/**
 * Monitor service.
 * Core business logic for creating, heartbeating, pausing, and deleting monitors.
 */
export const monitorService = {
  /** Create a new monitor and start its countdown timer. */
  create(input: CreateMonitorInput): Monitor {
    if (monitorStore.has(input.id)) {
      throw new AppError(`Monitor '${input.id}' already exists`, 409);
    }

    const now = new Date();
    const monitor: Monitor = {
      id: input.id,
      timeout: input.timeout,
      alertEmail: input.alert_email,
      status: 'active',
      createdAt: now,
      lastHeartbeat: null,
      updatedAt: now,
    };

    monitorStore.set(monitor.id, monitor);
    timerService.start(monitor.id, monitor.timeout);

    return monitor;
  },

  /** Get a single monitor by ID. */
  getById(id: string): Monitor {
    const monitor = monitorStore.get(id);
    if (!monitor) {
      throw new AppError(`Monitor '${id}' not found`, 404);
    }
    return monitor;
  },

  /** Get all monitors. */
  getAll(): Monitor[] {
    return monitorStore.getAll();
  },

  /**
   * Process a heartbeat for a monitor.
   * Resets the countdown timer. If the monitor is paused or down, it
   * transitions back to active.
   */
  heartbeat(id: string): Monitor {
    const monitor = monitorStore.get(id);
    if (!monitor) {
      throw new AppError(`Monitor '${id}' not found`, 404);
    }

    const now = new Date();

    // Resume from paused or down state
    monitor.status = 'active';
    monitor.lastHeartbeat = now;
    monitor.updatedAt = now;

    monitorStore.set(id, monitor);
    timerService.start(id, monitor.timeout);

    return monitor;
  },

  /** Pause a monitor — clears its timer so no alert will fire. */
  pause(id: string): Monitor {
    const monitor = monitorStore.get(id);
    if (!monitor) {
      throw new AppError(`Monitor '${id}' not found`, 404);
    }

    if (monitor.status === 'paused') {
      throw new AppError(`Monitor '${id}' is already paused`, 400);
    }

    if (monitor.status === 'down') {
      throw new AppError(
        `Monitor '${id}' is down. Send a heartbeat to recover first.`,
        400
      );
    }

    monitor.status = 'paused';
    monitor.updatedAt = new Date();

    monitorStore.set(id, monitor);
    timerService.clear(id);

    return monitor;
  },

  /** Delete a monitor and clear its timer. */
  delete(id: string): void {
    const monitor = monitorStore.get(id);
    if (!monitor) {
      throw new AppError(`Monitor '${id}' not found`, 404);
    }

    timerService.clear(id);
    monitorStore.delete(id);
  },
};
