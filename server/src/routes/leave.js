import { Router } from 'express';
import { z } from 'zod';

import { getPool } from '../db/pool.js';
import { AppError } from '../lib/errors.js';
import { formatIstDate, workDateInIst } from '../lib/time.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { loadEmployee } from '../middleware/loadEmployee.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/types', authenticate, loadEmployee, authorize('leave.self'), async (req, res, next) => {
  try {
    const { rows } = await getPool().query(`select id, code, name, annual_quota, is_paid from leave_types order by name`);
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

// Balance = annual_quota - sum(days) of this calendar year's approved
// requests of that type, in scope for the requesting employee only.
// Unpaid has no quota ("No limit"). Display-only this pass — apply doesn't
// enforce it yet (BR-07 partial: shown, not blocking).
router.get('/balance', authenticate, loadEmployee, authorize('leave.self'), async (req, res, next) => {
  try {
    const { rows } = await getPool().query(
      `select lt.id, lt.name, lt.annual_quota, lt.is_paid,
              coalesce(sum(lr.days) filter (
                where lr.status = 'approved' and extract(year from lr.start_date) = extract(year from (now() at time zone 'Asia/Kolkata'))
              ), 0) as used
       from leave_types lt
       left join leave_requests lr on lr.leave_type_id = lt.id and lr.employee_id = $1
       group by lt.id, lt.name, lt.annual_quota, lt.is_paid
       order by lt.name`,
      [req.actor.id],
    );
    res.json({
      data: rows.map((r) => ({
        id: r.id,
        name: r.name,
        quota: r.annual_quota === null ? null : Number(r.annual_quota),
        used: Number(r.used),
        remaining: r.annual_quota === null ? null : Number(r.annual_quota) - Number(r.used),
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/mine', authenticate, loadEmployee, authorize('leave.self'), async (req, res, next) => {
  try {
    const { rows } = await getPool().query(
      `select lr.id, lr.start_date, lr.end_date, lr.duration, lr.days, lr.status, lr.reason, lr.rejection_reason, lr.created_at, lt.name as type_name
       from leave_requests lr join leave_types lt on lt.id = lr.leave_type_id
       where lr.employee_id = $1 order by lr.created_at desc`,
      [req.actor.id],
    );
    res.json({
      data: rows.map((r) => ({
        id: r.id,
        dates: r.start_date === r.end_date ? formatIstDate(r.start_date) : `${formatIstDate(r.start_date)} – ${formatIstDate(r.end_date)}`,
        startDate: r.start_date,
        type: r.type_name,
        days: Number(r.days),
        status: r.status,
        reason: r.reason,
        rejectionReason: r.rejection_reason,
        canCancel: r.status === 'pending' || (r.status === 'approved' && r.start_date >= workDateInIst()),
      })),
    });
  } catch (err) {
    next(err);
  }
});

const applySchema = z
  .object({
    leaveTypeId: z.string().uuid(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    duration: z.enum(['full_day', 'half_day']).default('full_day'),
    halfSession: z.enum(['first_half', 'second_half']).optional(),
    reason: z.string().min(10).max(500),
  })
  .strict()
  .refine((v) => v.endDate >= v.startDate, { message: 'End date cannot be before start date.', path: ['endDate'] })
  .refine((v) => v.duration !== 'half_day' || v.startDate === v.endDate, {
    message: 'Half-day leave must be a single date.',
    path: ['duration'],
  })
  .refine((v) => v.duration !== 'half_day' || Boolean(v.halfSession), {
    message: 'Half-day leave needs a session (first or second half).',
    path: ['halfSession'],
  });

router.post('/', authenticate, loadEmployee, authorize('leave.self'), validate(applySchema), async (req, res, next) => {
  try {
    const { leaveTypeId, startDate, endDate, duration, halfSession, reason } = req.body;
    const days = duration === 'half_day' ? 0.5 : (new Date(`${endDate}T00:00:00Z`) - new Date(`${startDate}T00:00:00Z`)) / 86400000 + 1;

    const pool = getPool();
    const { rows } = await pool.query(
      `insert into leave_requests (employee_id, leave_type_id, start_date, end_date, duration, half_session, days, reason)
       values ($1,$2,$3,$4,$5,$6,$7,$8) returning id`,
      [req.actor.id, leaveTypeId, startDate, endDate, duration, halfSession ?? null, days, reason],
    );

    const { rows: ltRows } = await pool.query(`select name from leave_types where id = $1`, [leaveTypeId]);
    await pool.query(
      `insert into audit_logs (actor_id, action, entity_type, entity_id, after)
       values ($1, 'leave.applied', 'leave_request', $2, $3)`,
      [
        req.actor.id,
        rows[0].id,
        JSON.stringify({
          status: 'pending',
          employee_id: req.actor.id,
          employee_name: req.actor.fullName,
          leave_type: ltRows[0]?.name ?? 'Leave',
          start_date: startDate,
          end_date: endDate,
          days,
        }),
      ],
    );

    res.status(201).json({ data: { id: rows[0].id } });
  } catch (err) {
    if (err.code === '23P01') return next(new AppError('LEAVE_OVERLAP', 409, 'This overlaps one of your existing pending or approved leave requests.'));
    if (err.code === '23514') return next(new AppError('VALIDATION_ERROR', 400, 'Invalid leave request.'));
    next(err);
  }
});

router.post('/:id/cancel', authenticate, loadEmployee, authorize('leave.self'), async (req, res, next) => {
  try {
    const pool = getPool();
    const { rows: existing } = await pool.query(
      `select id, status, start_date from leave_requests where id=$1 and employee_id=$2`,
      [req.params.id, req.actor.id],
    );
    const request = existing[0];
    if (!request) throw new AppError('NOT_FOUND', 404, 'Leave request not found.');
    if (request.status === 'rejected' || request.status === 'cancelled') {
      throw new AppError('INVALID_STATUS_TRANSITION', 409, 'This request cannot be cancelled.');
    }
    if (request.status === 'approved' && request.start_date < workDateInIst()) {
      throw new AppError('LEAVE_ALREADY_STARTED', 409, 'This leave has already started and cannot be cancelled.');
    }
    await pool.query(`update leave_requests set status='cancelled', cancelled_at=now() where id=$1`, [request.id]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.get('/approvals', authenticate, loadEmployee, authorize('leave.approvals.read'), async (req, res, next) => {
  try {
    const actor = req.actor;
    const scopeSql = actor.role === 'admin' ? 'true' : 'e.manager_id = $1';
    const params = actor.role === 'admin' ? [] : [actor.id];
    const { rows } = await getPool().query(
      `select lr.id, e.full_name as name, lr.start_date, lr.end_date, lt.name as type_name
       from leave_requests lr
       join employees e on e.id = lr.employee_id
       join leave_types lt on lt.id = lr.leave_type_id
       where lr.status='pending' and ${scopeSql}
       order by lr.created_at`,
      params,
    );
    res.json({
      data: rows.map((a) => ({
        id: a.id,
        name: a.name,
        dates: a.start_date === a.end_date ? formatIstDate(a.start_date) : `${formatIstDate(a.start_date)} – ${formatIstDate(a.end_date)}`,
        type: a.type_name,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// A manager acting on a non-direct-report's leave gets 404, never 403 — no
// enumeration of requests outside their scope (BR-11, ADR-008). Admin scope
// is unrestricted. Self-approval is rejected even for admins (BR-10).
async function scopedPendingRequest(pool, actor, id) {
  const scopeSql = actor.role === 'admin' ? 'true' : 'e.manager_id = $2';
  const params = actor.role === 'admin' ? [id] : [id, actor.id];
  const { rows } = await pool.query(
    `select lr.id, lr.employee_id, lr.days, lr.start_date, lr.end_date, lr.reason,
            e.full_name as employee_name, e.employee_code, lt.name as leave_type_name
     from leave_requests lr
     join employees e on e.id = lr.employee_id
     join leave_types lt on lt.id = lr.leave_type_id
     where lr.id = $1 and lr.status='pending' and ${scopeSql}`,
    params,
  );
  return rows[0] ?? null;
}

router.post('/:id/approve', authenticate, loadEmployee, authorize('leave.decide'), async (req, res, next) => {
  try {
    const pool = getPool();
    const request = await scopedPendingRequest(pool, req.actor, req.params.id);
    if (!request) throw new AppError('NOT_FOUND', 404, 'Leave request not found.');
    if (request.employee_id === req.actor.id) throw new AppError('SELF_APPROVAL_FORBIDDEN', 403, 'You cannot approve your own leave request.');

    const { rows } = await pool.query(
      `update leave_requests set status='approved', approver_id=$1, decided_at=now()
       where id=$2 and status='pending' returning id`,
      [req.actor.id, request.id],
    );
    if (!rows.length) throw new AppError('INVALID_STATUS_TRANSITION', 409, 'This request was already decided.');

    await pool.query(
      `insert into audit_logs (actor_id, action, entity_type, entity_id, after)
       values ($1, 'leave.approved', 'leave_request', $2, $3)`,
      [
        req.actor.id,
        request.id,
        JSON.stringify({
          status: 'approved',
          employee_id: request.employee_id,
          employee_name: request.employee_name,
          employee_code: request.employee_code,
          leave_type: request.leave_type_name,
          start_date: request.start_date,
          end_date: request.end_date,
          days: request.days,
        }),
      ],
    );
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

const rejectSchema = z.object({ reason: z.string().min(10).max(500) }).strict();

router.post('/:id/reject', authenticate, loadEmployee, authorize('leave.decide'), validate(rejectSchema), async (req, res, next) => {
  try {
    const pool = getPool();
    const request = await scopedPendingRequest(pool, req.actor, req.params.id);
    if (!request) throw new AppError('NOT_FOUND', 404, 'Leave request not found.');
    if (request.employee_id === req.actor.id) throw new AppError('SELF_APPROVAL_FORBIDDEN', 403, 'You cannot act on your own leave request.');

    const { rows } = await pool.query(
      `update leave_requests set status='rejected', approver_id=$1, decided_at=now(), rejection_reason=$2
       where id=$3 and status='pending' returning id`,
      [req.actor.id, req.body.reason, request.id],
    );
    if (!rows.length) throw new AppError('INVALID_STATUS_TRANSITION', 409, 'This request was already decided.');

    await pool.query(
      `insert into audit_logs (actor_id, action, entity_type, entity_id, after)
       values ($1, 'leave.rejected', 'leave_request', $2, $3)`,
      [
        req.actor.id,
        request.id,
        JSON.stringify({
          status: 'rejected',
          employee_id: request.employee_id,
          employee_name: request.employee_name,
          employee_code: request.employee_code,
          leave_type: request.leave_type_name,
          rejection_reason: req.body.reason,
        }),
      ],
    );
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
