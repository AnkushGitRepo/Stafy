import { clearAuthCookies, setAuthCookies } from '../lib/cookies.js';
import { AppError } from '../lib/errors.js';
import { getAuthUser, refreshSession } from '../lib/supabaseAuth.js';

// Verifies the access-token cookie via Supabase's /auth/v1/user endpoint,
// with one silent refresh attempt on failure (docs/DECISIONS.md ADR-003/ADR-004).
export async function authenticate(req, res, next) {
  const accessToken = req.cookies?.sb_access_token;
  const refreshToken = req.cookies?.sb_refresh_token;
  if (!accessToken) return next(new AppError('UNAUTHENTICATED', 401, 'Sign in required.'));

  let authUser = await getAuthUser(accessToken);
  if (!authUser && refreshToken) {
    const refreshed = await refreshSession(refreshToken);
    if (refreshed?.access_token) {
      setAuthCookies(res, refreshed);
      authUser = await getAuthUser(refreshed.access_token);
    }
  }
  if (!authUser) {
    clearAuthCookies(res);
    return next(new AppError('UNAUTHENTICATED', 401, 'Sign in required.'));
  }
  req.authUserId = authUser.id;
  next();
}
