import { useEffect, useLayoutEffect, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export function FooterScrollReset() {
  const location = useLocation();
  useLayoutEffect(() => {
    if (location.state?.scrollToTop) window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [location.key, location.state]);
  return null;
}

/** Thin accent reading-progress bar for the whole page. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  return <motion.div className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-accent" style={{ scaleX }} />;
}

export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const f = () => setShow(window.scrollY > 900);
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, y: 20, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.8 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          className="glass fixed bottom-6 right-6 z-40 grid h-12 w-12 place-items-center rounded-full text-accent shadow-xl transition-transform hover:-translate-y-1"
        >
          <ArrowUp size={18} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/** Brush-stroke curtain that sweeps across on every route change. */
export function RouteCurtain() {
  const { pathname } = useLocation();
  const [key, setKey] = useState(0);
  const [first, setFirst] = useState(true);
  useEffect(() => {
    if (first) { setFirst(false); return; }
    setKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
  if (key === 0) return null;
  return (
    <div key={key} className="pointer-events-none fixed inset-0 z-[80] overflow-hidden" aria-hidden>
      <motion.div
        className="absolute inset-y-0 -left-[20%] w-[140%] bg-accent"
        style={{ skewX: -18 }}
        initial={{ x: '-110%' }}
        animate={{ x: ['-110%', '0%', '110%'] }}
        transition={{ duration: 0.75, times: [0, 0.45, 1], ease: [0.7, 0, 0.2, 1] }}
      />
      <motion.div
        className="absolute inset-y-0 -left-[20%] w-[140%] bg-bg2"
        style={{ skewX: -18 }}
        initial={{ x: '-110%' }}
        animate={{ x: ['-110%', '0%', '110%'] }}
        transition={{ duration: 0.75, delay: 0.06, times: [0, 0.45, 1], ease: [0.7, 0, 0.2, 1] }}
      >
        <motion.span
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-brush text-7xl text-accent"
          style={{ skewX: 18 }}
          initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.75, times: [0.2, 0.45, 0.7] }}
        >
          墨
        </motion.span>
      </motion.div>
    </div>
  );
}

export function Marquee({ items, duration = 40, className = '' }: { items: string[]; duration?: number; className?: string }) {
  const row = [...items, ...items];
  return (
    <div className={`marquee overflow-hidden ${className}`}>
      <div className="marquee-track flex w-max items-center" style={{ ['--dur' as string]: `${duration}s` }}>
        {row.map((t, i) => (
          <span key={i} className="flex items-center whitespace-nowrap">
            <span className="px-6">{t}</span>
            <span className="font-brush text-accent">刃</span>
          </span>
        ))}
      </div>
    </div>
  );
}
