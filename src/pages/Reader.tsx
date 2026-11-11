import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, BookOpen, ChevronLeft, ChevronRight, Columns2, Expand, GalleryVertical, LayoutGrid, Minus,
  Plus, RectangleVertical, Settings2, Shrink, X,
} from 'lucide-react';
import { getSeries } from '@/data/catalog';
import { useLibrary } from '@/context/LibraryContext';
import { cn } from '@/lib/utils';
import PlaceholderPage from '@/components/PlaceholderPage';
import ThemeToggle from '@/components/ThemeToggle';
import NotFound from './NotFound';

type Mode = 'single' | 'double' | 'vertical';
type Dir = 'rtl' | 'ltr';
interface Settings { mode: Mode; dir: Dir; fit: 'height' | 'width'; zoom: number; gap: boolean }

const SKEY = 'inkblade-reader-v1';
const loadSettings = (slug: string | undefined, fallbackDir: Dir, fallbackMode: Mode): Settings => {
  let settings: Settings = { mode: fallbackMode, dir: fallbackDir, fit: 'height', zoom: 100, gap: true };
  try {
    const saved = localStorage.getItem(SKEY);
    if (saved) settings = { ...settings, ...JSON.parse(saved), dir: fallbackDir };
    const dir = localStorage.getItem(`${SKEY}:direction:${slug}`);
    if (dir === 'rtl' || dir === 'ltr') settings.dir = dir;
  } catch { /* use series defaults */ }
  return settings;
};

