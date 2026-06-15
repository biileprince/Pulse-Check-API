import { alertService } from './alert.service';

/**
 * Timer service.
 * Manages countdown timers for each monitor using setTimeout.
 * When a timer expires, it delegates to the alert service.
 */
const timers = new Map<string, ReturnType<typeof setTimeout>>();

export const timerService = {
  /**
   * Start a countdown timer for a monitor.
   * If a timer already exists for this ID, it is cleared first.
   */
  start(monitorId: string, timeoutSeconds: number): void {
    // Clear any existing timer
    this.clear(monitorId);

    const timer = setTimeout(() => {
      timers.delete(monitorId);
      alertService.fireAlert(monitorId);
    }, timeoutSeconds * 1000);

    // Prevent the timer from keeping the Node.js process alive during shutdown
    if (timer.unref) {
      timer.unref();
    }

    timers.set(monitorId, timer);
  },

  /** Clear an active timer for a monitor. */
  clear(monitorId: string): void {
    const timer = timers.get(monitorId);
    if (timer) {
      clearTimeout(timer);
      timers.delete(monitorId);
    }
  },

  /** Check if a timer is currently running for a monitor. */
  isRunning(monitorId: string): boolean {
    return timers.has(monitorId);
  },

  /** Clear all timers. Used in tests. */
  clearAll(): void {
    for (const timer of timers.values()) {
      clearTimeout(timer);
    }
    timers.clear();
  },
};
