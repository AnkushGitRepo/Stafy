// IST (Asia/Kolkata) time helpers. All "today"/work-date logic in the app
// must go through this file — never trust a client-supplied date/time
// (docs/DECISIONS.md ADR-011). Uses Intl with an explicit timeZone rather
// than manual UTC-offset arithmetic, so this is correct regardless of the
// host runtime's own local timezone (an earlier offset-math version broke
// outside a UTC-local environment).
const IST_DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Kolkata',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** @returns {Date} the current instant (use with workDateInIst/isWorkingDay for IST-local logic) */
export function nowInIst() {
  return new Date();
}

/**
 * @param {Date} [at]
 * @returns {string} YYYY-MM-DD, the IST calendar date for the given instant
 */
export function workDateInIst(at = new Date()) {
  return IST_DATE_FORMATTER.format(at); // en-CA formats as YYYY-MM-DD
}

/** @param {string} workDate YYYY-MM-DD @returns {boolean} */
export function isWorkingDay(workDate) {
  const day = new Date(`${workDate}T00:00:00Z`).getUTCDay();
  return day !== 0 && day !== 6;
}

/** @param {string|Date} date @returns {string} */
export function formatIstTime(date) {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date)).toLowerCase();
}

/** @param {string|Date} date @returns {string} */
export function formatIstDateTime(date) {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date));
}

/** @param {string|Date} date @returns {string} */
export function formatIstDate(date) {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date(date));
}
