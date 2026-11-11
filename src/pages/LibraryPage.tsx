import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bookmark, History, Play, Trash2 } from 'lucide-react';
import { getSeries } from '@/data/catalog';
import { useLibrary } from '@/context/LibraryContext';
import { useToast } from '@/context/ToastContext';
import { cn, timeAgo } from '@/lib/utils';
import SeriesCard from '@/components/SeriesCard';
import Cover from '@/components/Cover';
import { SplitHeading } from '@/components/Reveal';

export default function LibraryPage() {
  const { bookmarks, history, clearHistory } = useLibrary();
  const toast = useToast();
  const [tab, setTab] = useState<'saved' | 'history'>('saved');
  const saved = bookmarks.map(getSeries).filter(Boolean);
  const hist = history.map((h) => ({ h, s: getSeries(h.slug) })).filter((x) => x.s);

  return (
    <div className="page-x pb-10 pt-32">
      <header className="relative">
        <span aria-hidden className="pointer-events-none absolute -top-6 right-0 select-none font-brush text-[8rem] leading-none text-accent/10 sm:text-[11rem]">蔵</span>
        <p className="eyebrow">Your collection</p>
        <h1 className="mt-4 font-display text-5xl font-extrabold sm:text-6xl"><SplitHeading text="My library" /></h1>
        <p className="mt-4 max-w-xl text-muted">Saved on this device. Bookmark series to follow them and your reading progress is remembered automatically.</p>
      </header>

      <div className="mt-10 flex items-center justify-between gap-4 border-b hairline">
        <div className="flex gap-8">
          {([['saved', 'Saved', Bookmark, saved.length], ['history', 'History', History, hist.length]] as const).map(([k, l, I, n]) => (
            <button key={k} onClick={() => setTab(k)} className={cn('relative flex items-center gap-2 pb-4 font-display text-lg font-bold transition-colors', tab === k ? 'text-ink' : 'text-muted hover:text-ink')}>
              <I size={16} /> {l} <span className="rounded-full bg-line/10 px-2 text-xs">{n}</span>
              {tab === k && <motion.span layoutId="lib-tab" className="absolute inset-x-0 -bottom-px h-[3px] rounded-full bg-accent" />}
            </button>
          ))}
        </div>
        {tab === 'history' && hist.length > 0 && (
          <button onClick={() => { clearHistory(); toast('Reading history cleared'); }} className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-accent"><Trash2 size={14} /> Clear</button>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }} className="mt-8">
          {tab === 'saved' ? (
            saved.length ? (
              <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
                {saved.map((s) => <SeriesCard key={s!.slug} series={s!} />)}
              </div>
            ) : <Empty kanji="空" title="Your shelf is empty" text="Tap the bookmark on any series to save it here." />
          ) : hist.length ? (
            <ul className="grid gap-3 md:grid-cols-2">
              {hist.map(({ h, s }) => (
                <li key={h.slug}>
                  <Link to={`/read/${h.slug}/${h.chapter}?page=${h.page}`} className="group flex items-center gap-4 rounded-2xl border hairline bg-card/40 p-3 transition-all hover:border-accent/50">
                    <div className="h-20 w-14 shrink-0 overflow-hidden rounded-lg"><Cover series={s!} showTitle={false} /></div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display font-bold group-hover:text-accent">{s!.title}</p>
                      <p className="text-xs text-muted">Chapter {h.chapter} · Page {h.page + 1} of {h.total} · {timeAgo(new Date(h.ts).toISOString())}</p>
                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-line/10"><div className="h-full bg-accent" style={{ width: `${((h.page + 1) / h.total) * 100}%` }} /></div>
                    </div>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-white transition-transform group-hover:scale-110"><Play size={14} className="fill-white" /></span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : <Empty kanji="無" title="Nothing read yet" text="Open any chapter and your progress will show up here." />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Empty({ kanji, title, text }: { kanji: string; title: string; text: string }) {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <span className="font-brush text-7xl text-accent/40">{kanji}</span>
      <p className="mt-4 font-display text-2xl font-bold">{title}</p>
      <p className="mt-2 text-muted">{text}</p>
      <Link to="/browse" className="btn btn-primary mt-8">Browse series</Link>
    </div>
  );
}
