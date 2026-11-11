import { useRef, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import type { Series } from '@/data/types';
import { latestChapter } from '@/data/catalog';
import { cn, isNew, timeAgo } from '@/lib/utils';
import { useLibrary } from '@/context/LibraryContext';
import { useToast } from '@/context/ToastContext';
import Cover from './Cover';

/** Cover card with 3D tilt, light glare, halftone dissolve and hover detail reveal. */
export default function SeriesCard({ series, rank, className }: { series: Series; rank?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { isBookmarked, toggleBookmark } = useLibrary();
  const toast = useToast();
  const last = latestChapter(series);
  const marked = isBookmarked(series.slug);

  const onMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty('--rx', `${(0.5 - y) * 12}deg`);
    el.style.setProperty('--ry', `${(x - 0.5) * 14}deg`);
    el.style.setProperty('--gx', `${x * 100}%`);
    el.style.setProperty('--gy', `${y * 100}%`);
  };
  const onLeave = () => {
    ref.current?.style.setProperty('--rx', '0deg');
    ref.current?.style.setProperty('--ry', '0deg');
  };

  return (
    <div className={cn('group relative', className)} style={{ perspective: 900 }}>
      <Link to={`/series/${series.slug}`} className="block" aria-label={series.title}>
        <div
          ref={ref}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-card shadow-[0_20px_40px_-20px_rgb(0_0_0/0.6)] transition-transform duration-500 ease-silk will-change-transform"
          style={{ transform: 'rotateX(var(--rx,0)) rotateY(var(--ry,0))', transformStyle: 'preserve-3d' }}
        >
          <div className="halftone h-full w-full transition-transform duration-700 ease-silk group-hover:scale-[1.06]">
            <Cover series={series} />
          </div>
          {/* glare */}
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: 'radial-gradient(circle at var(--gx,50%) var(--gy,50%), rgb(255 255 255 / .28), transparent 45%)' }}
          />
          {/* detail reveal */}
          <div className="absolute inset-x-0 bottom-0 translate-y-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pt-10 text-white opacity-0 transition-all duration-500 ease-silk group-hover:translate-y-0 group-hover:opacity-100">
            <div className="flex items-center gap-3 text-[11px] font-semibold">
              <span>{series.chapters.length} chapters</span>
              
              <span className="ml-auto opacity-80">Ch. {last?.number}</span>
            </div>
            <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed opacity-80">{series.synopsis}</p>
          </div>
          {last && isNew(last.date) && <span className="stamp absolute left-3 top-3">New</span>}
          {rank !== undefined && (
            <span className="absolute bottom-2 left-2 font-display text-6xl font-extrabold leading-none text-white/95 drop-shadow-[0_4px_12px_rgb(0_0_0/0.8)] transition-opacity group-hover:opacity-0">
              {rank}
            </span>
          )}
        </div>
      </Link>
      <button
        onClick={() => toast(toggleBookmark(series.slug) ? `Added “${series.title}” to library` : 'Removed from library')}
        aria-label={marked ? 'Remove bookmark' : 'Bookmark'}
        className={cn(
          'absolute right-2.5 top-2.5 grid h-9 w-9 place-items-center rounded-full backdrop-blur-md transition-all duration-300',
          marked ? 'bg-accent text-white' : 'bg-black/40 text-white opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
        )}
      >
        <Bookmark size={15} className={marked ? 'fill-white' : ''} />
      </button>
      <div className="mt-3 px-0.5">
        <Link to={`/series/${series.slug}`} className="line-clamp-1 font-display text-[15px] font-bold transition-colors hover:text-accent">
          {series.title}
        </Link>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
          <span className="line-clamp-1">{series.genres.slice(0, 2).join(' · ')}</span>
          {last && <span className="ml-auto shrink-0">{timeAgo(last.date)}</span>}
        </div>
      </div>
    </div>
  );
}
