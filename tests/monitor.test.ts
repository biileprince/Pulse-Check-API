import request from 'supertest';
import app from '../src/app';
import { monitorStore } from '../src/store/monitorStore';
import { alertStore } from '../src/store/alertStore';
import { timerService } from '../src/services/timer.service';

// Clean up between tests
afterEach(() => {
  timerService.clearAll();
  monitorStore.clear();
  alertStore.clear();
});

describe('GET /health', () => {
  it('should return health status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('uptime');
  });
});

describe('POST /monitors', () => {
  it('should create a monitor and return 201', async () => {
    const res = await request(app)
      .post('/monitors')
      .send({ id: 'device-123', timeout: 60, alert_email: 'admin@critmon.com' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('device-123');
    expect(res.body.data.timeout).toBe(60);
    expect(res.body.data.alertEmail).toBe('admin@critmon.com');
    expect(res.body.data.status).toBe('active');
  });

  it('should return 409 for duplicate monitor ID', async () => {
    await request(app)
      .post('/monitors')
      .send({ id: 'device-123', timeout: 60, alert_email: 'admin@critmon.com' });

    const res = await request(app)
      .post('/monitors')
      .send({ id: 'device-123', timeout: 30, alert_email: 'other@critmon.com' });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for missing fields', async () => {
    const res = await request(app).post('/monitors').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.details).toBeDefined();
  });

  it('should return 400 for invalid email', async () => {
    const res = await request(app)
      .post('/monitors')
      .send({ id: 'device-456', timeout: 60, alert_email: 'not-an-email' });

    expect(res.status).toBe(400);
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'alert_email' }),
      ])
    );
  });

  it('should return 400 for non-positive timeout', async () => {
    const res = await request(app)
      .post('/monitors')
      .send({ id: 'device-789', timeout: 0, alert_email: 'admin@critmon.com' });

    expect(res.status).toBe(400);
  });
});

describe('GET /monitors', () => {
  it('should return an empty list when no monitors exist', async () => {
    const res = await request(app).get('/monitors');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.count).toBe(0);
  });

  it('should return all registered monitors', async () => {
    await request(app)
      .post('/monitors')
      .send({ id: 'device-1', timeout: 30, alert_email: 'a@test.com' });
    await request(app)
      .post('/monitors')
      .send({ id: 'device-2', timeout: 60, alert_email: 'b@test.com' });

    const res = await request(app).get('/monitors');
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);
  });
});

describe('GET /monitors/:id', () => {
  it('should return a single monitor', async () => {
    await request(app)
      .post('/monitors')
      .send({ id: 'device-123', timeout: 60, alert_email: 'admin@critmon.com' });

    const res = await request(app).get('/monitors/device-123');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('device-123');
  });

  it('should return 404 for unknown monitor', async () => {
    const res = await request(app).get('/monitors/unknown');
    expect(res.status).toBe(404);
  });
});

describe('POST /monitors/:id/heartbeat', () => {
  it('should reset the timer and return 200', async () => {
    await request(app)
      .post('/monitors')
      .send({ id: 'device-123', timeout: 60, alert_email: 'admin@critmon.com' });

    const res = await request(app).post('/monitors/device-123/heartbeat');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.lastHeartbeat).toBeDefined();
    expect(res.body.data.status).toBe('active');
  });

  it('should return 404 for unknown monitor', async () => {
    const res = await request(app).post('/monitors/unknown/heartbeat');
    expect(res.status).toBe(404);
  });

  it('should resume a paused monitor', async () => {
    await request(app)
      .post('/monitors')
      .send({ id: 'device-123', timeout: 60, alert_email: 'admin@critmon.com' });

    await request(app).post('/monitors/device-123/pause');

    const res = await request(app).post('/monitors/device-123/heartbeat');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('active');
  });
});

describe('POST /monitors/:id/pause', () => {
  it('should pause an active monitor', async () => {
    await request(app)
      .post('/monitors')
      .send({ id: 'device-123', timeout: 60, alert_email: 'admin@critmon.com' });

    const res = await request(app).post('/monitors/device-123/pause');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('paused');
  });

  it('should return 404 for unknown monitor', async () => {
    const res = await request(app).post('/monitors/unknown/pause');
    expect(res.status).toBe(404);
  });

  it('should return 400 if already paused', async () => {
    await request(app)
      .post('/monitors')
      .send({ id: 'device-123', timeout: 60, alert_email: 'admin@critmon.com' });

    await request(app).post('/monitors/device-123/pause');

    const res = await request(app).post('/monitors/device-123/pause');
    expect(res.status).toBe(400);
  });
});

describe('DELETE /monitors/:id', () => {
  it('should delete a monitor', async () => {
    await request(app)
      .post('/monitors')
      .send({ id: 'device-123', timeout: 60, alert_email: 'admin@critmon.com' });

    const res = await request(app).delete('/monitors/device-123');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify it's gone
    const getRes = await request(app).get('/monitors/device-123');
    expect(getRes.status).toBe(404);
  });

  it('should return 404 for unknown monitor', async () => {
    const res = await request(app).delete('/monitors/unknown');
    expect(res.status).toBe(404);
  });
});

describe('Alert trigger (timer expiry)', () => {
  it('should fire an alert when the timer expires', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    await request(app)
      .post('/monitors')
      .send({ id: 'device-alert', timeout: 1, alert_email: 'alert@critmon.com' });

    // Wait for the 1-second timer to expire
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Check the monitor is now down
    const res = await request(app).get('/monitors/device-alert');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('down');

    // Check alert was logged
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Device device-alert is down!')
    );

    consoleSpy.mockRestore();
  });
});

describe('GET /monitors/:id/alerts', () => {
  it('should return alert history for a monitor', async () => {
    await request(app)
      .post('/monitors')
      .send({ id: 'device-hist', timeout: 1, alert_email: 'hist@critmon.com' });

    // Wait for alert to fire
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const res = await request(app).get('/monitors/device-hist/alerts');
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.data[0].monitorId).toBe('device-hist');
  });

  it('should return 404 for unknown monitor', async () => {
    const res = await request(app).get('/monitors/unknown/alerts');
    expect(res.status).toBe(404);
  });
});

describe('GET /stats', () => {
  it('should return system stats', async () => {
    await request(app)
      .post('/monitors')
      .send({ id: 'device-a', timeout: 300, alert_email: 'a@test.com' });
    await request(app)
      .post('/monitors')
      .send({ id: 'device-b', timeout: 300, alert_email: 'b@test.com' });
    await request(app).post('/monitors/device-b/pause');

    const res = await request(app).get('/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.monitors.total).toBe(2);
    expect(res.body.data.monitors.active).toBe(1);
    expect(res.body.data.monitors.paused).toBe(1);
    expect(res.body.data.monitors.down).toBe(0);
  });
});
