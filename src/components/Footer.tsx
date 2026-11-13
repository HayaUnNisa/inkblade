
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { genres } from '@/data/catalog';

import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t hairline">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{ backgroundImage: 'var(--hero-lower)', backgroundSize: 'cover', backgroundPosition: 'center 60%', maskImage: 'linear-gradient(to top, #000 10%, transparent 90%)', WebkitMaskImage: 'linear-gradient(to top, #000 10%, transparent 90%)' }}
      />
      <div className="page-x relative py-16">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1.3fr]">
          <div>
            <Logo variant="footer" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">
              A home for stories forged in ink and steel. Read, follow and collect the series that keep you up past midnight.
            </p>

          </div>
          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">Explore</h4>
            <ul className="mt-5 space-y-3 text-sm font-medium">
              {[['Browse', '/browse'], ['Latest updates', '/browse?sort=updated'], ['Rankings', '/rankings'], ['My library', '/library']].map(([l, to]) => (
                <li key={to}><Link state={{ scrollToTop: true }} to={to} className="transition-colors hover:text-accent">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">Genres</h4>
            <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm font-medium">
              {genres.map((g) => (
                <li key={g}><Link state={{ scrollToTop: true }} to={`/browse?genre=${encodeURIComponent(g)}`} className="transition-colors hover:text-accent">{g}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">Keep reading</h4><p className="mt-5 text-sm text-muted">Find the newest chapters, or save a series to your library to return to it later.</p><Link state={{ scrollToTop: true }} to="/browse?sort=updated" className="btn btn-primary mt-4">View latest chapters <ArrowRight size={16} /></Link>
          </div>
        </div>
        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t hairline pt-6 text-xs text-muted sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Inkblade. Stories and artwork presented on InkBlade.</p>
          <div className="flex flex-wrap gap-6"><Link state={{ scrollToTop: true }} to="/about" className="hover:text-ink">About</Link>
            <Link state={{ scrollToTop: true }} to="/contact" className="hover:text-ink">Contact & feedback</Link>
            <Link state={{ scrollToTop: true }} to="/terms" className="hover:text-ink">Terms &amp; conditions</Link><Link state={{ scrollToTop: true }} to="/privacy" className="hover:text-ink">Privacy policy</Link><Link state={{ scrollToTop: true }} to="/creators" className="hover:text-ink">Creators</Link>
          </div>
        </div>
        <p aria-hidden className="pointer-events-none mt-10 select-none text-center font-display text-[18vw] font-extrabold leading-[0.8] tracking-tighter text-stroke opacity-60 lg:text-[13rem]">
          INKBLADE
        </p>
      </div>
    </footer>
  );
}



