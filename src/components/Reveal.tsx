import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/** Ink-bleed reveal: content appears as if ink is spreading across paper from a point. */
export function InkReveal({ children, className, origin = ['30%', '40%'], delay = 0 }: { children: ReactNode; className?: string; origin?: [string, string]; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current!;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { window.setTimeout(() => setInView(true), delay); io.disconnect(); }
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);
  return (
    <div ref={ref} className={cn('ink', inView && 'ink-in', className)} style={{ ['--ox' as string]: origin[0], ['--oy' as string]: origin[1] }}>
      {children}
    </div>
  );
}

/** Rise + unblur on scroll. */
export function Rise({ children, className, delay = 0, y = 28 }: { children: ReactNode; className?: string; delay?: number; y?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Splits a heading into words that slide up from behind a mask. */
export function SplitHeading({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(' ');
  return (
    <span className={cn('inline', className)} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-bottom" aria-hidden>
          <motion.span
            className="inline-block"
            initial={{ y: '110%', rotate: 4 }}
            whileInView={{ y: '0%', rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: delay + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
          >
            {w}&nbsp;
          </motion.span>
        </span>
      ))}
    </span>
  );
}
