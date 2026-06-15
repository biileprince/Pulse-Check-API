import { Monitor } from '../types';

/**
 * In-memory store for monitors.
 * Uses a Map for O(1) lookups by device ID.
 */
const monitors = new Map<string, Monitor>();

export const monitorStore = {
  get(id: string): Monitor | undefined {
    return monitors.get(id);
  },

  set(id: string, monitor: Monitor): void {
    monitors.set(id, monitor);
  },

  has(id: string): boolean {
    return monitors.has(id);
  },

  delete(id: string): boolean {
    return monitors.delete(id);
  },

  getAll(): Monitor[] {
    return Array.from(monitors.values());
  },

  clear(): void {
    monitors.clear();
  },
};
