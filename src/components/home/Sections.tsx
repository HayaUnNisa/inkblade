import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, BookOpen, Calendar, ChevronLeft, ChevronRight, Clock, Heart, PenTool, TrendingUp } from 'lucide-react';
import { catalog, genreKanji, genres, getSeries, latestChapter, latestUpdates, weekdays } from '@/data/catalog';
import type { Weekday } from '@/data/types';
import { useTheme } from '@/context/ThemeContext';
import { useLibrary } from '@/context/LibraryContext';
import { cn, isNew, timeAgo } from '@/lib/utils';
import SeriesCard from '../SeriesCard';
import SectionHeading from '../SectionHeading';
import Cover from '../Cover';
import { InkReveal, Rise } from '../Reveal';
import { Marquee } from '../Chrome';

/* ─────────── Ticker ─────────── */
export function Ticker() {
  const items = latestUpdates().slice(0, 8).map(({ series, chapter }) => `${series.title} — Ch. ${chapter.number}`);
  return (
    <div className="relative z-10 -mt-6 -rotate-1 border-y border-accent/40 bg-accent py-3 font-display text-lg font-bold text-white shadow-[0_20px_50px_-20px_rgb(var(--accent)/0.7)]">
      <Marquee items={items} duration={45} />
    </div>
  );
}

