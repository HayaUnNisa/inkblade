import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, Eye, Heart, Star } from 'lucide-react';
import { catalog } from '@/data/catalog';
import type { Series } from '@/data/types';
import { cn, compact } from '@/lib/utils';
import Cover from '@/components/Cover';
import { Rise, SplitHeading } from '@/components/Reveal';

const tabs = {
  weekly: { label: 'Weekly', score: (s: Series) => s.weeklyScore, unit: 'pts' },
  monthly: { label: 'Monthly', score: (s: Series) => s.monthlyScore, unit: 'pts' },
  all: { label: 'All time', score: (s: Series) => s.views, unit: 'reads' },
  rated: { label: 'Top rated', score: (s: Series) => s.rating, unit: '★' },
} as const;
type Tab = keyof typeof tabs;

export default function Rankings() {
  const [tab, setTab] = useState<Tab>('weekly');
  const t = tabs[tab];
  const list = [...catalog].sort((a, b) => t.score(b) - t.score(a));
  const [first, second, third] = list;
  const max = t.score(first);
  const fmt = (s: Series) => (tab === 'all' ? compact(t.score(s)) : tab === 'rated' ? s.rating.toFixed(1) : t.score(s));

  return (
    <div className="page-x pb-10 pt-32">
      <header className="relative text-center">
        <span aria-hidden className="pointer-events-none absolute left-1/2 top-[-2rem] -translate-x-1/2 select-none font-brush text-[9rem] leading-none text-accent/10 sm:text-[12rem]">番付</span>
        <p className="eyebrow justify-center">The leaderboard</p>
        <h1 className="mt-4 font-display text-5xl font-extrabold sm:text-6xl"><SplitHeading text="Rankings" /></h1>
        <div className="mx-auto mt-8 inline-flex flex-wrap justify-center rounded-full border hairline p-1">
          {(Object.keys(tabs) as Tab[]).map((k) => (
            <button key={k} onClick={() => setTab(k)} className={cn('relative rounded-full px-5 py-2 text-sm font-bold', tab === k ? 'text-white' : 'text-muted hover:text-ink')}>
              {tab === k && <motion.span layoutId="rk-tab" className="absolute inset-0 rounded-full bg-accent" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
              <span className="relative">{tabs[k].label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* podium */}
      <div className="mx-auto mt-14 grid max-w-3xl grid-cols-3 items-end gap-3 sm:gap-6">
        {[second, first, third].map((s, i) => {
          const place = [2, 1, 3][i];
          return (
            <motion.div key={`${tab}-${s.slug}`} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: [0.15, 0, 0.3][i], duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
              <Link to={`/series/${s.slug}`} className="group block text-center">
                <div className={cn('relative mx-auto overflow-hidden rounded-xl transition-transform duration-500 group-hover:-translate-y-2', place === 1 ? 'panel-frame w-full' : 'w-[85%]')}>
                  <div className="halftone aspect-[2/3]"><Cover series={s} showTitle={false} /></div>
                  {place === 1 && <Crown className="absolute left-1/2 top-3 -translate-x-1/2 fill-amber-400 text-amber-400 drop-shadow-lg" size={30} />}
                </div>
                <p className="mt-3 line-clamp-1 font-display text-sm font-bold group-hover:text-accent sm:text-lg">{s.title}</p>
                <p className="text-xs text-muted">{fmt(s)} {t.unit}</p>
                <div className={cn('mt-3 grid place-items-center rounded-t-xl font-display font-extrabold text-white', place === 1 ? 'h-28 bg-accent text-5xl' : place === 2 ? 'h-20 bg-ink/80 text-4xl text-bg' : 'h-14 bg-ink/50 text-3xl text-bg')}>
                  {place}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <ol className="mx-auto mt-12 max-w-4xl space-y-3">
        {list.slice(3).map((s, i) => (
          <Rise key={`${tab}-${s.slug}`} delay={i * 0.04} y={16}>
            <li>
              <Link to={`/series/${s.slug}`} className="group flex items-center gap-4 rounded-2xl border hairline bg-card/40 p-3 pr-5 transition-colors hover:border-accent/50">
                <span className="w-10 text-center font-display text-3xl font-extrabold text-ink/25 group-hover:text-accent">{i + 4}</span>
                <div className="h-16 w-11 shrink-0 overflow-hidden rounded-md"><Cover series={s} showTitle={false} /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-lg font-bold group-hover:text-accent">{s.title}</p>
                  <div className="mt-1 flex gap-4 text-xs text-muted">
                    <span className="flex items-center gap-1"><Star size={11} className="fill-amber-400 text-amber-400" />{s.rating}</span>
                    <span className="flex items-center gap-1"><Eye size={11} />{compact(s.views)}</span>
                    <span className="hidden items-center gap-1 sm:flex"><Heart size={11} />{compact(s.follows)}</span>
                  </div>
                  <div className="mt-2 h-1 max-w-sm overflow-hidden rounded-full bg-line/10">
                    <motion.div className="h-full bg-accent" initial={{ width: 0 }} animate={{ width: `${(t.score(s) / max) * 100}%` }} transition={{ duration: 1, delay: 0.2 + i * 0.04, ease: [0.22, 1, 0.36, 1] }} />
                  </div>
                </div>
                <span className="font-mono text-sm font-bold">{fmt(s)}</span>
              </Link>
            </li>
          </Rise>
        ))}
      </ol>
    </div>
  );
}
