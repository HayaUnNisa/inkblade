import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CornerDownLeft, Flame, Library, Moon, Search, Trophy } from 'lucide-react';
import { catalog, genres } from '@/data/catalog';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import Cover from './Cover';

const Ctx = createContext<{ open: () => void }>({ open: () => {} });
export const useCommand = () => useContext(Ctx);

interface Item { id: string; label: string; hint: string; icon: ReactNode; run: () => void; group: string }

export function CommandProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const open = useCallback(() => setOpen(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = /input|textarea|select/i.test((e.target as HTMLElement)?.tagName);
      if ((e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      <AnimatePresence>{isOpen && <Palette onClose={() => setOpen(false)} />}</AnimatePresence>
    </Ctx.Provider>
  );
}

function Palette({ onClose }: { onClose: () => void }) {
  const nav = useNavigate();
  const { toggle } = useTheme();
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => { inputRef.current?.focus(); document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = ''; }; }, []);

  const go = useCallback((to: string) => () => { nav(to); onClose(); }, [nav, onClose]);

  const items = useMemo<Item[]>(() => {
    const term = q.trim().toLowerCase();
    const match = (s: string) => !term || s.toLowerCase().includes(term);
    const series = catalog
      .filter((s) => match(s.title) || match(s.author) || match(s.altTitle) || s.genres.some(match))
      .slice(0, 6)
      .map<Item>((s) => ({
        id: s.slug, group: 'Series', label: s.title, hint: `${s.author} · ${s.genres.slice(0, 2).join(', ')}`,
        icon: <span className="block h-10 w-7 overflow-hidden rounded"><Cover series={s} showTitle={false} /></span>,
        run: go(`/series/${s.slug}`),
      }));
    const pages: Item[] = [
      { id: 'p-browse', group: 'Navigate', label: 'Browse all series', hint: 'Filter by genre & status', icon: <BookOpen size={16} />, run: go('/browse') },
      { id: 'p-rank', group: 'Navigate', label: 'Rankings', hint: 'Weekly · Monthly · All time', icon: <Trophy size={16} />, run: go('/rankings') },
      { id: 'p-lib', group: 'Navigate', label: 'My library', hint: 'Bookmarks & history', icon: <Library size={16} />, run: go('/library') },
      { id: 'p-new', group: 'Navigate', label: 'Latest updates', hint: 'Fresh chapters', icon: <Flame size={16} />, run: go('/browse?sort=updated') },
      { id: 'a-theme', group: 'Actions', label: 'Toggle day / night theme', hint: 'Katana slash', icon: <Moon size={16} />, run: () => { onClose(); setTimeout(toggle, 150); } },
    ].filter((i) => match(i.label));
    const gen = genres.filter((g) => term && match(g)).slice(0, 4).map<Item>((g) => ({
      id: 'g-' + g, group: 'Genres', label: g, hint: 'Genre', icon: <span className="text-xs font-bold">#</span>, run: go(`/browse?genre=${encodeURIComponent(g)}`),
    }));
    return [...series, ...gen, ...pages];
  }, [q, go, onClose, toggle]);

  useEffect(() => setActive(0), [q]);
  useEffect(() => {
    listRef.current?.querySelector(`[data-i="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(items.length - 1, a + 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    if (e.key === 'Enter') items[active]?.run();
    if (e.key === 'Escape') onClose();
  };

  let lastGroup = '';
  return (
    <motion.div className="fixed inset-0 z-[95] flex items-start justify-center px-4 pt-[12vh]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        role="dialog" aria-label="Search"
        initial={{ y: -20, scale: 0.96, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: -10, scale: 0.98, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        className="relative w-full max-w-xl overflow-hidden rounded-2xl border hairline bg-card shadow-[0_40px_120px_-20px_rgb(0_0_0/0.7)]"
        onKeyDown={onKey}
      >
        <div className="flex items-center gap-3 border-b hairline px-5">
          <Search size={18} className="text-muted" />
          <input
            ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search series, authors, genres…"
            className="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted"
          />
          <kbd className="rounded-md border hairline px-1.5 py-0.5 font-mono text-[10px] text-muted">ESC</kbd>
        </div>
        <div ref={listRef} className="max-h-[56vh] overflow-y-auto p-2">
          {items.length === 0 && <p className="px-4 py-10 text-center text-sm text-muted">Nothing found for “{q}”.</p>}
          {items.map((it, i) => {
            const header = it.group !== lastGroup ? (lastGroup = it.group) : null;
            return (
              <div key={it.id}>
                {header && <p className="px-3 pb-1 pt-3 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">{header}</p>}
                <button
                  data-i={i}
                  onMouseMove={() => setActive(i)}
                  onClick={it.run}
                  className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors', i === active ? 'bg-accent/12 text-ink' : 'text-ink/85')}
                  style={i === active ? { background: 'rgb(var(--accent) / .12)' } : undefined}
                >
                  <span className={cn('grid h-10 min-w-[28px] place-items-center rounded-lg', i === active ? 'text-accent' : 'text-muted')}>{it.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{it.label}</span>
                    <span className="block truncate text-xs text-muted">{it.hint}</span>
                  </span>
                  {i === active && <CornerDownLeft size={14} className="text-accent" />}
                </button>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 border-t hairline px-5 py-2.5 font-mono text-[10px] text-muted">
          <span>↑↓ navigate</span><span>↵ open</span><span className="ml-auto">⌘K / Ctrl K / “/”</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
