import { Link } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';

export default function Logo({ className = '', variant = 'navbar' }: { className?: string; variant?: 'navbar' | 'footer' }) {
  const { theme } = useTheme();
  const footer = variant === 'footer';

  return (
    <Link to="/" className={`inline-flex shrink-0 items-center gap-2.5 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${className}`} aria-label="InkBlade home">
      <span className={`relative block shrink-0 overflow-hidden rounded-xl ${footer ? 'h-40 w-40' : 'h-14 w-14'}`}>
        {(['dark', 'light'] as const).map((mode) => (
          <img
            key={mode}
            src={`${import.meta.env.BASE_URL}branding/inkblade-${mode}.png`}
            alt=""
            aria-hidden="true"
            width={1254}
            height={1254}
            className={`absolute inset-0 h-full w-full object-contain ${theme === mode ? 'visible' : 'invisible'}`}
            loading={footer ? 'lazy' : 'eager'}
            draggable={false}
          />
        ))}
      </span>
      {!footer && (
        <span className="hidden leading-none xl:block">
          <span className="block font-display text-lg font-extrabold tracking-tight">InkBlade</span>
          <span className="block font-mono text-[9px] uppercase tracking-[0.3em] text-muted">墨刃 · Manga</span>
        </span>
      )}
    </Link>
  );
}
