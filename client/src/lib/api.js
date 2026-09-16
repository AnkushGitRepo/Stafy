// Fetch wrapper: same-origin credentials, JSON only, refreshes the session
// once on 401 before giving up. See docs/ARCHITECTURE.md Frontend structure.
//
// USE_MOCKS gates every domain function below between the mock implementation
// (this phase, P-003) and the real one (P1, against docs/ARCHITECTURE.md's API
// contract table). Flipping it to false is the only change P1 needs to make
// here — component code never touches USE_MOCKS or the mocks/ directory
// directly.
import { getDashboardForRole } from '../mocks/dashboardData.js';
import { clearSession, getSession, setSession } from '../mocks/session.js';
import { DEMO_USERS, findUserByEmail, MOCK_INVITE } from '../mocks/users.js';

export const USE_MOCKS = false;

export class ApiError extends Error {
  constructor(code, status, message) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mockDelay() {
  return delay(400 + Math.random() * 300);
}

let refreshPromise = null;

async function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'same-origin',
    }).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

/**
 * @param {string} path
 * @param {RequestInit} [options]
 */
export async function api(path, options = {}) {
  const doFetch = () =>
    fetch(path, {
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });

  let res = await doFetch();

  // /api/auth/me is how the app checks "am I logged in" on every page load,
  // including public pages — a 401 there just means "signed out", never a
  // reason to redirect (that used to bounce anonymous visitors on /login
  // into an infinite reload loop: 401 -> redirect to /login -> getMe() runs
  // again -> 401 -> redirect... AICR-004).
  const skipRedirect = path === '/api/auth/refresh' || path === '/api/auth/me';

  if (res.status === 401 && !skipRedirect) {
    const refreshRes = await refreshSession();
    if (refreshRes.ok) {
      res = await doFetch();
    } else {
      window.location.assign('/login');
      return res;
    }
  }

  return res;
}

// --- Domain functions -------------------------------------------------
// Real branch below is unreachable while USE_MOCKS is true; it exists so the
// shape (arguments, return value, thrown error) is already correct for P1.

const RATE_LIMIT_MAX_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;
let loginAttempts = 0;
let lockedUntil = 0;

/**
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ data: { email: string, name: string, role: string } }>}
 */
export async function login({ email, password }) {
  if (USE_MOCKS) {
    if (Date.now() < lockedUntil) {
      const secondsLeft = Math.ceil((lockedUntil - Date.now()) / 1000);
      throw new ApiError('RATE_LIMITED', 429, `Too many attempts. Try again in ${secondsLeft}s.`);
    }

    await mockDelay();

    const user = findUserByEmail(email);
    if (!user || !password) {
      loginAttempts += 1;
      if (loginAttempts >= RATE_LIMIT_MAX_ATTEMPTS) {
        lockedUntil = Date.now() + RATE_LIMIT_WINDOW_MS;
        loginAttempts = 0;
      }
      throw new ApiError('INVALID_CREDENTIALS', 401, 'Incorrect email or password.');
    }

    loginAttempts = 0;
    setSession(user.email);
    return { data: user };
  }

  const res = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  if (!res.ok) throw new ApiError('INVALID_CREDENTIALS', res.status, 'Incorrect email or password.');
  return res.json();
}

/**
 * @param {{ token: string, password: string, email: string }} input
 */
export async function activateAccount({ token, password }) {
  if (USE_MOCKS) {
    await mockDelay();
    if (!token) throw new ApiError('INVALID_TOKEN', 400, 'This activation link is invalid or has expired.');
    if (!password || password.length < 8) {
      throw new ApiError('VALIDATION_ERROR', 400, 'Password must be at least 8 characters.');
    }
    setSession(MOCK_INVITE.email);
    return { data: { email: MOCK_INVITE.email, name: MOCK_INVITE.name, role: MOCK_INVITE.role } };
  }

  const res = await api('/api/auth/activate', { method: 'POST', body: JSON.stringify({ token, password }) });
  if (!res.ok) throw new ApiError('INVALID_TOKEN', res.status, 'This activation link is invalid or has expired.');
  return res.json();
}

/** Mock-only: look up the invite shown on /activate before a password is set. */
export function getMockInvite(token) {
  if (!token) return null;
  return MOCK_INVITE;
}

export async function getMe() {
  if (USE_MOCKS) {
    await delay(150);
    const session = getSession();
    if (!session) throw new ApiError('UNAUTHENTICATED', 401, 'Not signed in.');
    const user = findUserByEmail(session.email) ?? DEMO_USERS[0];
    return { data: user };
  }

  const res = await api('/api/auth/me');
  if (!res.ok) throw new ApiError('UNAUTHENTICATED', res.status, 'Not signed in.');
  return res.json();
}

