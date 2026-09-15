import { AppError } from '../lib/errors.js';

// TODO(P1): call can(actor, action, resource?) from server/src/policies/.
// Never inline a role === '...' check in a route (docs/AGENTS.md §4).
export function authorize(_policy) {
  return function authorizeMiddleware(req, res, next) {
    throw new AppError('NOT_IMPLEMENTED', 501, 'authorize middleware not implemented yet');
  };
}
