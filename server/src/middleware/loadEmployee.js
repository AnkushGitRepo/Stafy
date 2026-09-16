import { getPool } from '../db/pool.js';
import { AppError } from '../lib/errors.js';

// Deactivation blocks every API call on the next request (ADR-004, BR-24) —
// this middleware is what enforces that, right after authenticate confirms
// the Supabase session is still valid.
export async function loadEmployee(req, res, next) {
  try {
    const { rows } = await getPool().query(
      `select id, full_name, email, role, employment_status, manager_id from employees where auth_user_id = $1`,
      [req.authUserId],
    );
    const emp = rows[0];
    if (!emp || emp.employment_status !== 'active') {
      return next(new AppError('UNAUTHENTICATED', 401, 'Account is not active.'));
    }
    req.actor = emp;
    next();
  } catch (err) {
    next(err);
  }
}
