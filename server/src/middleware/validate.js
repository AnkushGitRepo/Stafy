import { AppError } from '../lib/errors.js';

// Parses/replaces req.body against a per-route Zod .strict() schema — any
// field not in the schema is rejected, not silently ignored (BR-20, BR-22).
export function validate(schema) {
  return function validateMiddleware(req, res, next) {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(new AppError('VALIDATION_ERROR', 400, 'Invalid input.', result.error.flatten()));
    }
    req.body = result.data;
    next();
  };
}
