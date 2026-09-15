import { AppError } from '../lib/errors.js';

// TODO(P1): parse/strip req.body (or req.query) against a per-route,
// per-role Zod .strict() schema (docs/AGENTS.md §4, BR-22).
export function validate(_schema) {
  return function validateMiddleware(req, res, next) {
    throw new AppError('NOT_IMPLEMENTED', 501, 'validate middleware not implemented yet');
  };
}
