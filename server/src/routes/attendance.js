import { Router } from 'express';

import { getPool } from '../db/pool.js';
import { AppError } from '../lib/errors.js';
import { isWorkingDay, workDateInIst } from '../lib/time.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { loadEmployee } from '../middleware/loadEmployee.js';

const router = Router();

router.get('/today', authenticate, loadEmployee, authorize('attendance.self'), async (req, res, next) => {
  try {
    const today = workDateInIst();
    const { rows } = await getPool().query(
      `select work_date, check_in_at, check_out_at from attendance where employee_id=$1 and work_date=$2`,
      [req.actor.id, today],
    );
    res.json({ data: rows[0] ?? null });
  } catch (err) {
    next(err);
  }
});

router.post('/check-in', authenticate, loadEmployee, authorize('attendance.self'), async (req, res, next) => {
  try {
    const pool = getPool();
    const today = workDateInIst();

    if (!isWorkingDay(today)) throw new AppError('NON_WORKING_DAY', 409, "It's the weekend — check-in isn't required today.");

    const { rows: onLeave } = await pool.query(
      `select 1 from leave_requests where employee_id=$1 and status='approved' and duration='full_day' and $2 between start_date and end_date`,
      [req.actor.id, today],
    );
    if (onLeave.length) throw new AppError('ON_APPROVED_LEAVE', 409, "You're on approved leave today.");

    const { rows: existing } = await pool.query(`select 1 from attendance where employee_id=$1 and work_date=$2`, [req.actor.id, today]);
    if (existing.length) throw new AppError('ALREADY_CHECKED_IN', 409, 'Already checked in today.');

    const { rows } = await pool.query(
      `insert into attendance (employee_id, work_date, check_in_at) values ($1,$2, now()) returning work_date, check_in_at, check_out_at`,
      [req.actor.id, today],
    );

    await pool.query(
      `insert into audit_logs (actor_id, action, entity_type, entity_id, after)
       values ($1, 'attendance.check_in', 'attendance', $2, $3)`,
      [
        req.actor.id,
        req.actor.id,
        JSON.stringify({
          work_date: today,
          employee_name: req.actor.fullName,
          employee_code: req.actor.employeeCode,
        }),
      ],
    );

    res.status(201).json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
});

router.post('/check-out', authenticate, loadEmployee, authorize('attendance.self'), async (req, res, next) => {
  try {
    const pool = getPool();
    const today = workDateInIst();
    const { rows: existing } = await pool.query(
      `select id, check_out_at from attendance where employee_id=$1 and work_date=$2`,
      [req.actor.id, today],
    );
    if (!existing.length) throw new AppError('NOT_CHECKED_IN', 409, "You haven't checked in today.");
    if (existing[0].check_out_at) throw new AppError('ALREADY_CHECKED_OUT', 409, 'Already checked out today.');

    const { rows } = await pool.query(
      `update attendance set check_out_at = now() where id=$1 returning work_date, check_in_at, check_out_at`,
      [existing[0].id],
    );

    await pool.query(
      `insert into audit_logs (actor_id, action, entity_type, entity_id, after)
       values ($1, 'attendance.check_out', 'attendance', $2, $3)`,
      [
        req.actor.id,
        req.actor.id,
        JSON.stringify({
          work_date: today,
          employee_name: req.actor.fullName,
          employee_code: req.actor.employeeCode,
        }),
      ],
    );

    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
});

export default router;
