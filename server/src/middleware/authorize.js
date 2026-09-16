import { AppError } from '../lib/errors.js';
import { can } from '../policies/index.js';

// Never inline a role === '...' check in a route (docs/AGENTS.md §4) — always
// go through policies/can().
export function authorize(policy) {
  return function authorizeMiddleware(req, res, next) {
    if (!can(req.actor, policy)) return next(new AppError('FORBIDDEN', 403, 'Not allowed.'));
    next();
  };
}
