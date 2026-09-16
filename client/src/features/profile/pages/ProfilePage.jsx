import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

import { Button } from '../../../components/ui/Button.jsx';
import { PageHeader } from '../../../components/ui/PageHeader.jsx';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { StatusPill } from '../../../components/ui/StatusPill.jsx';
import { getProfile, updateProfile } from '../../../lib/api.js';

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });
}

export function ProfilePage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['profile'],
    queryFn: () => getProfile().then((r) => r.data),
  });

  const [phone, setPhone] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (data?.phone) setPhone(data.phone);
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: (newPhone) => updateProfile({ phone: newPhone }),
    onSuccess: () => {
      setSuccessMsg('Phone number updated successfully.');
      setErrorMsg('');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setTimeout(() => setSuccessMsg(''), 4000);
    },
    onError: (err) => {
      setErrorMsg(err.message ?? 'Could not update phone number.');
      setSuccessMsg('');
    },
  });

  const handleSavePhone = (e) => {
    e.preventDefault();
    updateMutation.mutate(phone.trim());
  };

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Your employee profile and contact information." />

      {isLoading && (
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
            <Skeleton width={64} height={64} style={{ borderRadius: 999 }} />
            <div>
              <Skeleton width={160} height={20} style={{ marginBottom: 8 }} />
              <Skeleton width={100} height={14} />
            </div>
          </div>
          <Skeleton height={24} width="80%" style={{ marginBottom: 12 }} />
          <Skeleton height={24} width="60%" />
        </div>
      )}

      {isError && <p style={{ color: 'var(--color-danger)' }}>Could not load your profile. Try again.</p>}

      {data && (
        <div className="card" style={{ padding: 'var(--space-6)', maxWidth: 640 }}>
          <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', marginBottom: 'var(--space-6)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-6)' }}>
            <span
              style={{
                width: 64,
                height: 64,
                borderRadius: 999,
                background: 'var(--color-success-chip-bg)',
                color: 'var(--color-success)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--font-size-xl)',
                fontWeight: 700,
                flex: 'none',
              }}
            >
              {data.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
            </span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-text)' }}>{data.name}</h2>
                <StatusPill status={data.status} />
              </div>
              <div style={{ color: 'var(--color-text-muted-2)', fontSize: 'var(--font-size-sm)', marginTop: 2 }}>
                {data.code} · {data.designation} · {data.department}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-5)', marginBottom: 'var(--space-6)' }}>
            <div>
              <label style={{ fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-muted-2)', fontWeight: 600 }}>
                Email address
              </label>
              <div style={{ color: 'var(--color-text)', fontSize: 'var(--font-size-sm)', marginTop: 4, fontWeight: 500 }}>
                {data.email}
              </div>
            </div>

            <div>
              <label style={{ fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-muted-2)', fontWeight: 600 }}>
                Reporting Manager
              </label>
              <div style={{ color: 'var(--color-text)', fontSize: 'var(--font-size-sm)', marginTop: 4, fontWeight: 500 }}>
                {data.manager}
              </div>
            </div>

            <div>
              <label style={{ fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-muted-2)', fontWeight: 600 }}>
                Joining Date
              </label>
              <div style={{ color: 'var(--color-text)', fontSize: 'var(--font-size-sm)', marginTop: 4, fontWeight: 500 }}>
                {fmtDate(data.joiningDate)}
              </div>
            </div>

            <div>
              <label style={{ fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-muted-2)', fontWeight: 600 }}>
                Role
              </label>
              <div style={{ color: 'var(--color-text)', fontSize: 'var(--font-size-sm)', marginTop: 4, fontWeight: 500, textTransform: 'capitalize' }}>
                {data.role}
              </div>
            </div>
          </div>

          <form onSubmit={handleSavePhone} style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-5)' }}>
            <div className="field">
              <label className="field-label" htmlFor="profile-phone">
                Phone number (editable)
              </label>
              <div style={{ display: 'flex', gap: 'var(--space-3)', maxWidth: 360, marginTop: 4 }}>
                <input
                  id="profile-phone"
                  className="field-input"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Button type="submit" disabled={updateMutation.isPending || phone === (data.phone ?? '')}>
                  {updateMutation.isPending ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </div>

            {successMsg && <p style={{ color: 'var(--color-success)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-3)' }}>{successMsg}</p>}
            {errorMsg && <p style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-3)' }}>{errorMsg}</p>}
          </form>
        </div>
      )}
    </div>
  );
}
