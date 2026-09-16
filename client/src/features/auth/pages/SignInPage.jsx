import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '../../../components/ui/Button.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { useAuth } from '../../../lib/authContext.jsx';
import { useDocumentHead } from '../../../lib/useDocumentHead.js';
import { AuthLayout } from '../components/AuthLayout.jsx';

const DEMO_ACCOUNTS = [
  { email: 'hr@stafy.app', name: 'Priya Shah', role: 'admin' },
  { email: 'manager@stafy.app', name: 'Arjun Mehta', role: 'manager' },
  { email: 'manager.b@stafy.app', name: 'Vikram Nair', role: 'manager' },
  { email: 'employee@stafy.app', name: 'Riya Sen', role: 'employee' },
];

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

export function SignInPage() {
  useDocumentHead({ title: 'Sign in — Stafy', noindex: true });
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      await login(values);
      navigate('/app', { replace: true });
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <AuthLayout>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--font-size-xl)', marginBottom: 4 }}>Sign in</h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 24 }}>Welcome back to Stafy.</p>

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
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <button
          type="button"
          className="btn-ghost"
          style={{ alignSelf: 'flex-start', fontSize: 'var(--font-size-xs)' }}
          onClick={() => toast('Ask your HR admin to reset it for now.')}
        >
          Forgot your password?
        </button>
        <Button type="submit" disabled={isSubmitting} style={{ width: '100%' }}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <div
        style={{
          marginTop: 24,
          padding: 16,
          borderRadius: 'var(--radius-md)',
          border: '1px dashed var(--color-border)',
          background: 'var(--color-surface-2)',
        }}
      >
        <p style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted-2)', marginBottom: 8 }}>
          Demo accounts
        </p>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 'var(--font-size-xs)', fontFamily: 'ui-monospace, monospace' }}>
          {DEMO_ACCOUNTS.map((u) => (
            <li key={u.email}>
              {u.email} — {u.name} ({u.role})
            </li>
          ))}
        </ul>
        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted-2)', marginTop: 8 }}>
          Password for every demo account: <strong>StafyDemo2026!</strong>
        </p>
      </div>
    </AuthLayout>
  );
}
