import { Router } from 'express';
import { z } from 'zod';

import { getPool } from '../db/pool.js';
import { clearAuthCookies, setAuthCookies } from '../lib/cookies.js';
import { AppError } from '../lib/errors.js';
import { getAuthUser, passwordLogin } from '../lib/supabaseAuth.js';
import { authenticate } from '../middleware/authenticate.js';
import { loadEmployee } from '../middleware/loadEmployee.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) }).strict();

function shapeProfile(emp) {
  const initials = emp.full_name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return { id: emp.id, name: emp.full_name, email: emp.email, role: emp.role, initials };
}

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const session = await passwordLogin(email, password);
    if (!session?.access_token) throw new AppError('INVALID_CREDENTIALS', 401, 'Incorrect email or password.');

    const authUser = await getAuthUser(session.access_token);
    const { rows } = await getPool().query(
      `select id, full_name, email, role, employment_status from employees where auth_user_id = $1`,
      [authUser?.id],
    );
    const emp = rows[0];
    if (!emp || emp.employment_status !== 'active') {
      throw new AppError('INVALID_CREDENTIALS', 401, 'Incorrect email or password.');
    }

    setAuthCookies(res, session);
    res.json({ data: shapeProfile(emp) });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req, res) => {
  clearAuthCookies(res);
  res.status(204).end();
});

router.get('/me', authenticate, loadEmployee, (req, res) => {
  res.json({ data: shapeProfile(req.actor) });
});

export default router;
