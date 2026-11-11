import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';

export type Theme = 'dark' | 'light';
interface Ctx { theme: Theme; toggle: () => void; slashing: boolean }

const ThemeCtx = createContext<Ctx>({ theme: 'dark', toggle: () => {}, slashing: false });

const read = (): Theme => {
  try {
    const t = localStorage.getItem('inkblade-theme');
    if (t === 'dark' || t === 'light') return t;
  } catch { /* storage unavailable */ }
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(read);
  const [slashing, setSlashing] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('inkblade-theme', theme); } catch { /* ignore */ }
  }, [theme]);

  /** Katana-slash: a blade flash, then the new theme is cut in diagonally (View Transitions API). */
  const toggle = useCallback(() => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } };

    if (!doc.startViewTransition || reduce) { setTheme(next); return; }

    setSlashing(true);
    window.setTimeout(() => {
      const vt = doc.startViewTransition!(() => {
        flushSync(() => setTheme(next));
        document.documentElement.dataset.theme = next;
      });
      vt.finished.finally(() => setSlashing(false));
    }, 260);
  }, [theme]);

  return <ThemeCtx.Provider value={{ theme, toggle, slashing }}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
