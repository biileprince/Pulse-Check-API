import { alertStore } from '../store/alertStore';
import { monitorStore } from '../store/monitorStore';

/**
 * Alert service.
 * Fires alerts when a monitor's timer expires and logs the event.
 */
export const alertService = {
  fireAlert(monitorId: string): void {
    const monitor = monitorStore.get(monitorId);
    if (!monitor) return;

    const now = new Date();
    const alertMessage = `Device ${monitorId} is down!`;

    // Console log the alert as required by the spec
    console.log(
      JSON.stringify({
        ALERT: alertMessage,
        time: now.toISOString(),
      })
    );

    // Update monitor status
    monitor.status = 'down';
    monitor.updatedAt = now;
    monitorStore.set(monitorId, monitor);

    // Store in alert history (Developer's Choice feature)
    alertStore.add({
      monitorId,
      alertedAt: now,
      message: alertMessage,
    });
  },
};
