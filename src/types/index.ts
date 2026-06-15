/**
 * Monitor type definitions.
 */

export type MonitorStatus = 'active' | 'down' | 'paused';

export interface Monitor {
  id: string;
  timeout: number;
  alertEmail: string;
  status: MonitorStatus;
  createdAt: Date;
  lastHeartbeat: Date | null;
  updatedAt: Date;
}

export interface CreateMonitorInput {
  id: string;
  timeout: number;
  alert_email: string;
}

export interface AlertRecord {
  monitorId: string;
  alertedAt: Date;
  message: string;
}