export default function Reader() {
  const { slug, chapter } = useParams();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const series = getSeries(slug);
  const chNum = Number(chapter);
  const chIndex = series?.chapters.findIndex((c) => c.number === chNum) ?? -1;
  const ch = series?.chapters[chIndex];
  const { saveProgress } = useLibrary();

  const [settings, setSettings] = useState<Settings>(() =>
    loadSettings(slug, series?.direction === 'ltr' ? 'ltr' : 'rtl', series?.direction === 'vertical' ? 'vertical' : 'single'));
  useEffect(() => {
    setSettings(loadSettings(slug, series?.direction === 'ltr' ? 'ltr' : 'rtl', series?.direction === 'vertical' ? 'vertical' : 'single'));
  }, [slug, series?.direction]);
  useEffect(() => { try { localStorage.setItem(SKEY, JSON.stringify(settings)); } catch { /* ignore */ } }, [settings]);
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => {
    if (k === 'dir') { try { localStorage.setItem(`${SKEY}:direction:${slug}`, String(v)); } catch { /* ignore */ } }
    setSettings((s) => ({ ...s, [k]: v }));
  };

  const pages = useMemo(() => {
    if (!ch) return [] as (string | null)[];
    return ch.pages.length ? ch.pages : Array.from({ length: ch.placeholderPages ?? 18 }, () => null);
  }, [ch]);
  const total = pages.length;
  const step = settings.mode === 'double' ? 2 : 1;

  const [page, setPage] = useState(() => Math.min(Number(params.get('page') ?? 0) || 0, Math.max(0, total - 1)));
  const [dirSign, setDirSign] = useState(1);
  const [ui, setUi] = useState(true);
  const [panel, setPanel] = useState<null | 'settings' | 'pages'>(null);
  const [ended, setEnded] = useState(false);
  const [full, setFull] = useState(false);
  const idle = useRef<number>();
  const scroller = useRef<HTMLDivElement>(null);

  // reset on chapter change
  useEffect(() => { setPage(Math.min(Number(params.get('page') ?? 0) || 0, Math.max(0, total - 1))); setEnded(false); }, [slug, chNum]); // eslint-disable-line

  // save progress
  useEffect(() => {
    if (series && ch) saveProgress({ slug: series.slug, chapter: ch.number, page: ended ? total - 1 : page, total });
  }, [page, ended, series, ch, total, saveProgress]);

  // auto-hide UI
  const poke = useCallback(() => {
    setUi(true);
    window.clearTimeout(idle.current);
    idle.current = window.setTimeout(() => setUi(false), 2800);
  }, []);
  useEffect(() => { poke(); return () => window.clearTimeout(idle.current); }, [poke]);
  const uiVisible = ui || panel !== null || ended;

  const prevCh = series && chIndex > 0 ? series.chapters[chIndex - 1] : undefined;
  const nextCh = series && chIndex < series.chapters.length - 1 ? series.chapters[chIndex + 1] : undefined;

  const forward = useCallback(() => {
    if (settings.mode === 'vertical') { scroller.current?.scrollBy({ top: window.innerHeight * 0.85, behavior: 'smooth' }); return; }
    if (page + step >= total) { setEnded(true); return; }
    setDirSign(1);
    setPage((p) => Math.min(total - 1, p + step));
  }, [page, step, total, settings.mode]);
  const back = useCallback(() => {
    if (settings.mode === 'vertical') { scroller.current?.scrollBy({ top: -window.innerHeight * 0.85, behavior: 'smooth' }); return; }
    if (ended) { setEnded(false); return; }
    setDirSign(-1);
    setPage((p) => Math.max(0, p - step));
  }, [step, settings.mode, ended]);

  const toggleFull = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.();
  };
  useEffect(() => {
    const f = () => setFull(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', f);
    return () => document.removeEventListener('fullscreenchange', f);
  }, []);

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/input|select|textarea/i.test((e.target as HTMLElement).tagName)) return;
      const rtl = settings.dir === 'rtl' && settings.mode !== 'vertical';
      if (e.key === 'ArrowRight' || e.key === 'd') { e.preventDefault(); rtl ? back() : forward(); }
      else if (e.key === 'ArrowLeft' || e.key === 'a') { e.preventDefault(); rtl ? forward() : back(); }
      else if (e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); forward(); }
      else if (e.key === 'PageUp') { e.preventDefault(); back(); }
      else if (e.key === 'f') toggleFull();
      else if (e.key === 'Escape') { if (panel) setPanel(null); else if (series) nav(`/series/${series.slug}`); }
      poke();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [forward, back, settings.dir, settings.mode, panel, series, nav, poke]);

  // vertical mode: track current page
  useEffect(() => {
    if (settings.mode !== 'vertical' || !scroller.current) return;
    const els = scroller.current.querySelectorAll('[data-page]');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) setPage(Number((en.target as HTMLElement).dataset.page)); });
    }, { root: scroller.current, threshold: 0.5 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [settings.mode, pages]);

  // preload upcoming images
  useEffect(() => {
    pages.slice(page + 1, page + 4).forEach((src) => { if (src) { const i = new Image(); i.src = src; } });
  }, [page, pages]);

  if (!series || !ch) return <NotFound />;

  const visible = settings.mode === 'double' ? [page, page + 1].filter((p) => p < total) : [page];
  const ordered = settings.dir === 'rtl' ? [...visible].reverse() : visible;
  const progress = ((Math.min(page + step, total)) / total) * 100;

  const renderPage = (i: number, cls = '') => {
    const src = pages[i];
    return src ? (
      <img src={src} alt={`Page ${i + 1}`} className={cn('select-none object-contain', cls)} draggable={false} />
    ) : (
      <div className={cn('aspect-[2/3]', cls)}>
        <PlaceholderPage seed={`${series.slug}-${ch.number}`} page={i} total={total} accent={series.palette[0]} title={series.title} kanji={series.kanji} />
      </div>
    );
  };

  const fitCls = settings.fit === 'height' ? 'h-[100svh] w-auto max-w-full' : 'w-full h-auto';
  const goChapter = (n: number) => nav(`/read/${series.slug}/${n}`);

  return (
    <div className="fixed inset-0 bg-[#0a0a0f] text-white" onMouseMove={poke} onTouchStart={poke}>
      {/* stage */}
      {settings.mode === 'vertical' ? (
        <div ref={scroller} className="h-full overflow-y-auto" onClick={() => setUi((u) => !u)}>
          <div className="mx-auto flex flex-col items-center" style={{ width: `min(100%, ${settings.zoom * 7.2}px)`, gap: settings.gap ? 12 : 0 }}>
            {pages.map((_, i) => <div key={i} data-page={i} className="w-full">{renderPage(i, 'w-full h-auto')}</div>)}
          </div>
          <EndCard series={series} next={nextCh} onNext={() => nextCh && goChapter(nextCh.number)} inline />
        </div>
      ) : (
        <div className="relative flex h-full items-center justify-center overflow-auto">
          <AnimatePresence mode="popLayout" custom={dirSign} initial={false}>
            <motion.div
              key={page}
              custom={dirSign}
              variants={{
                enter: (d: number) => ({ x: `${(settings.dir === 'rtl' ? -1 : 1) * d * 14}%`, opacity: 0, rotateY: (settings.dir === 'rtl' ? 1 : -1) * d * 14 }),
                center: { x: 0, opacity: 1, rotateY: 0 },
                exit: (d: number) => ({ x: `${(settings.dir === 'rtl' ? 1 : -1) * d * 14}%`, opacity: 0, rotateY: (settings.dir === 'rtl' ? -1 : 1) * d * 14 }),
              }}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center justify-center"
              style={{ transformPerspective: 1400, scale: settings.zoom / 100, gap: settings.gap && settings.mode === 'double' ? 6 : 0 }}
            >
              {ordered.map((i) => (
                <div key={i} className={cn('shadow-[0_30px_80px_-20px_rgb(0_0_0/0.8)]', settings.mode === 'double' && 'max-w-[50vw]')}>
                  {renderPage(i, settings.mode === 'double' ? (settings.fit === 'height' ? 'h-[100svh] w-auto max-w-[50vw]' : 'w-[50vw] h-auto') : fitCls)}
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
          {/* click zones */}
          <button aria-label="Previous / next" className="absolute inset-y-0 left-0 w-[35%] cursor-w-resize" onClick={() => (settings.dir === 'rtl' ? forward() : back())} />
          <button aria-label="Toggle controls" className="absolute inset-y-0 left-[35%] w-[30%] cursor-pointer" onClick={() => setUi((u) => !u)} />
          <button aria-label="Next / previous" className="absolute inset-y-0 right-0 w-[35%] cursor-e-resize" onClick={() => (settings.dir === 'rtl' ? back() : forward())} />
          <AnimatePresence>{ended && <EndCard series={series} next={nextCh} onNext={() => nextCh && goChapter(nextCh.number)} onClose={() => setEnded(false)} />}</AnimatePresence>
        </div>
      )}

      {/* top bar */}
      <motion.header
        animate={{ y: uiVisible ? 0 : -90, opacity: uiVisible ? 1 : 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-black/85 to-transparent px-3 pb-10 pt-3 sm:px-5"
      >
        <div className="flex items-center gap-3">
          <Link to={`/series/${series.slug}`} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 backdrop-blur transition hover:bg-white/20" aria-label="Back to series"><ArrowLeft size={18} /></Link>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-base font-bold sm:text-lg">{series.title}</p>
            <p className="truncate text-xs text-white/60">Chapter {ch.number} · {ch.title}</p>
          </div>
          <select
            value={ch.number}
            onChange={(e) => goChapter(Number(e.target.value))}
            className="hidden max-w-[180px] cursor-pointer rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold text-white outline-none backdrop-blur sm:block"
            aria-label="Choose chapter"
          >
            {[...series.chapters].reverse().map((c) => <option key={c.number} value={c.number} className="bg-neutral-900">Ch. {c.number} — {c.title}</option>)}
          </select>
          <button onClick={() => setPanel(panel === 'pages' ? null : 'pages')} className={cn('grid h-10 w-10 place-items-center rounded-full backdrop-blur transition', panel === 'pages' ? 'bg-accent' : 'bg-white/10 hover:bg-white/20')} aria-label="All pages"><LayoutGrid size={17} /></button>
          <button onClick={() => setPanel(panel === 'settings' ? null : 'settings')} className={cn('grid h-10 w-10 place-items-center rounded-full backdrop-blur transition', panel === 'settings' ? 'bg-accent' : 'bg-white/10 hover:bg-white/20')} aria-label="Reader settings"><Settings2 size={17} /></button>
          <button onClick={toggleFull} className="hidden h-10 w-10 place-items-center rounded-full bg-white/10 backdrop-blur transition hover:bg-white/20 sm:grid" aria-label="Fullscreen">{full ? <Shrink size={17} /> : <Expand size={17} />}</button>
        </div>
      </motion.header>

      {/* bottom bar */}
      <motion.footer
        animate={{ y: uiVisible ? 0 : 110, opacity: uiVisible ? 1 : 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 to-transparent px-3 pb-4 pt-12 sm:px-6"
      >
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <button disabled={!prevCh} onClick={() => prevCh && goChapter(prevCh.number)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 transition hover:bg-white/20 disabled:opacity-30" aria-label="Previous chapter"><ChevronLeft size={18} /></button>
          <span className="w-14 text-center font-mono text-xs text-white/70">{page + 1}/{total}</span>
          <input
            type="range" min={0} max={total - 1} value={page}
            onChange={(e) => {
              const v = Number(e.target.value);
              setEnded(false);
              if (settings.mode === 'vertical') scroller.current?.querySelector(`[data-page="${v}"]`)?.scrollIntoView();
              else { setDirSign(v > page ? 1 : -1); setPage(v); }
            }}
            className="h-1 flex-1 cursor-pointer accent-[rgb(var(--accent))]"
            style={{ direction: settings.dir === 'rtl' && settings.mode !== 'vertical' ? 'rtl' : 'ltr' }}
            aria-label="Page"
          />
          <button disabled={!nextCh} onClick={() => nextCh && goChapter(nextCh.number)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 transition hover:bg-white/20 disabled:opacity-30" aria-label="Next chapter"><ChevronRight size={18} /></button>
        </div>
        <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
          {settings.mode === 'vertical' ? 'Scroll to read' : settings.dir === 'rtl' ? 'Right → left · tap left to advance' : 'Left → right · tap right to advance'} · ← → keys · F fullscreen
        </p>
      </motion.footer>
      {/* thin progress line */}
      <div className="absolute inset-x-0 bottom-0 z-10 h-[2px] bg-white/10"><div className="h-full bg-accent transition-all duration-500" style={{ width: `${progress}%` }} /></div>

      {/* panels */}
      <AnimatePresence>
        {panel === 'settings' && (
          <motion.aside initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 40, opacity: 0 }} transition={{ type: 'spring', stiffness: 360, damping: 34 }}
            className="absolute right-3 top-20 z-30 w-[300px] rounded-2xl border border-white/10 bg-neutral-950/90 p-5 backdrop-blur-xl sm:right-5">
            <div className="flex items-center justify-between"><p className="font-display text-lg font-bold">Reader settings</p><button onClick={() => setPanel(null)} aria-label="Close"><X size={18} /></button></div>
            <Group label="Layout">
              {([['single', 'Single', RectangleVertical], ['double', 'Spread', Columns2], ['vertical', 'Webtoon', GalleryVertical]] as const).map(([v, l, I]) => (
                <Opt key={v} on={settings.mode === v} onClick={() => set('mode', v)}><I size={15} />{l}</Opt>
              ))}
            </Group>
            <Group label="Direction" disabled={settings.mode === 'vertical'}>
              <Opt on={settings.dir === 'rtl'} onClick={() => set('dir', 'rtl')}><ArrowLeft size={14} />Manga (RTL)</Opt>
              <Opt on={settings.dir === 'ltr'} onClick={() => set('dir', 'ltr')}>Comic (LTR)<ArrowRight size={14} /></Opt>
            </Group>
            <Group label="Fit" disabled={settings.mode === 'vertical'}>
              <Opt on={settings.fit === 'height'} onClick={() => set('fit', 'height')}>Height</Opt>
              <Opt on={settings.fit === 'width'} onClick={() => set('fit', 'width')}>Width</Opt>
            </Group>
            <div className="mt-5">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">Zoom · {settings.zoom}%</p>
              <div className="flex items-center gap-2">
                <button onClick={() => set('zoom', Math.max(50, settings.zoom - 10))} className="grid h-8 w-8 place-items-center rounded-lg bg-white/10" aria-label="Zoom out"><Minus size={14} /></button>
                <input type="range" min={50} max={200} step={10} value={settings.zoom} onChange={(e) => set('zoom', Number(e.target.value))} className="flex-1 accent-[rgb(var(--accent))]" aria-label="Zoom" />
                <button onClick={() => set('zoom', Math.min(200, settings.zoom + 10))} className="grid h-8 w-8 place-items-center rounded-lg bg-white/10" aria-label="Zoom in"><Plus size={14} /></button>
              </div>
            </div>
            <label className="mt-5 flex cursor-pointer items-center justify-between text-sm">
              <span>Gap between pages</span>
              <input type="checkbox" checked={settings.gap} onChange={(e) => set('gap', e.target.checked)} className="h-4 w-4 accent-[rgb(var(--accent))]" />
            </label>
            <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-sm"><span>Site theme</span><ThemeToggle /></div>
          </motion.aside>
        )}
        {panel === 'pages' && (
          <motion.aside initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: 'spring', stiffness: 360, damping: 34 }}
            className="absolute inset-x-3 bottom-24 top-20 z-30 overflow-y-auto rounded-2xl border border-white/10 bg-neutral-950/90 p-5 backdrop-blur-xl sm:inset-x-auto sm:right-5 sm:w-[440px]">
            <div className="mb-4 flex items-center justify-between"><p className="font-display text-lg font-bold">All pages</p><button onClick={() => setPanel(null)} aria-label="Close"><X size={18} /></button></div>
            <div className="grid grid-cols-4 gap-2">
              {pages.map((_, i) => (
                <button key={i} onClick={() => {
                  setPanel(null); setEnded(false);
                  if (settings.mode === 'vertical') scroller.current?.querySelector(`[data-page="${i}"]`)?.scrollIntoView();
                  else { setDirSign(i > page ? 1 : -1); setPage(settings.mode === 'double' ? i - (i % 2) : i); }
                }} className={cn('relative overflow-hidden rounded-md ring-2 transition', visible.includes(i) ? 'ring-accent' : 'ring-transparent hover:ring-white/40')}>
                  {renderPage(i, 'w-full h-auto')}
                  <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 font-mono text-[10px]">{i + 1}</span>
                </button>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

function Group({ label, children, disabled }: { label: string; children: React.ReactNode; disabled?: boolean }) {
  return (
    <div className={cn('mt-5', disabled && 'pointer-events-none opacity-35')}>
      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">{label}</p>
      <div className="flex gap-1.5 rounded-xl bg-white/5 p-1">{children}</div>
    </div>
  );
}
function Opt({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cn('flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-bold transition', on ? 'bg-accent text-white' : 'text-white/70 hover:text-white')}>
      {children}
    </button>
  );
}

function EndCard({ series, next, onNext, onClose, inline }: {
  series: NonNullable<ReturnType<typeof getSeries>>; next?: { number: number; title: string }; onNext: () => void; onClose?: () => void; inline?: boolean;
}) {
  const body = (
    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-neutral-950/90 p-8 text-center backdrop-blur-xl">
      <span className="font-brush text-6xl text-accent">完</span>
      <p className="mt-3 font-display text-2xl font-bold">End of chapter</p>
      {next ? (
        <>
          <p className="mt-2 text-sm text-white/60">Up next · Chapter {next.number}: {next.title}</p>
          <button onClick={onNext} className="btn btn-primary mt-6 w-full">Next chapter <ArrowRight size={16} /></button>
        </>
      ) : (
        <p className="mt-2 text-sm text-white/60">You’re all caught up! New chapters drop every {series.schedule}.</p>
      )}
      <div className="mt-3 flex gap-2">
        <Link to={`/series/${series.slug}`} className="btn flex-1 border border-white/15 text-white"><BookOpen size={15} /> Series</Link>
        {onClose && <button onClick={onClose} className="btn flex-1 border border-white/15 text-white">Re-read page</button>}
      </div>
    </div>
  );
  if (inline) return <div className="flex justify-center px-4 py-20">{body}</div>;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-10 grid place-items-center bg-black/70 px-4 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 26 }} className="w-full max-w-md">{body}</motion.div>
    </motion.div>
  );
}