/* ─────────── Continue reading ─────────── */
export function ContinueReading() {
  const { history } = useLibrary();
  const items = history.map((h) => ({ h, s: getSeries(h.slug) })).filter((x) => x.s).slice(0, 4);
  if (!items.length) return null;
  return (
    <section className="page-x pt-24">
      <SectionHeading eyebrow="Pick up where you left off" title="Continue reading" jp="続" to="/library" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ h, s }, i) => (
          <Rise key={h.slug} delay={i * 0.06}>
            <Link to={`/read/${h.slug}/${h.chapter}?page=${h.page}`} className="group flex gap-4 rounded-2xl border hairline bg-card/50 p-3 transition-all hover:-translate-y-1 hover:border-accent/50">
              <div className="h-20 w-14 shrink-0 overflow-hidden rounded-lg"><Cover series={s!} showTitle={false} /></div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display font-bold group-hover:text-accent">{s!.title}</p>
                <p className="text-xs text-muted">Chapter {h.chapter} · Page {h.page + 1}/{h.total}</p>
                <div className="mt-3 h-1 overflow-hidden rounded-full bg-line/10">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${((h.page + 1) / h.total) * 100}%` }} />
                </div>
                <p className="mt-1.5 text-[11px] text-muted">{timeAgo(new Date(h.ts).toISOString())}</p>
              </div>
            </Link>
          </Rise>
        ))}
      </div>
    </section>
  );
}

/* ─────────── Trending carousel ─────────── */
export function Trending() {
  const ref = useRef<HTMLDivElement>(null);
  const list = [...catalog].sort((a, b) => +new Date(latestChapter(b).date) - +new Date(latestChapter(a).date));
  const scroll = (d: number) => ref.current?.scrollBy({ left: d * ref.current.clientWidth * 0.8, behavior: 'smooth' });
  return (
    <section className="pt-24">
      <div className="page-x">
        <SectionHeading
          eyebrow="Explore the collection" title="Featured stories" jp="熱"
          action={
            <div className="flex gap-2">
              {[[-1, ChevronLeft], [1, ChevronRight]].map(([d, I]) => {
                const Icon = I as typeof ChevronLeft;
                return (
                  <button key={d as number} onClick={() => scroll(d as number)} aria-label={d === -1 ? 'Previous' : 'Next'} className="grid h-11 w-11 place-items-center rounded-full border hairline transition-all hover:border-accent hover:bg-accent hover:text-white">
                    <Icon size={18} />
                  </button>
                );
              })}
            </div>
          }
        />
      </div>
      <div ref={ref} className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-4 pb-6 sm:px-6 lg:px-[max(2.5rem,calc((100vw-1360px)/2+2.5rem))]">
        {list.map((s, i) => (
          <Rise key={s.slug} delay={Math.min(i, 6) * 0.05} className="w-[46vw] shrink-0 snap-start sm:w-[210px] lg:w-[220px]">
            <SeriesCard series={s} rank={i + 1} />
          </Rise>
        ))}
      </div>
    </section>
  );
}

/* ─────────── Latest + schedule ─────────── */
export function LatestAndSchedule() {
  const updates = latestUpdates().slice(0, 8);
  const today = weekdays[(new Date().getDay() + 6) % 7];
  const [day, setDay] = useState<Weekday>(today);
  const daySeries = catalog.filter((s) => s.schedule === day && s.status === 'Ongoing');

  return (
    <section className="page-x pt-24">
      <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <SectionHeading eyebrow="Fresh off the press" title="Latest chapters" jp="新" to="/browse?sort=updated" />
          <ul className="divide-y hairline overflow-hidden rounded-2xl border hairline bg-card/40">
            {updates.map(({ series, chapter }, i) => (
              <Rise key={series.slug} delay={i * 0.04} y={14}>
                <li>
                  <Link to={`/read/${series.slug}/${chapter.number}`} className="group relative flex items-center gap-4 overflow-hidden px-4 py-3.5">
                    <span className="absolute inset-0 origin-left scale-x-0 transition-transform duration-500 ease-silk group-hover:scale-x-100" style={{ background: 'linear-gradient(90deg, rgb(var(--accent)/.12), transparent)' }} />
                    <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded-md"><Cover series={series} showTitle={false} /></div>
                    <div className="relative min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-display font-bold transition-colors group-hover:text-accent">{series.title}</p>
                        {isNew(chapter.date, 2) && <span className="stamp">New</span>}
                      </div>
                      <p className="truncate text-sm text-muted">Ch. {chapter.number} — {chapter.title}</p>
                    </div>
                    <span className="relative hidden shrink-0 items-center gap-1.5 text-xs text-muted sm:flex"><Clock size={12} />{timeAgo(chapter.date)}</span>
                    <ArrowRight size={16} className="relative shrink-0 -translate-x-2 text-accent opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                  </Link>
                </li>
              </Rise>
            ))}
          </ul>
        </div>

        <div>
          <SectionHeading eyebrow="Release calendar" title="This week" jp="週" />
          <div className="rounded-2xl border hairline bg-card/40 p-4">
            <div className="grid grid-cols-7 gap-1">
              {weekdays.map((d) => (
                <button key={d} onClick={() => setDay(d)} className={cn('relative rounded-xl py-2.5 text-xs font-bold transition-colors', day === d ? 'text-white' : 'text-muted hover:text-ink')}>
                  {day === d && <motion.span layoutId="day-pill" className="absolute inset-0 rounded-xl bg-accent" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
                  <span className="relative">{d}</span>
                  {d === today && <span className="relative mx-auto mt-1 block h-1 w-1 rounded-full bg-current" />}
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.ul key={day} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="mt-4 space-y-2">
                {daySeries.length === 0 && (
                  <li className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted"><Calendar size={20} />No drops scheduled — perfect day to binge.</li>
                )}
                {daySeries.map((s) => (
                  <li key={s.slug}>
                    <Link to={`/series/${s.slug}`} className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-line/5">
                      <div className="h-14 w-10 shrink-0 overflow-hidden rounded-md"><Cover series={s} showTitle={false} /></div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold group-hover:text-accent">{s.title}</p>
                        <p className="text-xs text-muted">Ch. {latestChapter(s).number + 1} · {d2(day, today)}</p>
                      </div>
                      <Heart size={14} className="text-muted" />
                    </Link>
                  </li>
                ))}
              </motion.ul>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
const d2 = (d: Weekday, today: Weekday) => (d === today ? 'Today' : 'Upcoming');

/* ─────────── Genres: manga page grid ─────────── */
const panelShapes = [
  'lg:col-span-2 lg:row-span-2', '', '', 'lg:row-span-2', 'lg:col-span-2', '', '', 'lg:col-span-3',
];
const clips = [
  'polygon(0 0,100% 0,100% 92%,0 100%)', 'polygon(0 0,100% 4%,100% 100%,0 100%)', 'polygon(0 6%,100% 0,100% 100%,0 96%)',
  'polygon(0 0,100% 0,96% 100%,0 100%)', 'polygon(2% 0,100% 0,100% 100%,0 100%)', 'polygon(0 0,100% 0,100% 100%,4% 100%)',
  'polygon(0 0,96% 0,100% 100%,0 100%)', 'polygon(0 0,100% 6%,100% 100%,0 94%)',
];
const featuredGenres = genres;

export function Genres() {
  return (
    <section className="page-x pt-28">
      <SectionHeading eyebrow="Find your next obsession" title="Explore by genre" jp="類" to="/browse" />
      <div className="grid grid-flow-dense auto-rows-[150px] grid-cols-2 gap-3 sm:auto-rows-[170px] lg:grid-cols-5">
        {featuredGenres.filter((g) => genres.includes(g)).map((g, i) => {
          const count = catalog.filter((s) => s.genres.includes(g)).length;
          return (
            <Rise key={g} delay={i * 0.05} className={cn(panelShapes[i], 'h-full')}>
              <Link
                to={`/browse?genre=${encodeURIComponent(g)}`}
                className="group relative flex h-full flex-col justify-between overflow-hidden bg-card p-5 transition-transform duration-500 ease-silk hover:-translate-y-1"
                style={{ clipPath: clips[i % clips.length], border: '2px solid rgb(var(--ink) / .85)' }}
              >
                <span className="absolute inset-0 origin-bottom-left scale-0 bg-accent transition-transform duration-500 ease-blade group-hover:scale-100" style={{ borderRadius: '0 100% 0 0' }} />
                <span className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: 'repeating-conic-gradient(from 0deg at 80% 30%, rgb(255 255 255 / .18) 0deg 1.4deg, transparent 1.4deg 8deg)' }} />
                <span aria-hidden className={cn('pointer-events-none absolute -bottom-6 -right-2 font-brush leading-none text-ink/10 transition-all duration-500 group-hover:-translate-y-2 group-hover:text-white/25', i === 0 ? 'text-[11rem]' : 'text-[7rem]')}>
                  {genreKanji[g]}
                </span>
                <span className="relative font-mono text-[11px] uppercase tracking-[0.25em] text-muted transition-colors group-hover:text-white/80">{String(i + 1).padStart(2, '0')}</span>
                <span className="relative">
                  <span className={cn('block font-display font-extrabold transition-colors group-hover:text-white', i === 0 ? 'text-4xl' : 'text-2xl')}>{g}</span>
                  <span className="mt-1 flex items-center gap-2 text-xs text-muted transition-colors group-hover:text-white/80">
                    {count} series <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </span>
              </Link>
            </Rise>
          );
        })}
      </div>
    </section>
  );
}

/* ─────────── Spotlight ─────────── */
export function Spotlight() {
  const { theme } = useTheme();
  const s = getSeries(theme === 'dark' ? 'crimson-moonblade' : 'sakura-oathkeeper')!;
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);
  const last = latestChapter(s);

  return (
    <section ref={ref} className="relative mt-28 overflow-hidden py-24">
      <div aria-hidden className="absolute inset-0 -z-10 bg-bg2" />
      <span aria-hidden className="vertical-jp pointer-events-none absolute left-4 top-10 hidden font-brush text-5xl text-accent/15 lg:block">{s.altTitle}</span>
      <div className="page-x grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <InkReveal origin={['60%', '20%']} className="relative mx-auto w-full max-w-md">
          <div className="panel-frame relative aspect-[3/4] overflow-hidden rounded-sm">
            <motion.div style={{ y, backgroundImage: `url(${s.banner})`, backgroundSize: 'cover', backgroundPosition: 'center top' }} className="absolute -inset-y-[10%] inset-x-0" />
          <div className="glass absolute bottom-4 right-4 rounded-2xl px-5 py-4 shadow-2xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">Latest</p>
            <p className="font-display text-2xl font-extrabold">Ch. {last.number}</p>
          </div>
          </div>
        </InkReveal>
        <div>
          <Rise><p className="eyebrow">Spotlight · Editor’s pick</p></Rise>
          <Rise delay={0.05}>
            <h2 className="mt-4 font-display text-4xl font-extrabold leading-tight sm:text-6xl">{s.title}</h2>
            <p className="mt-2 font-brush text-2xl text-accent">{s.altTitle}</p>
          </Rise>
          <Rise delay={0.1}><p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{s.synopsis}</p></Rise>
          <Rise delay={0.15}>
            <div className="mt-6 flex flex-wrap gap-2">{s.genres.map((g) => <Link key={g} to={`/browse?genre=${g}`} className="chip">{g}</Link>)}</div>
            <dl className="mt-8 grid max-w-lg grid-cols-3 gap-4">
              {[[BookOpen, String(s.chapters.length), 'Chapters'], [BookOpen, String(s.chapters.reduce((n, c) => n + c.pages.length, 0)), 'Pages'], [Calendar, s.status, 'Status']].map(([I, v, l]) => {
                const Icon = I as typeof BookOpen;
                return (
                  <div key={l as string} className="rounded-2xl border hairline bg-card/50 p-4">
                    <Icon size={16} className="text-accent" />
                    <dd className="mt-2 font-display text-2xl font-extrabold">{v as string}</dd>
                    <dt className="text-xs text-muted">{l as string}</dt>
                  </div>
                );
              })}
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={`/read/${s.slug}/1`} className="btn btn-primary"><BookOpen size={16} /> Read from chapter 1</Link>
              <Link to={`/series/${s.slug}`} className="btn btn-ghost">Series details <ArrowRight size={16} /></Link>
            </div>
          </Rise>
        </div>
      </div>
    </section>
  );
}

/* ─────────── Rankings preview ─────────── */
export function RankingPreview() {
  const list = [...catalog].sort((a, b) => b.chapters.length - a.chapters.length).slice(0, 5);
  const max = list[0].chapters.length;
  return (
    <section className="page-x pt-28">
      <SectionHeading eyebrow="By published chapter count" title="More to read" jp="番" to="/rankings" />
      <motion.ol layout className="space-y-3">
        {list.map((s, i) => (
          <motion.li layout key={s.slug} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
            <Link to={`/series/${s.slug}`} className="group relative flex items-center gap-5 overflow-hidden rounded-2xl border hairline bg-card/40 p-3 pr-5 transition-colors hover:border-accent/50">
              <span className={cn('w-12 text-center font-display text-4xl font-extrabold', i === 0 ? 'text-accent' : 'text-ink/25')}>{i + 1}</span>
              <div className="h-16 w-11 shrink-0 overflow-hidden rounded-md"><Cover series={s} showTitle={false} /></div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-lg font-bold group-hover:text-accent">{s.title}</p>
                <div className="mt-2 h-1.5 max-w-md overflow-hidden rounded-full bg-line/10">
                  <motion.div className="h-full rounded-full bg-accent" initial={{ width: 0 }} whileInView={{ width: `${(s.chapters.length / max) * 100}%` }} viewport={{ once: false }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} />
                </div>
              </div>
              <span className="hidden items-center gap-1.5 text-sm font-semibold text-muted sm:flex"><TrendingUp size={14} className="text-accent" />{s.chapters.length} chapters</span>
            </Link>
          </motion.li>
        ))}
      </motion.ol>
    </section>
  );
}

/* ─────────── Creator CTA ─────────── */
export function CreatorCTA() {
  return (
    <section className="page-x pt-28">
      <InkReveal origin={['10%', '50%']}>
        <div className="relative overflow-hidden rounded-3xl bg-ink px-8 py-14 text-bg sm:px-14 sm:py-20">
          <div aria-hidden className="absolute inset-0 opacity-25" style={{ background: 'repeating-conic-gradient(from 0deg at 90% 50%, rgb(var(--accent)) 0deg 1deg, transparent 1deg 7deg)' }} />
          <div aria-hidden className="absolute inset-y-0 right-0 w-1/2 opacity-60" style={{ backgroundImage: 'var(--hero)', backgroundSize: 'cover', backgroundPosition: 'center 10%', maskImage: 'linear-gradient(to right, transparent, #000)', WebkitMaskImage: 'linear-gradient(to right, transparent, #000)' }} />
          <span aria-hidden className="vertical-jp absolute right-8 top-8 font-brush text-4xl text-accent">創作者</span>
          <div className="relative max-w-xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">Behind the stories</p>
            <h2 className="mt-4 font-display text-4xl font-extrabold leading-tight sm:text-5xl">Three worlds. A new page awaits.</h2>
            <p className="mt-5 text-base opacity-70">Discover the worlds and creative credits behind InkBlade’s AI-assisted illustrated stories.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/creators" className="btn btn-primary"><PenTool size={16} /> Creators & credits</Link>
              <Link to="/about" className="btn border border-bg/25 text-bg hover:border-accent"><BookOpen size={16} /> About InkBlade</Link>
            </div>
          </div>
        </div>
      </InkReveal>
    </section>
  );
}
