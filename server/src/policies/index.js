// can(actor, action) — the only place role checks happen (docs/AGENTS.md §4).
// Scoped to the routes this deadline-mode pass actually implements.
const RULES = {
  'dashboard.read': () => true,
  'attendance.self': () => true,
  'leave.self': () => true,
  'employees.read': (actor) => actor.role === 'admin',
  'attendance.org.read': (actor) => actor.role === 'admin' || actor.role === 'manager',
  'leave.approvals.read': (actor) => actor.role === 'admin' || actor.role === 'manager',
  'leave.decide': (actor) => actor.role === 'admin' || actor.role === 'manager',
};

/** @param {{ role: string }} actor @param {keyof typeof RULES} action */
export function can(actor, action) {
  return Boolean(RULES[action]?.(actor));
}
