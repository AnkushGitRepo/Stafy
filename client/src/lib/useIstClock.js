import { useEffect, useState } from 'react';

function formatIst(date) {
  const ist = new Date(date.getTime() + (date.getTimezoneOffset() + 330) * 60000);
  let h = ist.getHours();
  const m = String(ist.getMinutes()).padStart(2, '0');
  const ap = h < 12 ? 'AM' : 'PM';
  h = h % 12 || 12;
  return `${h}:${m} ${ap}`;
}

/** Live-ticking IST clock string, e.g. "9:02 AM". Pauses while the tab is hidden. */
export function useIstClock() {
  const [clock, setClock] = useState(() => formatIst(new Date()));

  useEffect(() => {
    const id = setInterval(() => {
      if (!document.hidden) setClock(formatIst(new Date()));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return clock;
}
