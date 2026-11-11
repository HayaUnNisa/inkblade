import { memo, useMemo } from 'react';
import { seeded } from '@/lib/utils';

interface Rect { x: number; y: number; w: number; h: number }

/** Splits the page into manga-style panels recursively. */
function layout(r: () => number): Rect[] {
  const out: Rect[] = [];
  const split = (rect: Rect, depth: number) => {
    if (depth > 2 || (depth > 0 && r() < 0.3) || rect.w < 220 || rect.h < 220) { out.push(rect); return; }
    const horiz = rect.h > rect.w ? r() < 0.8 : r() < 0.3;
    const t = 0.35 + r() * 0.3;
    const g = 14;
    if (horiz) {
      const h1 = rect.h * t;
      split({ x: rect.x, y: rect.y, w: rect.w, h: h1 - g / 2 }, depth + 1);
      split({ x: rect.x, y: rect.y + h1 + g / 2, w: rect.w, h: rect.h - h1 - g / 2 }, depth + 1);
    } else {
      const w1 = rect.w * t;
      split({ x: rect.x, y: rect.y, w: w1 - g / 2, h: rect.h }, depth + 1);
      split({ x: rect.x + w1 + g / 2, y: rect.y, w: rect.w - w1 - g / 2, h: rect.h }, depth + 1);
    }
  };
  split({ x: 40, y: 40, w: 720, h: 1120 }, 0);
  return out;
}

/** Original generated manga page — shown until real page artwork is uploaded. */
function PlaceholderPage({ seed, page, total, accent, title, kanji }: { seed: string; page: number; total: number; accent: string; title: string; kanji: string }) {
  const data = useMemo(() => {
    const r = seeded(`${seed}-${page}`);
    const panels = layout(r).map((p, i) => ({
      ...p,
      kind: Math.floor(r() * 4),
      cx: p.x + p.w * (0.2 + r() * 0.6),
      cy: p.y + p.h * (0.2 + r() * 0.6),
      bubble: r() < 0.55,
      bx: p.x + 30 + r() * Math.max(10, p.w - 200),
      by: p.y + 30 + r() * Math.max(10, p.h * 0.3),
      i,
    }));
    return panels;
  }, [seed, page]);

  const isCover = page === 0;

  return (
    <svg viewBox="0 0 800 1200" className="h-full w-full bg-white" role="img" aria-label={`Page ${page + 1} of ${total}`}>
      <defs>
        <pattern id={`ht-${seed}-${page}`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <circle cx="3.5" cy="3.5" r="1.6" fill="#111" />
        </pattern>
      </defs>
      <rect width="800" height="1200" fill="#fbfaf7" />
      {isCover ? (
        <g>
          <rect x="40" y="40" width="720" height="1120" fill="#0b0a10" />
          <circle cx="520" cy="380" r="210" fill={accent} />
          <rect x="40" y="40" width="720" height="1120" fill={`url(#ht-${seed}-${page})`} opacity="0.12" />
          <text x="400" y="760" textAnchor="middle" fontFamily="'Yuji Syuku', serif" fontSize="260" fill="#fff">{kanji}</text>
          <line x1="40" y1="980" x2="760" y2="560" stroke="#fff" strokeWidth="6" />
          <text x="80" y="1060" fontFamily="'Shippori Mincho B1', serif" fontWeight="800" fontSize="54" fill="#fff">{title}</text>
          <text x="80" y="1110" fontFamily="'JetBrains Mono', monospace" fontSize="20" letterSpacing="6" fill={accent}>CHAPTER OPENING</text>
        </g>
      ) : (
        data.map((p) => (
          <g key={p.i}>
            <clipPath id={`c-${seed}-${page}-${p.i}`}><rect x={p.x} y={p.y} width={p.w} height={p.h} /></clipPath>
            <g clipPath={`url(#c-${seed}-${page}-${p.i})`}>
              <rect x={p.x} y={p.y} width={p.w} height={p.h} fill="#fff" />
              {p.kind === 0 && Array.from({ length: 40 }, (_, k) => {
                const a = (k / 40) * Math.PI * 2;
                return <line key={k} x1={p.cx} y1={p.cy} x2={p.cx + Math.cos(a) * 900} y2={p.cy + Math.sin(a) * 900} stroke="#111" strokeWidth={k % 3 ? 1 : 3} opacity="0.55" />;
              })}
              {p.kind === 1 && <rect x={p.x} y={p.y + p.h * 0.55} width={p.w} height={p.h} fill={`url(#ht-${seed}-${page})`} opacity="0.35" />}
              {p.kind === 2 && Array.from({ length: 26 }, (_, k) => (
                <line key={k} x1={p.x - 100} y1={p.y + k * 40} x2={p.x + p.w + 100} y2={p.y + k * 40 - 180} stroke="#111" strokeWidth="1.5" opacity="0.4" />
              ))}
              {p.kind === 3 && <circle cx={p.cx} cy={p.cy} r={Math.min(p.w, p.h) * 0.35} fill="#111" opacity="0.9" />}
              {/* silhouette */}
              <path d={`M${p.cx - 40} ${p.y + p.h} Q ${p.cx - 30} ${p.cy + 20} ${p.cx} ${p.cy - 10} Q ${p.cx + 34} ${p.cy + 20} ${p.cx + 46} ${p.y + p.h} Z`} fill="#111" opacity={p.kind === 3 ? 0 : 0.85} />
              <circle cx={p.cx + 2} cy={p.cy - 34} r="24" fill="#111" opacity={p.kind === 3 ? 0 : 0.85} />
              {p.i === 1 && <line x1={p.x} y1={p.y + p.h} x2={p.x + p.w} y2={p.y} stroke={accent} strokeWidth="5" />}
              {p.bubble && (
                <g>
                  <ellipse cx={p.bx + 80} cy={p.by + 40} rx="90" ry="46" fill="#fff" stroke="#111" strokeWidth="3" />
                  <rect x={p.bx + 30} y={p.by + 28} width="100" height="6" rx="3" fill="#111" opacity="0.7" />
                  <rect x={p.bx + 40} y={p.by + 44} width="80" height="6" rx="3" fill="#111" opacity="0.45" />
                </g>
              )}
            </g>
            <rect x={p.x} y={p.y} width={p.w} height={p.h} fill="none" stroke="#111" strokeWidth="5" />
          </g>
        ))
      )}
      <text x="400" y="1188" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="15" fill="#999">— {page + 1} —</text>
    </svg>
  );
}

export default memo(PlaceholderPage);
