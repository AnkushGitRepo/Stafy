import { Router } from 'express';
import { z } from 'zod';

import { getPool } from '../db/pool.js';
import { AppError } from '../lib/errors.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { loadEmployee } from '../middleware/loadEmployee.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/', authenticate, loadEmployee, authorize('employees.read'), async (req, res, next) => {
  try {
    const { search, department, status } = req.query;
    const conditions = [];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(e.full_name ilike $${params.length} or e.email ilike $${params.length} or e.employee_code ilike $${params.length})`);
    }
    if (department) {
      params.push(department);
      conditions.push(`d.name = $${params.length}`);
    }
    if (status === 'active' || status === 'inactive') {
      params.push(status);
      conditions.push(`e.employment_status = $${params.length}`);
    }

    const where = conditions.length ? `where ${conditions.join(' and ')}` : '';
    const { rows } = await getPool().query(
      `select e.id, e.employee_code, e.full_name, e.email, e.phone, e.designation, e.joining_date, e.employment_status, e.role,
              d.name as department_name, m.full_name as manager_name
       from employees e
       left join departments d on d.id = e.department_id
       left join employees m on m.id = e.manager_id
       ${where}
       order by e.full_name`,
      params,
    );
    res.json({
      data: rows.map((r) => ({
        id: r.id,
        code: r.employee_code,
        name: r.full_name,
        email: r.email,
        phone: r.phone ?? '—',
        designation: r.designation ?? '—',
        department: r.department_name ?? '—',
        manager: r.manager_name ?? '—',
        joiningDate: r.joining_date,
        status: r.employment_status,
        role: r.role,
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/departments', authenticate, loadEmployee, authorize('employees.read'), async (req, res, next) => {
  try {
    const { rows } = await getPool().query(`select id, name from departments order by name`);
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

router.get('/managers', authenticate, loadEmployee, authorize('employees.read'), async (req, res, next) => {
  try {
    const { rows } = await getPool().query(
      `select id, full_name as name, role from employees where role in ('admin', 'manager') and employment_status = 'active' order by full_name`,
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authenticate, loadEmployee, authorize('employees.read'), async (req, res, next) => {
  try {
    const { rows } = await getPool().query(
      `select e.id, e.employee_code, e.full_name, e.email, e.phone, e.designation, e.joining_date, e.employment_status, e.role,
              e.department_id, e.manager_id, d.name as department_name, m.full_name as manager_name,
              (select count(*)::int from employees where manager_id = e.id and employment_status = 'active') as direct_reports_count
       from employees e
       left join departments d on d.id = e.department_id
       left join employees m on m.id = e.manager_id
       where e.id = $1`,
      [req.params.id],
    );
    const emp = rows[0];
    if (!emp) throw new AppError('NOT_FOUND', 404, 'Employee not found.');

    res.json({
      data: {
        id: emp.id,
        code: emp.employee_code,
        name: emp.full_name,
        email: emp.email,
        phone: emp.phone ?? '',
        designation: emp.designation ?? '—',
        department: emp.department_name ?? '—',
        departmentId: emp.department_id,
        manager: emp.manager_name ?? '—',
        managerId: emp.manager_id,
        joiningDate: emp.joining_date,
        status: emp.employment_status,
        role: emp.role,
        directReportsCount: emp.direct_reports_count,
      },
    });
  } catch (err) {
    next(err);
  }
});

const createEmployeeSchema = z
  .object({
    fullName: z.string().min(2).max(100),
    email: z.string().email(),
    phone: z.string().max(20).optional().nullable(),
    departmentId: z.string().uuid().optional().nullable(),
    designation: z.string().min(1).max(100).optional().nullable(),
    managerId: z.string().uuid().optional().nullable(),
    joiningDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    role: z.enum(['admin', 'manager', 'employee']).default('employee'),
  })
  .strict();

router.post('/', authenticate, loadEmployee, authorize('employees.write'), validate(createEmployeeSchema), async (req, res, next) => {
  try {
    const pool = getPool();
    const { fullName, email, phone, departmentId, designation, managerId, joiningDate, role } = req.body;

    const { rows: existingEmail } = await pool.query(`select id from employees where lower(email) = lower($1)`, [email]);
    if (existingEmail.length) {
      throw new AppError('EMAIL_TAKEN', 409, 'An employee with this email already exists.');
    }

    // Auto-generate employee code: find highest EMP-XXXX number
    const { rows: codes } = await pool.query(`select employee_code from employees where employee_code ~ '^EMP-[0-9]+$' order by employee_code desc limit 1`);
    let nextNum = 1;
    if (codes.length) {
      const match = codes[0].employee_code.match(/^EMP-(\d+)$/);
      if (match) nextNum = parseInt(match[1], 10) + 1;
    }
    const employeeCode = `EMP-${String(nextNum).padStart(4, '0')}`;

    const { rows } = await pool.query(
      `insert into employees (employee_code, full_name, email, phone, department_id, designation, manager_id, joining_date, role, employment_status)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active')
       returning id, employee_code, full_name`,
      [employeeCode, fullName, email, phone ?? null, departmentId ?? null, designation ?? null, managerId ?? null, joiningDate, role],
    );

    const created = rows[0];
    await pool.query(
      `insert into audit_logs (actor_id, action, entity_type, entity_id, after)
       values ($1, 'employee.created', 'employee', $2, $3)`,
      [req.actor.id, created.id, JSON.stringify({ code: created.employee_code, name: created.full_name, email, role })],
    );

    res.status(201).json({ data: created });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/deactivate', authenticate, loadEmployee, authorize('employees.write'), async (req, res, next) => {
  try {
    const pool = getPool();
    const { rows: targets } = await pool.query(
      `select id, employee_code, full_name, role, employment_status from employees where id = $1`,
      [req.params.id],
    );
    const target = targets[0];
    if (!target) throw new AppError('NOT_FOUND', 404, 'Employee not found.');
    if (target.employment_status === 'inactive') {
      throw new AppError('ALREADY_INACTIVE', 409, 'Employee is already inactive.');
    }

    // BR-25: Self-deactivation forbidden
    if (target.id === req.actor.id) {
      throw new AppError('SELF_ACTION_FORBIDDEN', 403, 'You cannot deactivate your own account.');
    }

    // BR-25: Last active admin protection
    if (target.role === 'admin') {
      const { rows: admins } = await pool.query(`select count(*)::int as c from employees where role = 'admin' and employment_status = 'active'`);
      if (admins[0].c <= 1) {
        throw new AppError('LAST_ADMIN', 409, 'Cannot deactivate the last active administrator.');
      }
    }

    // BR-24: Direct reports check
    const { rows: reports } = await pool.query(`select count(*)::int as c from employees where manager_id = $1 and employment_status = 'active'`, [target.id]);
    if (reports[0].c > 0) {
      throw new AppError('HAS_ACTIVE_REPORTS', 409, 'Reassign this employee’s direct reports before deactivating.');
    }

    await pool.query(`update employees set employment_status = 'inactive' where id = $1`, [target.id]);
    await pool.query(`update leave_requests set status = 'cancelled', cancelled_at = now() where employee_id = $1 and status = 'pending'`, [target.id]);
    await pool.query(
      `insert into audit_logs (actor_id, action, entity_type, entity_id, after)
       values ($1, 'employee.deactivated', 'employee', $2, $3)`,
      [
        req.actor.id,
        target.id,
        JSON.stringify({
          status: 'inactive',
          employee_id: target.id,
          employee_name: target.full_name,
          employee_code: target.employee_code,
          role: target.role,
        }),
      ],
    );

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
