// Fetch wrapper: same-origin credentials, JSON only, refreshes the session
// once on 401 before giving up. See docs/ARCHITECTURE.md Frontend structure.

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

  if (res.status === 401 && path !== '/api/auth/refresh') {
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
