import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef, useState } from 'react';

import { useIstClock } from '../../../lib/useIstClock.js';

const WEEK_BASE = [
  { name: 'Mon', fill: 'var(--color-success)', label: 'Mon: present' },
  { name: 'Tue', fill: 'var(--color-success)', label: 'Tue: present' },
  { name: 'Wed', fill: 'var(--color-warning)', label: 'Wed: half day' },
];

// M1 (hero load story, power3.out, ≤6s total) + M2 (IST clock, paused when hidden).
export function Hero() {
  const clock = useIstClock();
  const [checkedIn, setCheckedIn] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [leaveStatus, setLeaveStatus] = useState('pending');
  const [rowVisible, setRowVisible] = useState(true);
  const [presentToday, setPresentToday] = useState(11);
  const [pendingRequests, setPendingRequests] = useState(3);
  const [announce, setAnnounce] = useState('');
  const [reduced, setReduced] = useState(false);

  const frameRef = useRef(null);
  const headlineRefs = useRef([]);
  const subRef = useRef(null);
  const actionsRef = useRef(null);
  const managerRowRef = useRef(null);
  const timelineRef = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: reduce)', () => {
      setReduced(true);
      setCheckedIn(true);
      setPresentToday(12);
      setPendingRequests(2);
      setLeaveStatus('approved');
      setRowVisible(false);
      gsap.set([...headlineRefs.current, subRef.current, actionsRef.current, frameRef.current], { clearProps: 'all' });
    });

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      setReduced(false);
      playStory();
      return () => timelineRef.current?.kill();
    });

    return () => mm.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function playStory() {
    timelineRef.current?.kill();
    setCheckedIn(false);
    setPresentToday(11);
    setPendingRequests(3);
    setLeaveStatus('pending');
    setRowVisible(true);
    setElapsed(0);
    setAnnounce('');

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(headlineRefs.current, { yPercent: 110 }, { yPercent: 0, duration: 0.6, stagger: 0.08 }, 0.05)
      .fromTo(subRef.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5 }, 0.3)
      .fromTo(actionsRef.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5 }, 0.4)
      .fromTo(frameRef.current, { opacity: 0, y: 24, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.8 }, 0.5)
      .call(() => {
        setCheckedIn(true);
        setPresentToday(12);
        setElapsed(0);
        setAnnounce('Riya checked in at 9:02 AM');
      }, null, 1.9)
      .call(() => {
        if (managerRowRef.current) gsap.from(managerRowRef.current, { opacity: 0, x: 16, duration: 0.45, ease: 'power3.out' });
      }, null, 2.9)
      .call(() => {
        setLeaveStatus('approved');
        setPendingRequests(2);
        setAnnounce('Leave approved');
      }, null, 4.1)
      .call(() => {
        if (managerRowRef.current) {
          gsap.to(managerRowRef.current, { opacity: 0, x: 24, duration: 0.35, ease: 'power2.inOut', onComplete: () => setRowVisible(false) });
        } else {
          setRowVisible(false);
        }
      }, null, 4.9);
    timelineRef.current = tl;
  }

  const handleManualCheckIn = () => {
    setCheckedIn(true);
    setElapsed(0);
    setPresentToday(12);
    setAnnounce('Riya checked in at 9:02 AM');
  };

  const handleManualApprove = () => {
    setLeaveStatus('approved');
    setPendingRequests(2);
    setAnnounce('Leave approved');
    if (managerRowRef.current && !reduced) {
      gsap.to(managerRowRef.current, { opacity: 0, x: 24, duration: 0.35, ease: 'power2.inOut', onComplete: () => setRowVisible(false) });
    } else {
      setRowVisible(false);
    }
  };

  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        padding: 'calc(76px + 48px) 24px 0',
        background: 'linear-gradient(180deg, #D9F2E4 0%, #E8F5EE 46%, var(--color-bg) 100%)',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1
          style={{
            maxWidth: 'min(100%, 17em)',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 'clamp(2.441rem, 6.2vw, 4.5rem)',
            lineHeight: 1.02,
            letterSpacing: '-0.03em',
            color: 'var(--color-text)',
          }}
        >
          {['Attendance and leave,', 'with the rules', 'built in.'].map((line, i) => (
            <span key={line} style={{ display: 'block', overflow: 'hidden', paddingBottom: '0.06em' }}>
              <span ref={(el) => (headlineRefs.current[i] = el)} style={{ display: 'block' }}>
                {line}
              </span>
            </span>
          ))}
        </h1>
        <p ref={subRef} style={{ marginTop: 24, maxWidth: '58ch', fontSize: 'clamp(1rem, 1.6vw, 1.25rem)', color: 'var(--color-text-muted)' }}>
          Stafy is a small HR system for growing teams. People check in, request time off and get approvals, and the server decides who can see and approve what.
        </p>
        <div ref={actionsRef} style={{ marginTop: 32, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 24 }}>
          <a
            href="/login"
            style={{ display: 'inline-flex', alignItems: 'center', minHeight: 48, padding: '0 24px', borderRadius: 10, background: 'var(--color-primary)', color: '#fff', textDecoration: 'none', fontSize: 17, fontWeight: 600, boxShadow: 'var(--shadow-md)' }}
          >
            Try the live demo
          </a>
          <a href="#rules" style={{ fontSize: 17, fontWeight: 500, color: 'var(--color-accent)' }}>
            See the rules we enforce
          </a>
        </div>
        <p style={{ marginTop: 16, fontSize: 14, color: 'var(--color-text-muted-2)' }}>Demo accounts for HR, manager and employee, no sign-up needed.</p>

        <div
          ref={frameRef}
          style={{
            marginTop: 48,
            position: 'relative',
            maxWidth: 1280,
            border: '1px solid var(--color-border)',
            borderRadius: 24,
            background: 'var(--color-surface-2)',
            padding: 'clamp(12px, 1.6vw, 20px)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '4px 8px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-text-muted-2)', fontWeight: 500 }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--color-success)' }} />
              <span>Live demo data</span>
            </div>
            <button
              type="button"
              onClick={() => !reduced && playStory()}
              aria-label="Replay the hero sequence"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 36, padding: '0 12px', background: '#fff', border: '1px solid var(--color-border)', borderRadius: 999, fontSize: 13, fontWeight: 500, color: 'var(--color-text-muted)', cursor: 'pointer' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 12a9 9 0 1 0 3-6.7" />
                <path d="M3 4v4h4" />
              </svg>
              Replay
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 'clamp(12px, 1.4vw, 16px)', alignItems: 'start' }}>
            <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <p style={{ fontSize: 13, color: 'var(--color-text-muted-2)' }}>Employee</p>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 20, letterSpacing: '-0.01em' }}>Good morning, Riya</p>
                </div>
                <span aria-hidden="true" style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 999, background: 'var(--color-success-chip-bg)', color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 14 }}>
                  RS
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, fontVariantNumeric: 'tabular-nums' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--font-size-3xl)', letterSpacing: '-0.02em' }}>{clock}</span>
                <span style={{ fontSize: 13, color: 'var(--color-text-muted-2)' }}>IST</span>
              </div>
              {!checkedIn ? (
                <button
                  type="button"
                  onClick={handleManualCheckIn}
                  style={{ minHeight: 48, padding: '0 20px', borderRadius: 10, border: 0, background: 'var(--color-primary)', color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer', width: '100%' }}
                >
                  Check in
                </button>
              ) : (
                <div style={{ minHeight: 48, borderRadius: 10, background: 'var(--color-success-chip-bg)', border: '1px solid var(--color-success-chip-hairline)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '0 16px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, color: 'var(--color-primary)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 12.5l5 5L20 6.5" />
                    </svg>
                    Checked in 9:02 AM
                  </span>
                  <span style={{ fontSize: 14, color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums' }}>{elapsed}s elapsed</span>
                </div>
              )}
              <div>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted-2)', marginBottom: 8 }}>This week</p>
                <ul style={{ display: 'flex', gap: 8 }}>
                  {[...WEEK_BASE, { name: 'Thu', fill: checkedIn ? 'var(--color-success)' : 'var(--color-surface-2)', label: `Thu: ${checkedIn ? 'present' : 'not checked in'}` }].map((day) => (
                    <li key={day.name} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <span aria-label={day.label} role="img" style={{ display: 'block', width: '100%', height: 36, borderRadius: 999, background: day.fill }} />
                      <span style={{ fontSize: 12, color: 'var(--color-text-muted-2)', fontWeight: 500 }}>{day.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 1.4vw, 16px)' }}>
              <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <p style={{ fontSize: 13, color: 'var(--color-text-muted-2)' }}>Leave request</p>
                  {leaveStatus === 'pending' ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: 'var(--color-warning-chip-bg)', color: 'var(--color-warning-chip-text)', fontSize: 13, fontWeight: 600 }}>
                      <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--color-warning)' }} />
                      Pending
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: 'var(--color-success-chip-bg)', color: 'var(--color-success)', fontSize: 13, fontWeight: 600 }}>
                      <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--color-success)' }} />
                      Approved
                    </span>
                  )}
                </div>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 20, letterSpacing: '-0.01em' }}>Casual leave</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontVariantNumeric: 'tabular-nums' }}>
                  <span style={{ padding: '6px 10px', borderRadius: 6, background: 'var(--color-surface-2)', fontSize: 14, fontWeight: 500 }}>18 Sep</span>
                  <span aria-hidden="true" style={{ color: 'var(--color-text-muted-2)' }}>to</span>
                  <span style={{ padding: '6px 10px', borderRadius: 6, background: 'var(--color-surface-2)', fontSize: 14, fontWeight: 500 }}>19 Sep</span>
                  <span style={{ fontSize: 14, color: 'var(--color-text-muted-2)' }}>2 days</span>
                </div>
                <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>Reason: family function out of town.</p>
              </div>
              <div className="card" style={{ padding: 20 }}>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted-2)', marginBottom: 14 }}>HR counters</p>
                <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, fontVariantNumeric: 'tabular-nums' }}>
                  <li>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--font-size-3xl)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {presentToday}
                      <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--color-success)' }} />
                    </p>
                    <p style={{ fontSize: 13, color: 'var(--color-text-muted-2)' }}>Present today</p>
                  </li>
                  <li>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--font-size-3xl)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 6 }}>
                      2<span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--color-info)' }} />
                    </p>
                    <p style={{ fontSize: 13, color: 'var(--color-text-muted-2)' }}>On leave</p>
                  </li>
                  <li>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--font-size-3xl)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {pendingRequests}
                      <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--color-warning)' }} />
                    </p>
                    <p style={{ fontSize: 13, color: 'var(--color-text-muted-2)' }}>Pending requests</p>
                  </li>
                </ul>
              </div>
            </div>

            <div style={{ background: 'var(--color-dark)', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <p style={{ fontSize: 13, color: 'var(--color-on-dark-muted)' }}>Manager approvals</p>
                <span style={{ fontSize: 13, color: '#fff', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{rowVisible ? '1 waiting' : '0 waiting'}</span>
              </div>
              {rowVisible ? (
                <div ref={managerRowRef} style={{ background: 'var(--color-primary)', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span aria-hidden="true" style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 999, background: 'var(--color-success)', color: 'var(--color-dark)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13 }}>
                      AM
                    </span>
                    <div>
                      <p style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>Arjun Mehta</p>
                      <p style={{ color: 'var(--color-on-dark-muted)', fontSize: 13 }}>Team Design</p>
                    </div>
                  </div>
                  <p style={{ color: 'var(--color-success-chip-bg)', fontSize: 14, fontVariantNumeric: 'tabular-nums' }}>Casual leave, 18–19 Sep, 2 days</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" onClick={handleManualApprove} style={{ flex: 1, minHeight: 44, borderRadius: 10, border: 0, background: 'var(--color-success-chip-bg)', color: 'var(--color-primary)', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                      Approve
                    </button>
                    <button type="button" onClick={handleManualApprove} style={{ flex: 1, minHeight: 44, borderRadius: 10, border: '1px solid var(--color-dark-border-2)', background: 'transparent', color: 'var(--color-success-chip-bg)', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                      Reject with reason
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ border: '1px dashed var(--color-dark-border-2)', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <p style={{ color: '#fff', fontSize: 15, fontWeight: 600 }}>Nothing waiting on you</p>
                  <p style={{ color: 'var(--color-on-dark-muted)', fontSize: 14 }}>Riya&rsquo;s leave was approved. The balance and dashboards updated.</p>
                </div>
              )}
              <div style={{ marginTop: 'auto', display: 'flex', gap: 6 }} aria-hidden="true">
                {['var(--color-success)', 'var(--color-success)', 'var(--color-warning)', 'var(--color-success)', 'var(--color-dark-border-2)'].map((c, i) => (
                  <span key={i} style={{ flex: 1, height: 10, borderRadius: 999, background: c }} />
                ))}
              </div>
            </div>
          </div>
        </div>
        <p aria-live="polite" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clipPath: 'inset(50%)' }}>
          {announce}
        </p>
      </div>
    </section>
  );
}
