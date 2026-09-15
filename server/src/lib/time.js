// IST (Asia/Kolkata) time helpers. All "today"/work-date logic in the app
// must go through this file — never trust a client-supplied date/time
// (docs/DECISIONS.md ADR-011).

/**
 * Returns the current instant as an IST-local Date-equivalent.
 * @returns {Date}
 */
export function nowInIst() {
  throw new Error('TODO(P1): implement nowInIst — see docs/DECISIONS.md ADR-011');
}

/**
 * Derives the IST calendar work_date (YYYY-MM-DD) for a given instant.
 * @param {Date} [at]
 * @returns {string}
 */
export function workDateInIst(at) {
  throw new Error('TODO(P1): implement workDateInIst — see docs/DECISIONS.md ADR-011');
}

/**
 * Monday-Friday check in IST for a given work_date.
 * @param {string} workDate
 * @returns {boolean}
 */
export function isWorkingDay(workDate) {
  throw new Error('TODO(P1): implement isWorkingDay — see docs/DECISIONS.md ADR-011');
}
