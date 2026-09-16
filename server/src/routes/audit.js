import { Router } from 'express';

import { getPool } from '../db/pool.js';
import { AUDIT_QUERY_BASE, formatAuditEvent } from '../lib/auditFormatter.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { loadEmployee } from '../middleware/loadEmployee.js';

const router = Router();

router.get('/', authenticate, loadEmployee, authorize('audit.read'), async (req, res, next) => {
  try {
    const pool = getPool();
    const { category, q } = req.query;

    const { rows } = await pool.query(
      `${AUDIT_QUERY_BASE} order by a.created_at desc limit 100`,
    );

    let events = rows.map(formatAuditEvent);

    const counts = {
      total: events.length,
      leave: events.filter((e) => e.category === 'leave').length,
      employee: events.filter((e) => e.category === 'employee').length,
      attendance: events.filter((e) => e.category === 'attendance').length,
    };

    if (category && category !== 'all') {
      events = events.filter((e) => e.category === category);
    }

    if (q && typeof q === 'string' && q.trim()) {
      const term = q.trim().toLowerCase();
      events = events.filter(
        (e) =>
          e.actorName.toLowerCase().includes(term) ||
          e.targetName.toLowerCase().includes(term) ||
          e.actionLabel.toLowerCase().includes(term) ||
          e.summary.toLowerCase().includes(term) ||
          e.details.toLowerCase().includes(term),
      );
    }

    res.json({
      data: events,
      summary: counts,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
