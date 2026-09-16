import { env } from '../config/env.js';

const isProd = env.NODE_ENV === 'production';

const base = { httpOnly: true, sameSite: 'lax', secure: isProd, path: '/' };

export function setAuthCookies(res, session) {
  res.cookie('sb_access_token', session.access_token, { ...base, maxAge: (session.expires_in ?? 3600) * 1000 });
  if (session.refresh_token) {
    res.cookie('sb_refresh_token', session.refresh_token, { ...base, maxAge: 30 * 24 * 3600 * 1000 });
  }
}

export function clearAuthCookies(res) {
  res.clearCookie('sb_access_token', base);
  res.clearCookie('sb_refresh_token', base);
}
