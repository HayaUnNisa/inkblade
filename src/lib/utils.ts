/** Deterministic PRNG so generated art/data is stable between reloads */
export function seeded(seed: string | number) {
  let h = typeof seed === 'number' ? seed : 0;
  if (typeof seed === 'string') for (let i = 0; i < seed.length; i++) h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

export function compact(n: number) {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

export function timeAgo(iso: string, now = Date.now()) {
  const s = Math.max(1, Math.round((now - new Date(iso).getTime()) / 1000));
  const units: [number, string][] = [
    [31536000, 'y'], [2592000, 'mo'], [604800, 'w'], [86400, 'd'], [3600, 'h'], [60, 'm'],
  ];
  for (const [sec, label] of units) if (s >= sec) return `${Math.floor(s / sec)}${label} ago`;
  return 'just now';
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function isNew(iso: string, days = 3) {
  return Date.now() - new Date(iso).getTime() < days * 86400000;
}