export async function logout() {
  if (USE_MOCKS) {
    await delay(150);
    clearSession();
    return { data: null };
  }

  await api('/api/auth/logout', { method: 'POST' });
  return { data: null };
}

/** @param {string} role */
export async function getDashboard(role) {
  if (USE_MOCKS) {
    await mockDelay();
    return { data: getDashboardForRole(role) };
  }

  const res = await api('/api/dashboard');
  if (!res.ok) throw new ApiError('DASHBOARD_LOAD_FAILED', res.status, 'Could not load the dashboard.');
  return res.json();
}

// --- Attendance (P-007) --------------------------------------------------

export async function getTodayAttendance() {
  const res = await api('/api/attendance/today');
  if (!res.ok) throw new ApiError('ATTENDANCE_LOAD_FAILED', res.status, 'Could not load today’s attendance.');
  return res.json();
}

export async function checkIn() {
  const res = await api('/api/attendance/check-in', { method: 'POST' });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(body?.error?.code ?? 'CHECK_IN_FAILED', res.status, body?.error?.message ?? 'Could not check in.');
  return body;
}

export async function checkOut() {
  const res = await api('/api/attendance/check-out', { method: 'POST' });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(body?.error?.code ?? 'CHECK_OUT_FAILED', res.status, body?.error?.message ?? 'Could not check out.');
  return body;
}

// --- Leave approvals (P-007) ----------------------------------------------

export async function getApprovals() {
  const res = await api('/api/leave-requests/approvals');
  if (!res.ok) throw new ApiError('APPROVALS_LOAD_FAILED', res.status, 'Could not load approvals.');
  return res.json();
}

export async function approveLeaveRequest(id) {
  const res = await api(`/api/leave-requests/${id}/approve`, { method: 'POST' });
  if (!res.ok) throw new ApiError('APPROVE_FAILED', res.status, 'Could not approve this request.');
}

export async function rejectLeaveRequest(id, reason) {
  const res = await api(`/api/leave-requests/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(body?.error?.code ?? 'REJECT_FAILED', res.status, body?.error?.message ?? 'Could not reject this request.');
}

export async function getLeaveTypes() {
  const res = await api('/api/leave-requests/types');
  if (!res.ok) throw new ApiError('LEAVE_TYPES_LOAD_FAILED', res.status, 'Could not load leave types.');
  return res.json();
}

export async function getLeaveBalance() {
  const res = await api('/api/leave-requests/balance');
  if (!res.ok) throw new ApiError('BALANCE_LOAD_FAILED', res.status, 'Could not load your leave balance.');
  return res.json();
}

export async function getMyLeaveRequests() {
  const res = await api('/api/leave-requests/mine');
  if (!res.ok) throw new ApiError('LEAVE_LOAD_FAILED', res.status, 'Could not load your leave requests.');
  return res.json();
}

export async function applyForLeave(payload) {
  const res = await api('/api/leave-requests', { method: 'POST', body: JSON.stringify(payload) });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(body?.error?.code ?? 'APPLY_FAILED', res.status, body?.error?.message ?? 'Could not submit this request.');
  return body;
}

export async function cancelLeaveRequest(id) {
  const res = await api(`/api/leave-requests/${id}/cancel`, { method: 'POST' });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body?.error?.code ?? 'CANCEL_FAILED', res.status, body?.error?.message ?? 'Could not cancel this request.');
  }
}

export async function getAttendanceForDate(date) {
  const res = await api(`/api/attendance?date=${date}`);
  if (!res.ok) throw new ApiError('ATTENDANCE_LOAD_FAILED', res.status, 'Could not load attendance.');
  return res.json();
}

export async function getMyAttendanceHistory() {
  const res = await api('/api/attendance/mine');
  if (!res.ok) throw new ApiError('ATTENDANCE_LOAD_FAILED', res.status, 'Could not load your attendance history.');
  return res.json();
}

export async function getEmployees(filters = {}) {
  const params = new URLSearchParams(Object.entries(filters).filter(([, v]) => v));
  const qs = params.toString();
  const res = await api(`/api/employees${qs ? `?${qs}` : ''}`);
  if (!res.ok) throw new ApiError('EMPLOYEES_LOAD_FAILED', res.status, 'Could not load employees.');
  return res.json();
}
