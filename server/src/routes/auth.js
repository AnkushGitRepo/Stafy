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

router.get('/profile', authenticate, loadEmployee, async (req, res, next) => {
  try {
    const { rows } = await getPool().query(
      `select e.id, e.employee_code, e.full_name, e.email, e.phone, e.designation, e.joining_date, e.employment_status, e.role,
              d.name as department_name, m.full_name as manager_name
       from employees e
       left join departments d on d.id = e.department_id
       left join employees m on m.id = e.manager_id
       where e.id = $1`,
      [req.actor.id],
    );
    const p = rows[0];
    if (!p) throw new AppError('NOT_FOUND', 404, 'Employee profile not found.');

    res.json({
      data: {
        id: p.id,
        code: p.employee_code,
        name: p.full_name,
        email: p.email,
        phone: p.phone ?? '',
        designation: p.designation ?? '—',
        department: p.department_name ?? '—',
        manager: p.manager_name ?? '—',
        joiningDate: p.joining_date,
        status: p.employment_status,
        role: p.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

const profileUpdateSchema = z.object({
  phone: z.string().min(5).max(20).nullable().optional(),
}).strict();

router.patch('/profile', authenticate, loadEmployee, validate(profileUpdateSchema), async (req, res, next) => {
  try {
    const { phone } = req.body;
    const pool = getPool();
    await pool.query(`update employees set phone = $1 where id = $2`, [phone ?? null, req.actor.id]);
    await pool.query(
      `insert into audit_logs (actor_id, action, entity_type, entity_id, after)
       values ($1, 'profile.updated', 'employee', $1, $2)`,
      [
        req.actor.id,
        JSON.stringify({
          phone: phone ?? null,
          employee_name: req.actor.fullName,
          employee_code: req.actor.employeeCode,
        }),
      ],
    );
    res.json({ data: { phone: phone ?? '' } });
  } catch (err) {
    next(err);
  }
});

export default router;
