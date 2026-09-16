import { describe, expect, it } from 'vitest';

import { formatIstDate, formatIstDateTime, formatIstTime, isWorkingDay, workDateInIst } from '../../src/lib/time.js';

describe('isWorkingDay', () => {
  it('treats Monday-Friday as working days', () => {
    expect(isWorkingDay('2026-09-14')).toBe(true); // Monday
    expect(isWorkingDay('2026-09-18')).toBe(true); // Friday
  });

  it('treats Saturday and Sunday as non-working days', () => {
    expect(isWorkingDay('2026-09-19')).toBe(false); // Saturday
    expect(isWorkingDay('2026-09-20')).toBe(false); // Sunday
  });
});

describe('workDateInIst', () => {
  it('returns a YYYY-MM-DD string', () => {
    const result = workDateInIst(new Date('2026-09-16T10:00:00Z'));
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('rolls the date forward across the UTC->IST offset late at night', () => {
    // 2026-09-16 19:00 UTC is 2026-09-17 00:30 IST — the work date should
    // already be the 17th, not the 16th.
    expect(workDateInIst(new Date('2026-09-16T19:00:00Z'))).toBe('2026-09-17');
  });
});

describe('IST formatting helpers', () => {
  it('formats time in IST with lower-case meridiem', () => {
    // 2026-09-16 08:30 UTC is 14:00 (2:00 pm) IST
    const t = formatIstTime(new Date('2026-09-16T08:30:00Z'));
    expect(t).toMatch(/2:00\s*pm/);
  });

  it('formats full date and time in IST', () => {
    const dt = formatIstDateTime(new Date('2026-09-16T08:30:00Z'));
    expect(dt).toContain('16');
    expect(dt).toContain('2026');
  });

  it('formats friendly date in IST', () => {
    const fd = formatIstDate(new Date('2026-09-16T08:30:00Z'));
    expect(fd).toContain('16');
  });
});
