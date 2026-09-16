import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router';
import { z } from 'zod';

import { Button } from '../../../components/ui/Button.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { activateAccount, getMockInvite } from '../../../lib/api.js';
import { useAuth } from '../../../lib/authContext.jsx';
import { useDocumentHead } from '../../../lib/useDocumentHead.js';
import { AuthLayout } from '../components/AuthLayout.jsx';

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  });

export function ActivateAccountPage() {
  useDocumentHead({ title: 'Set up your account — Stafy', noindex: true });
  const [params] = useSearchParams();
  const token = params.get('token');
  const invite = getMockInvite(token);
  const { setError: setAuthError } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  if (!invite) {
    return (
      <AuthLayout>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--font-size-xl)', marginBottom: 8 }}>
          This invite link is invalid or has expired
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
          Ask your HR admin to send a new activation link. If you think this is a mistake, contact{' '}
          <a href="mailto:support@stafy.com">support@stafy.com</a>.
        </p>
      </AuthLayout>
    );
  }

  const onSubmit = async ({ password }) => {
    setServerError(null);
    try {
      await activateAccount({ token, password });
      // authContext reads the session on mount only; a full reload keeps
      // the mock flow simple and matches "behaves like a successful login".
      window.location.assign('/app');
    } catch (err) {
      setServerError(err.message);
      setAuthError?.(err.message);
    }
  };

  return (
    <AuthLayout>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--font-size-xl)', marginBottom: 4 }}>Set up your account</h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 24 }}>
        Choose a password to finish setting up your Stafy account.
      </p>

      <div className="field" style={{ marginBottom: 20 }}>
        <span className="field-label">Name</span>
        <p style={{ fontSize: 'var(--font-size-base)' }}>{invite.name}</p>
      </div>
      <div className="field" style={{ marginBottom: 20 }}>
        <span className="field-label">Email</span>
        <p style={{ fontSize: 'var(--font-size-base)' }}>{invite.email}</p>
      </div>

      {serverError && (
        <div
          role="alert"
          style={{
            background: 'var(--color-danger-chip-bg)',
            color: 'var(--color-danger)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            fontSize: 'var(--font-size-sm)',
            marginBottom: 16,
          }}
        >
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }} noValidate>
        <Input
          label="New password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters."
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Button type="submit" disabled={isSubmitting} style={{ width: '100%' }}>
          {isSubmitting ? 'Setting up…' : 'Set password and sign in'}
        </Button>
      </form>
    </AuthLayout>
  );
}
