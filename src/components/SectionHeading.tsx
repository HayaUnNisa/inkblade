import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { SplitHeading } from './Reveal';

export default function SectionHeading({ eyebrow, title, jp, to, action }: { eyebrow: string; title: string; jp?: string; to?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="relative">
        {jp && (
          <span aria-hidden className="pointer-events-none absolute -left-2 -top-8 select-none font-brush text-7xl text-accent/10 sm:text-8xl">
            {jp}
          </span>
        )}
        <p className="eyebrow relative">{eyebrow}</p>
        <h2 className="relative mt-3 font-display text-3xl font-extrabold leading-tight sm:text-4xl">
          <SplitHeading text={title} />
        </h2>
      </div>
      <div className="flex items-center gap-5">
      {action}
      {to && (
        <Link to={to} className="group inline-flex items-center gap-1.5 text-sm font-bold text-muted transition-colors hover:text-accent">
          View all
          <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      )}
      </div>
    </div>
  );
}
