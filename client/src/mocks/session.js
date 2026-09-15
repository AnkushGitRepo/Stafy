// sessionStorage, not localStorage: clears when the tab closes, closer to
// real cookie-session behavior than a persistent mock. Never stores anything
// that looks like a real credential — just the demo user's email.

const KEY = 'stafy.mock.session';

export function getSession() {
  const email = sessionStorage.getItem(KEY);
  return email ? { email } : null;
}

export function setSession(email) {
  sessionStorage.setItem(KEY, email);
}

export function clearSession() {
  sessionStorage.removeItem(KEY);
}
