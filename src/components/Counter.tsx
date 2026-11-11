import { useEffect, useRef, useState } from 'react';
import { animate, useInView } from 'framer-motion';

export default function Counter({ to, format = (n) => Math.round(n).toLocaleString(), duration = 1.8 }: { to: number; format?: (n: number) => string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration, ease: [0.22, 1, 0.36, 1], onUpdate: setV });
    return () => c.stop();
  }, [inView, to, duration]);
  return <span ref={ref}>{format(v)}</span>;
}
