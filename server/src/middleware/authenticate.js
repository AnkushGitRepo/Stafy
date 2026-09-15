import { AppError } from '../lib/errors.js';

// TODO(P1): verify the access-token cookie via Supabase getClaims() (JWKS),
// then load the employees row by auth_user_id (docs/DECISIONS.md ADR-003, ADR-004).
// eslint-disable-next-line no-unused-vars
export function authenticate(req, res, next) {
  throw new AppError('NOT_IMPLEMENTED', 501, 'authenticate middleware not implemented yet');
}
