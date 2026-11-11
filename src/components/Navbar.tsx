import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Library, Menu, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLibrary } from '@/context/LibraryContext';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import { useCommand } from './CommandPalette';

const links = [
  { to: '/', label: 'Home', jp: '家' },
  { to: '/browse', label: 'Browse', jp: '探' },
  { to: '/rankings', label: 'Rankings', jp: '番' },
  { to: '/library', label: 'Library', jp: '蔵' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menu, setMenu] = useState(false);
  const { pathname } = useLocation();
  const { open } = useCommand();
  const { bookmarks } = useLibrary();

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      if (y > 300 && y > last + 4) setHidden(true);
      else if (y < last - 4 || y <= 300) setHidden(false);
      last = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenu(false), [pathname]);
  useEffect(() => { document.body.style.overflow = menu ? 'hidden' : ''; }, [menu]);

  return (
    <>
      <motion.header
        animate={{ y: hidden && !menu ? '-110%' : '0%' }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <div className={cn('transition-all duration-500 ease-silk', scrolled ? 'py-2.5' : 'py-5')}>
          <div className="page-x">
            <nav
              className={cn(
                'flex items-center gap-4 rounded-2xl px-3 py-2 transition-all duration-500 ease-silk sm:px-4',
                scrolled ? 'glass shadow-[0_10px_40px_-20px_rgb(0_0_0/0.5)]' : 'border border-transparent',
              )}
            >
              <Logo />
              <ul className="ml-6 hidden items-center gap-1 md:flex">
                {links.map((l) => (
                  <li key={l.to}>
                    <NavLink to={l.to} end={l.to === '/'} className="relative block px-4 py-2 text-sm font-semibold">
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-xl" style={{ background: 'rgb(var(--accent) / .12)' }} transition={{ type: 'spring', stiffness: 400, damping: 34 }} />
                          )}
                          <span className={cn('relative transition-colors', isActive ? 'text-accent' : 'text-ink/75 hover:text-ink')}>{l.label}</span>
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
              <div className="ml-auto flex items-center gap-2">
                <button onClick={open} className="hidden h-10 items-center gap-3 rounded-full border hairline bg-card/40 pl-4 pr-2 text-sm text-muted transition-colors hover:border-accent/50 hover:text-ink sm:flex">
                  <Search size={15} />
                  <span className="pr-6">Search manga…</span>
                  <kbd className="rounded-md border hairline px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
                </button>
                <button onClick={open} aria-label="Search" className="grid h-10 w-10 place-items-center rounded-full border hairline bg-card/40 sm:hidden">
                  <Search size={16} />
                </button>
                <NavLink to="/library" aria-label="Library" className="relative hidden h-10 w-10 place-items-center rounded-full border hairline bg-card/40 transition-colors hover:border-accent/60 md:grid">
                  <Library size={16} />
                  {bookmarks.length > 0 && (
                    <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">{bookmarks.length}</span>
                  )}
                </NavLink>
                <ThemeToggle />
                <button onClick={() => setMenu((m) => !m)} aria-label="Menu" aria-expanded={menu} className="grid h-10 w-10 place-items-center rounded-full border hairline bg-card/40 md:hidden">
                  {menu ? <X size={18} /> : <Menu size={18} />}
                </button>
              </div>
            </nav>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menu && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col justify-center bg-bg px-8 md:hidden"
            initial={{ clipPath: 'polygon(100% 0, 100% 0, 100% 0, 100% 0)' }}
            animate={{ clipPath: 'polygon(100% 0, 100% 100%, -100% 0, 100% 0)', transition: { duration: 0.6, ease: [0.7, 0, 0.2, 1] } }}
            exit={{ clipPath: 'polygon(100% 0, 100% 0, 100% 0, 100% 0)', transition: { duration: 0.45, ease: [0.7, 0, 0.2, 1] } }}
            style={{ clipPath: 'polygon(100% 0, 100% 100%, -100% 0, 100% 0)' }}
          >
            <span aria-hidden className="vertical-jp absolute right-6 top-24 font-brush text-6xl text-accent/15">墨刃漫画</span>
            <ul className="space-y-2">
              {links.map((l, i) => (
                <motion.li key={l.to} initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1, transition: { delay: 0.25 + i * 0.07 } }}>
                  <NavLink to={l.to} end={l.to === '/'} className={({ isActive }) => cn('flex items-baseline gap-4 font-display text-5xl font-extrabold', isActive ? 'text-accent' : 'text-ink')}>
                    <span className="font-brush text-2xl text-muted">{l.jp}</span>
                    {l.label}
                  </NavLink>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
