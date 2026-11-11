import { useId } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

/** Blood-moon ⇄ rising-sun morphing toggle. */
export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const dark = theme === 'dark';
  const mid = useId().replace(/:/g, '');
  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Switch to day (light) theme' : 'Switch to night (dark) theme'}
      title={dark ? 'Day mode' : 'Night mode'}
      className="group relative grid h-10 w-10 place-items-center overflow-hidden rounded-full border hairline bg-card/40 transition-colors hover:border-accent/60"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-accent">
        <mask id={`moon-${mid}`}>
          <rect width="24" height="24" fill="#fff" />
          <motion.circle animate={{ cx: dark ? 17 : 30, cy: dark ? 7 : 0 }} r="7" fill="#000" transition={{ duration: 0.6, ease: [0.7, 0, 0.2, 1] }} />
        </mask>
        <motion.circle cx="12" cy="12" fill="currentColor" mask={`url(#moon-${mid})`} animate={{ r: dark ? 8 : 5 }} transition={{ duration: 0.6, ease: [0.7, 0, 0.2, 1] }} />
        <motion.g
          stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          animate={{ opacity: dark ? 0 : 1, rotate: dark ? -90 : 0, scale: dark ? 0.4 : 1 }}
          style={{ originX: '12px', originY: '12px' }}
          transition={{ duration: 0.6, ease: [0.7, 0, 0.2, 1] }}
        >
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i * Math.PI) / 4;
            return <line key={i} x1={12 + Math.cos(a) * 8} y1={12 + Math.sin(a) * 8} x2={12 + Math.cos(a) * 10.5} y2={12 + Math.sin(a) * 10.5} />;
          })}
        </motion.g>
      </svg>
    </button>
  );
}

/** Blade flash that slices the screen before the theme is cut in. */
export function SlashFlash() {
  const { slashing } = useTheme();
  return (
    <AnimatePresence>
      {slashing && (
        <motion.div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden" initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.3 } }}>
          <motion.div
            className="absolute left-1/2 top-1/2 h-[3px] w-[180vmax]"
            style={{ rotate: -45, background: 'linear-gradient(90deg, transparent, #fff 20%, rgb(var(--accent)) 50%, #fff 80%, transparent)', boxShadow: '0 0 24px 6px rgb(var(--accent) / .7)' }}
            initial={{ scaleX: 0, x: '-50%', y: '-50%' }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.28, ease: [0.7, 0, 0.2, 1] }}
          />
          <motion.div
            className="absolute inset-0 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.18, 0] }}
            transition={{ duration: 0.45, delay: 0.18 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
