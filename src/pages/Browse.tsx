import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Grid3x3, List, Search, SlidersHorizontal, X } from 'lucide-react';
import { catalog, genres, latestChapter } from '@/data/catalog';
import type { Status } from '@/data/types';
import { cn, timeAgo } from '@/lib/utils';
import SeriesCard from '@/components/SeriesCard';
import Cover from '@/components/Cover';
import { SplitHeading } from '@/components/Reveal';

const sorts = { updated: 'Recently updated', newest: 'Newest series', az: 'A – Z' } as const;
type SortKey = keyof typeof sorts;
const statuses: (Status | 'All')[] = ['All', 'Ongoing', 'Completed', 'Hiatus'];

export default function Browse() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const selected = params.getAll('genre');
  const status = (params.get('status') ?? 'All') as Status | 'All';
  const requestedSort = params.get('sort') ?? 'updated';
  const sort: SortKey = Object.prototype.hasOwnProperty.call(sorts, requestedSort) ? requestedSort as SortKey : 'updated';
  const view = params.get('view') === 'list' ? 'list' : 'grid';

  const update = (fn: (p: URLSearchParams) => void) => {
    const p = new URLSearchParams(params);
    fn(p);
    setParams(p, { replace: true });
  };
  const toggleGenre = (g: string) =>
    update((p) => {
      const cur = p.getAll('genre');
      p.delete('genre');
      (cur.includes(g) ? cur.filter((x) => x !== g) : [...cur, g]).forEach((x) => p.append('genre', x));
    });

  const results = useMemo(() => {
    const term = q.toLowerCase().trim();
    const list = catalog.filter(
      (s) =>
        (!term || [s.title, s.altTitle, s.author, s.artist].some((f) => f.toLowerCase().includes(term))) &&
        selected.every((g) => s.genres.includes(g)) &&
        (status === 'All' || s.status === status),
    );
    const by: Record<SortKey, (a: typeof catalog[0], b: typeof catalog[0]) => number> = {
      updated: (a, b) => +new Date(latestChapter(b).date) - +new Date(latestChapter(a).date),
      newest: (a, b) => b.year - a.year,
      az: (a, b) => a.title.localeCompare(b.title),
    };
    return list.sort(by[sort]);
  }, [q, selected.join(','), status, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  const active = selected.length + (status !== 'All' ? 1 : 0) + (q ? 1 : 0);

  return (
    <div className="page-x pb-10 pt-32">
      <header className="relative">
        <span aria-hidden className="pointer-events-none absolute -top-6 right-0 select-none font-brush text-[8rem] leading-none text-accent/10 sm:text-[11rem]">探</span>
        <p className="eyebrow">Library · {catalog.length} series</p>
        <h1 className="mt-4 font-display text-5xl font-extrabold sm:text-6xl"><SplitHeading text="Browse the archive" /></h1>
        <p className="mt-4 max-w-xl text-muted">Filter by genre, status and more. Every filter lives in the URL — share a link and your friend sees the exact same shelf.</p>
      </header>

      {/* controls */}
      <div className="sticky top-[76px] z-30 mt-10 -mx-2 rounded-2xl px-2 py-3 backdrop-blur-xl" style={{ background: 'rgb(var(--bg) / .75)' }}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={q}
              onChange={(e) => update((p) => (e.target.value ? p.set('q', e.target.value) : p.delete('q')))}
              placeholder="Search by title, author, artist…"
              className="input rounded-full pl-11"
              aria-label="Search series"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-full border hairline p-1">
              {statuses.map((s) => (
                <button key={s} onClick={() => update((p) => (s === 'All' ? p.delete('status') : p.set('status', s)))} className={cn('relative rounded-full px-3.5 py-1.5 text-xs font-bold', status === s ? 'text-white' : 'text-muted hover:text-ink')}>
                  {status === s && <motion.span layoutId="status-pill" className="absolute inset-0 rounded-full bg-accent" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
                  <span className="relative">{s}</span>
                </button>
              ))}
            </div>
            <label className="relative">
              <span className="sr-only">Sort</span>
              <SlidersHorizontal size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <select value={sort} onChange={(e) => update((p) => p.set('sort', e.target.value))} className="input cursor-pointer appearance-none rounded-full py-2.5 pl-9 pr-8 text-xs font-bold">
                {Object.entries(sorts).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </label>
            <div className="flex rounded-full border hairline p-1">
              {(['grid', 'list'] as const).map((v) => (
                <button key={v} aria-label={`${v} view`} onClick={() => update((p) => p.set('view', v))} className={cn('grid h-8 w-8 place-items-center rounded-full transition-colors', view === v ? 'bg-ink text-bg' : 'text-muted')}>
                  {v === 'grid' ? <Grid3x3 size={14} /> : <List size={14} />}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          {genres.map((g) => (
            <button key={g} onClick={() => toggleGenre(g)} className={cn('chip shrink-0', selected.includes(g) && 'chip-active')}>
              {selected.includes(g) && <X size={11} />}{g}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between text-sm">
        <p className="text-muted"><span className="font-bold text-ink">{results.length}</span> {results.length === 1 ? 'series' : 'series'} found</p>
        {active > 0 && <button onClick={() => setParams({}, { replace: true })} className="font-semibold text-accent hover:underline">Clear filters</button>}
      </div>

      {results.length === 0 ? (
        <div className="flex flex-col items-center py-24 text-center">
          <span className="font-brush text-7xl text-accent/40">無</span>
          <p className="mt-4 font-display text-2xl font-bold">No series match those filters</p>
          <p className="mt-2 text-muted">Try removing a genre or searching a different title.</p>
        </div>
      ) : view === 'grid' ? (
        <motion.div layout className="mt-6 grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
          <AnimatePresence mode="popLayout">
            {results.map((s) => (
              <motion.div key={s.slug} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
                <SeriesCard series={s} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.ul layout className="mt-6 space-y-3">
          <AnimatePresence mode="popLayout">
            {results.map((s) => {
              const last = latestChapter(s);
              return (
                <motion.li key={s.slug} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <Link to={`/series/${s.slug}`} className="group flex gap-5 rounded-2xl border hairline bg-card/40 p-3 transition-all hover:border-accent/50 sm:p-4">
                    <div className="halftone h-32 w-[86px] shrink-0 overflow-hidden rounded-lg"><Cover series={s} showTitle={false} /></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-xl font-bold group-hover:text-accent">{s.title}</h3>
                        <span className="font-brush text-sm text-muted">{s.altTitle}</span>
                      </div>
                      <p className="text-xs text-muted">{s.author} · {s.year} · {s.status}</p>
                      <p className="mt-2 line-clamp-2 text-sm text-muted">{s.synopsis}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold">
                        <span>{s.chapters.length} chapters</span>
                        
                        <span className="text-muted">Ch. {last.number} · {timeAgo(last.date)}</span>
                        <span className="hidden gap-1.5 sm:flex">{s.genres.map((g) => <span key={g} className="rounded-full bg-line/5 px-2 py-0.5">{g}</span>)}</span>
                      </div>
                    </div>
                  </Link>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  );
}
