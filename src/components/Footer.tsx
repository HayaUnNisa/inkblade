import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, AtSign, Globe, MessageCircle, Rss } from 'lucide-react';
import { genres } from '@/data/catalog';
import { useToast } from '@/context/ToastContext';
import Logo from './Logo';

export default function Footer() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast('Please enter a valid email');
    setEmail('');
    toast('You’re on the list — new chapters every Friday');
  };

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
            <div className="mt-6 flex gap-2">
              {[AtSign, MessageCircle, Globe, Rss].map((I, i) => (
                <a key={i} href="#" aria-label="Social link" className="grid h-10 w-10 place-items-center rounded-full border hairline text-muted transition-all hover:-translate-y-0.5 hover:border-accent hover:text-accent">
                  <I size={16} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">Explore</h4>
            <ul className="mt-5 space-y-3 text-sm font-medium">
              {[['Browse', '/browse'], ['Latest updates', '/browse?sort=updated'], ['Rankings', '/rankings'], ['My library', '/library']].map(([l, to]) => (
                <li key={to}><Link to={to} className="transition-colors hover:text-accent">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">Genres</h4>
            <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm font-medium">
              {genres.slice(0, 8).map((g) => (
                <li key={g}><Link to={`/browse?genre=${encodeURIComponent(g)}`} className="transition-colors hover:text-accent">{g}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">New chapter alerts</h4>
            <p className="mt-5 text-sm text-muted">One email a week. Only the chapters worth staying up for.</p>
            <form onSubmit={submit} className="mt-4 flex gap-2">
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@email.com" aria-label="Email" className="input rounded-full" />
              <button className="btn btn-primary shrink-0 px-4" aria-label="Subscribe"><ArrowRight size={16} /></button>
            </form>
          </div>
        </div>
        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t hairline pt-6 text-xs text-muted sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Inkblade. All series are fictional demo content.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-ink">Terms</a><a href="#" className="hover:text-ink">Privacy</a><a href="#" className="hover:text-ink">Creators</a>
          </div>
        </div>
        <p aria-hidden className="pointer-events-none mt-10 select-none text-center font-display text-[18vw] font-extrabold leading-[0.8] tracking-tighter text-stroke opacity-60 lg:text-[13rem]">
          INKBLADE
        </p>
      </div>
    </footer>
  );
}

