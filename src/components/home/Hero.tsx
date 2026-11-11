import { useEffect, useState, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, BookOpen, Play, Star } from 'lucide-react';
import { catalog, latestChapter } from '@/data/catalog';
import { useTheme } from '@/context/ThemeContext';
import { compact } from '@/lib/utils';
import Particles from '../Particles';
import Counter from '../Counter';
import Cover from '../Cover';

const featured = catalog.filter((s) => s.featured);
const totalChapters = catalog.reduce((n, s) => n + s.chapters.length, 0);
const totalViews = catalog.reduce((n, s) => n + s.views, 0);

export default function Hero() {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });
  const artX = useTransform(sx, (v) => v * -18);
  const artY = useTransform(sy, (v) => v * -12);
  const textX = useTransform(sx, (v) => v * 6);
  const { scrollY } = useScroll();
  const artScroll = useTransform(scrollY, [0, 900], [0, 140]);
  const fade = useTransform(scrollY, [0, 600], [1, 0.2]);

  const onMove = (e: MouseEvent) => {
    mx.set(e.clientX / window.innerWidth - 0.5);
    my.set(e.clientY / window.innerHeight - 0.5);
  };

  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setIdx((i) => (i + 1) % featured.length), 6500);
    return () => window.clearInterval(t);
  }, [idx]);
  const f = featured[idx];
  const fLast = latestChapter(f);

  return (
    <section onMouseMove={onMove} className="relative isolate flex min-h-[100svh] items-center overflow-hidden pb-40 pt-32 lg:pb-32">
      {/* ambient glow */}
      <div aria-hidden className="absolute inset-0 -z-20" style={{ background: dark
        ? 'radial-gradient(ellipse 60% 50% at 75% 20%, rgb(225 29 72 / .22), transparent 60%), radial-gradient(ellipse 50% 60% at 10% 90%, rgb(91 33 182 / .18), transparent 60%)'
        : 'radial-gradient(ellipse 60% 50% at 75% 20%, rgb(255 255 255 / .9), transparent 60%), radial-gradient(ellipse 50% 60% at 10% 90%, rgb(244 114 182 / .18), transparent 60%)' }} />

      {/* character art */}
      <motion.div aria-hidden style={{ x: artX, y: artY }} className="absolute inset-y-0 right-0 -z-10 w-full lg:w-[58%] xl:w-[54%]">
        <motion.div
          style={{
            y: artScroll, opacity: fade,
            backgroundImage: 'var(--hero)', backgroundSize: 'cover', backgroundPosition: 'center 8%',
            maskImage: 'linear-gradient(to right, transparent 0%, #000 38%), linear-gradient(to top, transparent 0%, #000 30%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, #000 38%), linear-gradient(to top, transparent 0%, #000 30%)',
            maskComposite: 'intersect', WebkitMaskComposite: 'source-in',
          }}
          className="absolute -inset-x-6 -top-10 bottom-[-10%] opacity-30 lg:opacity-100"
        />
      </motion.div>
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-bg via-bg/80 to-transparent lg:via-bg/40" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-bg to-transparent" />

      <Particles count={30} />

      <span aria-hidden className="vertical-jp pointer-events-none absolute left-[44%] top-36 hidden font-brush text-2xl text-ink/25 xl:block">
        {dark ? '紅月の刃　夜の章' : '桜の誓い　朝の章'}
      </span>

      <motion.div style={{ x: textX }} className="page-x relative">
        <div className="max-w-2xl">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="eyebrow">
            Now serialising · {catalog.filter((s) => s.status === 'Ongoing').length} ongoing series
          </motion.p>
          <h1 className="mt-6 font-display text-[clamp(2.8rem,7vw,5.8rem)] font-extrabold leading-[0.95] tracking-tight">
            {['Stories', 'forged'].map((w, i) => (
              <span key={w} className="inline-block overflow-hidden pb-2 align-bottom">
                <motion.span className="inline-block" initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ delay: 0.5 + i * 0.08, duration: 1, ease: [0.22, 1, 0.36, 1] }}>
                  {w}&nbsp;
                </motion.span>
              </span>
            ))}
            <br />
            <span className="inline-block overflow-hidden pb-2 align-bottom">
              <motion.span className="inline-block" initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ delay: 0.66, duration: 1, ease: [0.22, 1, 0.36, 1] }}>
                in <em className="relative not-italic text-accent">
                  ink
                  <motion.svg viewBox="0 0 200 20" className="absolute -bottom-1 left-0 w-full" preserveAspectRatio="none">
                    <motion.path d="M2 14 C 50 4, 120 4, 198 10" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.3, duration: 0.8, ease: [0.7, 0, 0.2, 1] }} />
                  </motion.svg>
                </em> &amp; steel.
              </motion.span>
            </span>
          </h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.8 }} className="mt-7 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
            Premium manga and comics from bold new creators. Read in a cinematic reader, follow your favourite series and never miss a chapter drop.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05, duration: 0.8 }} className="mt-9 flex flex-wrap gap-3">
            <Link to={`/read/${catalog[0].slug}/${latestChapter(catalog[0]).number}`} className="btn btn-primary"><Play size={16} className="fill-white" /> Start reading</Link>
            <Link to="/browse" className="btn btn-ghost"><BookOpen size={16} /> Browse library</Link>
          </motion.div>
          <motion.dl initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }} className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t hairline pt-6">
            {[
              ['Series', <Counter key="a" to={catalog.length} />],
              ['Chapters', <Counter key="b" to={totalChapters} />],
              ['Reads', <Counter key="c" to={totalViews} format={(n) => compact(n)} />],
            ].map(([l, v]) => (
              <div key={l as string}>
                <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">{l}</dt>
                <dd className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">{v}</dd>
              </div>
            ))}
          </motion.dl>
        </div>
      </motion.div>

      {/* featured rotator */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4, duration: 0.8 }} className="absolute bottom-8 right-4 left-4 sm:left-auto sm:right-6 lg:right-10 sm:w-[380px]">
        <div className="glass overflow-hidden rounded-2xl shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.div key={f.slug} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }}>
              <Link to={`/series/${f.slug}`} className="group flex gap-4 p-3">
                <div className="h-24 w-16 shrink-0 overflow-hidden rounded-lg"><Cover series={f} showTitle={false} /></div>
                <div className="min-w-0 flex-1 py-1">
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">Featured</p>
                  <p className="mt-1 truncate font-display text-lg font-bold group-hover:text-accent">{f.title}</p>
                  <p className="truncate text-xs text-muted">{f.genres.join(' · ')}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs font-semibold">
                    <span className="flex items-center gap-1"><Star size={12} className="fill-amber-400 text-amber-400" />{f.rating}</span>
                    <span className="text-muted">Ch. {fLast.number}</span>
                    <ArrowRight size={14} className="ml-auto text-accent transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </motion.div>
          </AnimatePresence>
          <div className="flex gap-1.5 px-3 pb-3">
            {featured.map((s, i) => (
              <button key={s.slug} onClick={() => setIdx(i)} aria-label={`Show ${s.title}`} className="relative h-1 flex-1 overflow-hidden rounded-full bg-line/10">
                {i === idx && <motion.span key={idx} className="absolute inset-0 origin-left bg-accent" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 6.5, ease: 'linear' }} />}
                {i < idx && <span className="absolute inset-0 bg-accent/50" />}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div aria-hidden initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }} className="absolute bottom-10 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-muted xl:flex">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <span className="relative h-10 w-px overflow-hidden bg-line/15">
          <motion.span className="absolute inset-x-0 top-0 h-4 bg-accent" animate={{ y: [-16, 40] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }} />
        </span>
      </motion.div>
    </section>
  );
}
