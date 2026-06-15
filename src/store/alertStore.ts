import { AlertRecord } from '../types';

/**
 * In-memory store for alert history.
 * Keyed by monitor ID for efficient per-device lookups.
 */
const alerts = new Map<string, AlertRecord[]>();

export const alertStore = {
  add(record: AlertRecord): void {
    const existing = alerts.get(record.monitorId) || [];
    existing.push(record);
    alerts.set(record.monitorId, existing);
  },

  getByMonitorId(monitorId: string): AlertRecord[] {
    return alerts.get(monitorId) || [];
  },

  getAll(): AlertRecord[] {
    const all: AlertRecord[] = [];
    for (const records of alerts.values()) {
      all.push(...records);
    }
    return all;
  },

  clear(): void {
    alerts.clear();
  },
};
