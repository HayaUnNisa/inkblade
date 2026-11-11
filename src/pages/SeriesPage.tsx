import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDownUp, BookOpen, Bookmark, CheckCircle2, Play, Search, Share2 } from 'lucide-react';
import { catalog, getSeries, latestChapter } from '@/data/catalog';
import { useLibrary } from '@/context/LibraryContext';
import { useToast } from '@/context/ToastContext';
import { cn, formatDate, isNew, timeAgo } from '@/lib/utils';
import Cover from '@/components/Cover';
import SeriesCard from '@/components/SeriesCard';
import SectionHeading from '@/components/SectionHeading';
import { Rise } from '@/components/Reveal';
import NotFound from './NotFound';

export default function SeriesPage() {
  const { slug } = useParams();
  const s = getSeries(slug);
  const { isBookmarked, toggleBookmark, lastRead, hasRead } = useLibrary();
  const toast = useToast();
  const [tab, setTab] = useState<'chapters' | 'about'>('chapters');
  const [asc, setAsc] = useState(false);
  const [cq, setCq] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [limit, setLimit] = useState(30);
  const { scrollY } = useScroll();
  const bannerY = useTransform(scrollY, [0, 600], [0, 160]);
  const bannerO = useTransform(scrollY, [0, 500], [1, 0.3]);

  const chapters = useMemo(() => {
    if (!s) return [];
    const term = cq.trim().toLowerCase();
    const list = s.chapters.filter((c) => !term || String(c.number).includes(term) || c.title.toLowerCase().includes(term));
    return asc ? list : [...list].reverse();
  }, [s, cq, asc]);

  if (!s) return <NotFound />;
  const marked = isBookmarked(s.slug);
  const last = latestChapter(s);
  const resume = lastRead(s.slug);
  const related = catalog.filter((x) => x.slug !== s.slug && x.genres.some((g) => s.genres.includes(g))).slice(0, 6);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: s.title, url });
      else { await navigator.clipboard.writeText(url); toast('Link copied to clipboard'); }
    } catch { /* cancelled */ }
  };

  return (
    <div>
      {/* banner */}
      <section className="relative overflow-hidden pt-28">
        <motion.div aria-hidden style={{ y: bannerY, opacity: bannerO }} className="absolute inset-0 -z-10">
          {s.banner ? (
            <div className="absolute inset-0 scale-110 blur-[2px]" style={{ backgroundImage: `url(${s.banner})`, backgroundSize: 'cover', backgroundPosition: 'center 10%' }} />
          ) : (
            <div className="absolute inset-0 scale-125 opacity-70 blur-3xl"><Cover series={s} showTitle={false} /></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-bg/40 via-bg/80 to-bg" />
        </motion.div>
        <span aria-hidden className="vertical-jp pointer-events-none absolute right-6 top-28 hidden font-brush text-5xl text-ink/15 lg:block">{s.altTitle}</span>

        <div className="page-x grid gap-10 pb-10 md:grid-cols-[260px_1fr] lg:grid-cols-[300px_1fr]">
          <motion.div initial={{ opacity: 0, y: 30, rotate: -3 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ delay: 0.35, duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="mx-auto w-56 md:w-full">
            <div className="panel-frame aspect-[2/3] overflow-hidden rounded-lg"><Cover series={s} /></div>
          </motion.div>
          <div className="self-end">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.8 }}>
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn('rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider', s.status === 'Ongoing' ? 'bg-emerald-500/15 text-emerald-500' : s.status === 'Completed' ? 'bg-sky-500/15 text-sky-500' : 'bg-amber-500/15 text-amber-500')}>{s.status}</span>
                <span className="font-mono text-xs text-muted">{s.year} · Updates {s.schedule}</span>
              </div>
              <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight sm:text-6xl">{s.title}</h1>
              <p className="mt-1 font-brush text-2xl text-accent">{s.altTitle}</p>
              <p className="mt-3 text-sm text-muted">Story by <span className="font-semibold text-ink">{s.author}</span>{s.artist !== s.author && <> · Art by <span className="font-semibold text-ink">{s.artist}</span></>}</p>
              <div className="mt-5 flex flex-wrap gap-2">{s.genres.map((g) => <Link key={g} to={`/browse?genre=${encodeURIComponent(g)}`} className="chip">{g}</Link>)}</div>
              <dl className="mt-6 flex flex-wrap gap-6 text-sm">
                {[[BookOpen, s.chapters.length, 'chapters'], [BookOpen, s.chapters.reduce((n, c) => n + c.pages.length, 0), 'pages']].map(([I, v, l]) => {
                  const Icon = I as typeof BookOpen;
                  return <div key={l as string} className="flex items-center gap-2"><Icon size={16} className="text-accent" /><dd className="font-bold">{v as string}</dd><dt className="text-muted">{l as string}</dt></div>;
                })}
              </dl>
              <div className="mt-8 flex flex-wrap gap-3">
                {resume ? (
                  <Link to={`/read/${s.slug}/${resume.chapter}?page=${resume.page}`} className="btn btn-primary"><Play size={16} className="fill-white" /> Continue Ch. {resume.chapter}</Link>
                ) : (
                  <Link to={`/read/${s.slug}/${s.chapters[0].number}`} className="btn btn-primary"><Play size={16} className="fill-white" /> Start reading</Link>
                )}
                <Link to={`/read/${s.slug}/${last.number}`} className="btn btn-ghost">Latest · Ch. {last.number}</Link>
                <button onClick={() => toast(toggleBookmark(s.slug) ? 'Added to your library' : 'Removed from library')} className={cn('btn', marked ? 'btn-primary' : 'btn-ghost')} aria-pressed={marked}>
                  <Bookmark size={16} className={marked ? 'fill-white' : ''} /> {marked ? 'In library' : 'Add to library'}
                </button>
                <button onClick={share} className="btn btn-ghost px-4" aria-label="Share"><Share2 size={16} /></button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* tabs */}
      <section className="page-x">
        <div className="flex gap-8 border-b hairline">
          {(['chapters', 'about'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cn('relative pb-4 font-display text-lg font-bold capitalize transition-colors', tab === t ? 'text-ink' : 'text-muted hover:text-ink')}>
              {t === 'chapters' ? `Chapters (${s.chapters.length})` : 'About'}
              {tab === t && <motion.span layoutId="series-tab" className="absolute inset-x-0 -bottom-px h-[3px] rounded-full bg-accent" />}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'chapters' ? (
            <motion.div key="ch" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="relative w-full max-w-xs">
                  <Search size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                  <input value={cq} onChange={(e) => setCq(e.target.value)} placeholder="Find chapter…" className="input rounded-full py-2.5 pl-10" aria-label="Find chapter" />
                </div>
                <button onClick={() => setAsc((a) => !a)} className="chip py-2"><ArrowDownUp size={13} /> {asc ? 'Oldest first' : 'Newest first'}</button>
              </div>
              <ul className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {chapters.slice(0, limit).map((c) => {
                  const read = hasRead(s.slug, c.number);
                  return (
                    <li key={c.number}>
                      <Link to={`/read/${s.slug}/${c.number}`} className={cn('group flex items-center gap-4 rounded-xl border hairline px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-accent/50', read ? 'bg-transparent opacity-60' : 'bg-card/50')}>
                        <span className="w-12 font-display text-xl font-extrabold text-ink/30 transition-colors group-hover:text-accent">{c.number}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">{c.title}</span>
                          <span className="block text-xs text-muted">{timeAgo(c.date)}</span>
                        </span>
                        {isNew(c.date) && <span className="stamp">New</span>}
                        {read && <CheckCircle2 size={16} className="text-accent" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              {chapters.length > limit && (
                <div className="mt-6 text-center"><button onClick={() => setLimit((l) => l + 60)} className="btn btn-ghost">Show more chapters ({chapters.length - limit} left)</button></div>
              )}
              {chapters.length === 0 && <p className="py-12 text-center text-muted">No chapters match “{cq}”.</p>}
            </motion.div>
          ) : (
            <motion.div key="ab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="mt-8 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
              <div>
                <h3 className="font-display text-2xl font-bold">Synopsis</h3>
                <p className={cn('mt-4 text-lg leading-relaxed text-muted', !expanded && 'line-clamp-3')}>{s.synopsis}</p>
                <button onClick={() => setExpanded((e) => !e)} className="mt-2 text-sm font-bold text-accent">{expanded ? 'Show less' : 'Read more'}</button>
              </div>
              <dl className="divide-y hairline rounded-2xl border hairline bg-card/40">
                {[['Author', s.author], ['Artist', s.artist], ['Status', s.status], ['Released', String(s.year)], ['Schedule', `Every ${s.schedule}`], ['Reading', s.direction === 'rtl' ? 'Right to left' : s.direction === 'ltr' ? 'Left to right' : 'Vertical scroll'], ['Last update', formatDate(last.date)]].map(([k, v]) => (
                  <div key={k} className="flex justify-between px-5 py-3 text-sm"><dt className="text-muted">{k}</dt><dd className="font-semibold">{v}</dd></div>
                ))}
              </dl>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {related.length > 0 && (
        <section className="page-x pt-24">
          <SectionHeading eyebrow="If you liked this" title="You may also like" jp="似" />
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
            {related.map((r, i) => <Rise key={r.slug} delay={i * 0.05}><SeriesCard series={r} /></Rise>)}
          </div>
        </section>
      )}
    </div>
  );
}
