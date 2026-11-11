import { useMemo, useState } from 'react';
import type { Series } from '@/data/types';
import { cn, seeded } from '@/lib/utils';

/** Shows the series cover image, or an original generated cover when no image is uploaded yet. */
export default function Cover({ series, className, showTitle = true }: { series: Series; className?: string; showTitle?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (series.cover && !failed) {
    return (
      <img
        src={series.cover}
        alt={`${series.title} cover`}
        loading="lazy"
        onError={() => setFailed(true)}
        className={cn('h-full w-full object-cover', className)}
      />
    );
  }
  return <GeneratedCover series={series} className={className} showTitle={showTitle} />;
}

function GeneratedCover({ series, className, showTitle }: { series: Series; className?: string; showTitle: boolean }) {
  const [a, b] = series.palette;
  const id = series.slug;
  const g = useMemo(() => {
    const r = seeded(id);
    return {
      cx: 40 + r() * 120, cy: 50 + r() * 90, cr: 40 + r() * 40,
      slash: -30 - r() * 30, lines: Array.from({ length: 22 }, () => r()),
      kx: 30 + r() * 40,
    };
  }, [id]);

  return (
    <svg viewBox="0 0 200 300" preserveAspectRatio="xMidYMid slice" className={cn('h-full w-full', className)} role="img" aria-label={`${series.title} cover`}>
      <defs>
        <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor={b} />
          <stop offset="1" stopColor="#050409" />
        </linearGradient>
        <radialGradient id={`sun-${id}`}>
          <stop offset="0" stopColor={a} stopOpacity="1" />
          <stop offset="0.7" stopColor={a} stopOpacity="0.75" />
          <stop offset="1" stopColor={a} stopOpacity="0" />
        </radialGradient>
        <pattern id={`dots-${id}`} width="5" height="5" patternUnits="userSpaceOnUse">
          <circle cx="2.5" cy="2.5" r="0.9" fill={a} opacity="0.35" />
        </pattern>
        <linearGradient id={`fade-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.45" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.85" />
        </linearGradient>
      </defs>
      <rect width="200" height="300" fill={`url(#bg-${id})`} />
      <circle cx={g.cx} cy={g.cy} r={g.cr} fill={`url(#sun-${id})`} />
      <rect width="200" height="300" fill={`url(#dots-${id})`} />
      {/* speed lines */}
      <g opacity="0.22" stroke={a} strokeWidth="0.6">
        {g.lines.map((v, i) => (
          <line key={i} x1={g.cx} y1={g.cy} x2={g.cx + Math.cos(v * Math.PI * 2) * 400} y2={g.cy + Math.sin(v * Math.PI * 2) * 400} />
        ))}
      </g>
      <text
        x={g.kx + 60} y="190" textAnchor="middle" fontFamily="'Yuji Syuku', serif" fontSize={series.kanji.length > 1 ? 82 : 130}
        fill={a} opacity="0.92" style={{ writingMode: series.kanji.length > 1 ? 'vertical-rl' : undefined }}
      >
        {series.kanji}
      </text>
      <g transform={`rotate(${g.slash} 100 150)`}>
        <rect x="-60" y="148" width="320" height="2.5" fill="#fff" opacity="0.85" />
        <rect x="-60" y="152" width="320" height="0.8" fill={a} />
      </g>
      <rect width="200" height="300" fill={`url(#fade-${id})`} />
      <text x="186" y="26" textAnchor="end" fontFamily="'JetBrains Mono', monospace" fontSize="7" letterSpacing="2" fill="#fff" opacity="0.7">
        INKBLADE · {series.year}
      </text>
      {showTitle && (
        <>
          <text x="14" y="262" fontFamily="'Shippori Mincho B1', serif" fontWeight="800" fontSize={series.title.length > 22 ? 12 : series.title.length > 16 ? 15 : 19} fill="#fff">
            {series.title}
          </text>
          <text x="14" y="280" fontFamily="Manrope, sans-serif" fontSize="8" fill="#fff" opacity="0.7" letterSpacing="1">
            {series.author.toUpperCase()}
          </text>
        </>
      )}
    </svg>
  );
}
