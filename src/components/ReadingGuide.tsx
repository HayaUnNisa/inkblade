import guides from '@/data/reading-guides.json';
import { Link } from 'react-router-dom';

export default function ReadingGuide({ slug, chapter }: { slug: string; chapter?: number }) {
  const guide = guides[slug as keyof typeof guides];
  if (!guide) return null;
  if (chapter !== undefined) return <section id="reading-notes" aria-label="Chapter reading notes" className="mx-auto max-w-3xl space-y-4 px-6 py-10 leading-8">
    <h2 className="font-display text-2xl font-bold">Chapter {chapter} reading notes</h2>
    <p>{guide.chapters[chapter - 1]}</p>
    <p>{guide.reading}</p>
    <Link className="text-accent underline" to={`/series/${slug}`}>Series guide and chapter list</Link>
    <p><Link className="text-accent underline" to={`/contact?series=${slug}`}>Report a page or share feedback</Link></p>
  </section>;
  return <section className="page-x space-y-6 pt-12 leading-8" aria-label="Series reading guide">
    <h2 className="font-display text-3xl font-bold">Inside the story</h2><p className="max-w-3xl">{guide.introduction}</p>
    <h3 className="font-display text-2xl font-bold">Characters</h3><ul className="max-w-3xl list-disc space-y-3 pl-5">{guide.characters.map(c => <li key={c}>{c}</li>)}</ul>
    <h3 className="font-display text-2xl font-bold">What to look for</h3><p className="max-w-3xl">{guide.themes}</p>
    <h3 className="font-display text-2xl font-bold">Reading this series</h3><p className="max-w-3xl">{guide.reading}</p>
  </section>;
}
