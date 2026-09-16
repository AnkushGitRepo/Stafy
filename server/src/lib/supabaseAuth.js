// Thin wrapper over Supabase Auth's REST API (no @supabase/supabase-js
// dependency — not on the approved dependency list, and this is the whole
// surface we need: password login, token verification, refresh).
import { env } from '../config/env.js';

const BASE = env.SUPABASE_URL;
const ANON_KEY = env.SUPABASE_PUBLISHABLE_KEY;

export async function passwordLogin(email, password) {
  const res = await fetch(`${BASE}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function getAuthUser(accessToken) {
  const res = await fetch(`${BASE}/auth/v1/user`, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function refreshSession(refreshToken) {
  const res = await fetch(`${BASE}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: { apikey: ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!res.ok) return null;
  return res.json();
}
