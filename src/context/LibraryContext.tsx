import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { getSeries } from '@/data/catalog';

export interface HistoryEntry { slug: string; chapter: number; page: number; total: number; ts: number }

interface Ctx {
  bookmarks: string[];
  history: HistoryEntry[];
  readChapters: Record<string, number[]>;
  isBookmarked: (slug: string) => boolean;
  toggleBookmark: (slug: string) => boolean;
  saveProgress: (e: Omit<HistoryEntry, 'ts'>) => void;
  lastRead: (slug: string) => HistoryEntry | undefined;
  hasRead: (slug: string, chapter: number) => boolean;
  clearHistory: () => void;
}

const LibraryCtx = createContext<Ctx>(null!);
const KEY = 'inkblade-library-v1';

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as { bookmarks: string[]; history: HistoryEntry[]; readChapters: Record<string, number[]> };
  } catch { /* ignore */ }
  return { bookmarks: [], history: [], readChapters: {} };
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(load);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state]);

  const isBookmarked = useCallback((slug: string) => state.bookmarks.includes(slug), [state.bookmarks]);

  const toggleBookmark = useCallback((slug: string) => {
    const adding = !state.bookmarks.includes(slug);
    setState((s) => ({ ...s, bookmarks: adding ? [slug, ...s.bookmarks] : s.bookmarks.filter((b) => b !== slug) }));
    return adding;
  }, [state.bookmarks]);

  const saveProgress = useCallback((e: Omit<HistoryEntry, 'ts'>) => {
    setState((s) => {
      const read = new Set(s.readChapters[e.slug] ?? []);
      if (e.page >= e.total - 1) read.add(e.chapter);
      return {
        ...s,
        history: [{ ...e, ts: Date.now() }, ...s.history.filter((h) => h.slug !== e.slug)].slice(0, 60),
        readChapters: { ...s.readChapters, [e.slug]: [...read] },
      };
    });
  }, []);

  const history = state.history.filter((h) => getSeries(h.slug)?.chapters.some((c) => c.number === h.chapter));
  const lastRead = useCallback((slug: string) => state.history.find((h) => h.slug === slug && getSeries(slug)?.chapters.some((c) => c.number === h.chapter)), [state.history]);
  const hasRead = useCallback((slug: string, ch: number) => !!state.readChapters[slug]?.includes(ch), [state.readChapters]);
  const clearHistory = useCallback(() => setState((s) => ({ ...s, history: [], readChapters: {} })), []);

  return (
    <LibraryCtx.Provider value={{ ...state, history, isBookmarked, toggleBookmark, saveProgress, lastRead, hasRead, clearHistory }}>
      {children}
    </LibraryCtx.Provider>
  );
}

export const useLibrary = () => useContext(LibraryCtx);
