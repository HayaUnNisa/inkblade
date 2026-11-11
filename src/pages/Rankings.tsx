import { catalog } from '@/data/catalog';
import SeriesCard from '@/components/SeriesCard';

export default function Rankings() {
  const list = [...catalog].sort((a, b) => b.chapters.length - a.chapters.length);
  return <div className="page-x pb-12 pt-32">
    <p className="eyebrow">By published chapter count</p>
    <h1 className="mt-4 font-display text-5xl font-extrabold">Rankings</h1>
    <p className="mt-4 max-w-2xl text-muted">Find your next longer read. Series are ordered by the number of published chapters. Reader ratings and popularity tracking are not available.</p>
    <ol className="mt-10 grid max-w-4xl grid-cols-2 gap-6 sm:grid-cols-3">
      {list.map((s, i) => <li key={s.slug}><SeriesCard series={s} rank={i + 1} /><p className="mt-3 text-sm text-muted">{s.chapters.length} published chapters</p></li>)}
    </ol>
  </div>;
}
