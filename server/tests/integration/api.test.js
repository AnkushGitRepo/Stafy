import request from 'supertest';
import { describe, expect, it } from 'vitest';

import app from '../../src/app.js';

describe('Integration: API endpoint protection & health', () => {
  it('GET /api/health returns 200 and ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('GET /api/auth/me rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error?.code).toBe('UNAUTHENTICATED');
  });

  it('GET /api/dashboard rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(401);
    expect(res.body.error?.code).toBe('UNAUTHENTICATED');
  });

  it('GET /api/employees rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/employees');
    expect(res.status).toBe(401);
    expect(res.body.error?.code).toBe('UNAUTHENTICATED');
  });

  it('GET /api/leave-requests/balance rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/leave-requests/balance');
    expect(res.status).toBe(401);
    expect(res.body.error?.code).toBe('UNAUTHENTICATED');
  });

  it('GET /api/attendance/mine rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/attendance/mine');
    expect(res.status).toBe(401);
    expect(res.body.error?.code).toBe('UNAUTHENTICATED');
  });

  it('Non-existent API route returns 404 NOT_FOUND', async () => {
    const res = await request(app).get('/api/non-existent-route');
    expect(res.status).toBe(404);
    expect(res.body.error?.code).toBe('NOT_FOUND');
  });
});
