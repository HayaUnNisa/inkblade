import { useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';

/**
 * Falling foliage on canvas — crimson maple leaves at night, sakura petals by day.
 * Reacts to the cursor (petals drift away from it) and pauses when the tab is hidden.
 */
export default function Particles({ count = 26, className = '' }: { count?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let w = 0, h = 0, raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mouse = { x: -999, y: -999 };
    const isDark = theme === 'dark';
    const colors = isDark ? ['#e11d48', '#be123c', '#f43f5e', '#9f1239'] : ['#f9a8d4', '#fbcfe8', '#f472b6', '#fda4af'];

    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const make = (initial = false) => ({
      x: Math.random() * w,
      y: initial ? Math.random() * h : -20,
      s: 5 + Math.random() * (isDark ? 9 : 7),
      vy: 0.35 + Math.random() * 0.8,
      vx: -0.2 + Math.random() * 0.6,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.03,
      sway: Math.random() * Math.PI * 2,
      flip: Math.random() * Math.PI * 2,
      c: colors[Math.floor(Math.random() * colors.length)],
      a: 0.45 + Math.random() * 0.5,
    });
    const ps = Array.from({ length: count }, () => make(true));

    const maple = (s: number) => {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const ang = -Math.PI / 2 + (i * Math.PI * 2) / 5;
        const ang2 = ang + Math.PI / 5;
        ctx.lineTo(Math.cos(ang) * s, Math.sin(ang) * s);
        ctx.lineTo(Math.cos(ang2) * s * 0.42, Math.sin(ang2) * s * 0.42);
      }
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(-0.6, 0, 1.2, s * 0.9);
    };
    const petal = (s: number) => {
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s * 0.9, -s * 0.6, s * 0.7, s * 0.6, 0, s);
      ctx.bezierCurveTo(-s * 0.7, s * 0.6, -s * 0.9, -s * 0.6, 0, -s);
      ctx.fill();
    };

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        p.sway += 0.012;
        p.flip += 0.03;
        p.x += p.vx + Math.sin(p.sway) * 0.5;
        p.y += p.vy;
        p.rot += p.vr;
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
        if (d < 110) { p.x += (dx / d) * 1.8; p.y += (dy / d) * 1.2; }
        if (p.y > h + 20 || p.x > w + 30 || p.x < -30) Object.assign(p, make());

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(1, Math.abs(Math.cos(p.flip)) * 0.7 + 0.3);
        ctx.globalAlpha = p.a;
        ctx.fillStyle = p.c;
        if (isDark) { ctx.shadowColor = p.c; ctx.shadowBlur = 8; }
        if (isDark) maple(p.s); else petal(p.s);
        ctx.restore();
      }
      raf = requestAnimationFrame(tick);
    };
    tick();

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    };
    const onVis = () => { cancelAnimationFrame(raf); if (!document.hidden) tick(); };
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [theme, count]);

  return <canvas ref={ref} aria-hidden className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
