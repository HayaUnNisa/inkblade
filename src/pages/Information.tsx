import { Link } from 'react-router-dom';
import { catalog } from '@/data/catalog';

const privacy = [
  ['About this policy', 'This policy describes the current InkBlade reading website. It explains the information used when you browse comics and save reading preferences. Updated November 11, 2026.'],
  ['Information saved on your device', 'InkBlade saves your theme, reader settings, bookmarks and reading progress in your browser’s local storage. These features do not require an account. They are specific to your browser and are not automatically synchronized across devices.'],
  ['Website delivery and external services', 'Your browser sends technical information, such as your IP address and requested files, to the service hosting this website. Hosting providers may retain access or security logs under their own policies. The website also loads fonts from Google Fonts, which receives requests from your browser.'],
  ['Email, accounts and tracking', 'The current website does not provide account registration, payments or an email subscription service. Its application code does not include advertising trackers or analytics tools, and it does not send your locally saved library or reading history to a server.'],
  ['Your choices', 'You can remove individual bookmarks and clear reading history in My library. To remove all locally saved InkBlade preferences, clear this website’s site data in your browser settings. Clearing site data resets your saved library, progress and preferences. Your browser controls how long local data is retained.'],
  ['Changes and external links', 'This policy will be updated when the website’s data practices change. Links to other websites are subject to those websites’ policies. Review this page again when new services are introduced.'],
];
const terms = [
  ['Using InkBlade', 'These terms cover use of the InkBlade website and comic reader. By using the website, you agree to these terms. If you do not agree, please stop using the website. Updated November 11, 2026.'],
  ['Reading and personal use', 'You may browse the published comics and use the reading and library features for personal, non-commercial enjoyment. Access to the website does not transfer ownership of its content or grant permission to sell or commercially redistribute it.'],
  ['Content and credits', 'Stories are fictional. Some artwork and story material are created with AI assistance. Credits identify the names used in the catalog and do not imply that an outside creator or studio endorses the website. Respect any applicable rights and licenses in artwork, text, branding and software.'],
  ['Acceptable use', 'Do not attempt to interfere with the website, bypass access controls, introduce harmful code, impersonate other people, or use its content unlawfully. Do not present someone else’s work as your own.'],
  ['Availability and saved progress', 'Chapters and features may be added, corrected or removed. Availability and update schedules are not guaranteed. Bookmarks and reading progress are stored in your browser; clearing site data or changing browsers can remove them. Keep your own record if you need a permanent reading list.'],
  ['Changes and your rights', 'These terms may be updated as the website develops. The date on this page identifies the latest version. Nothing in these terms is intended to remove rights that cannot be excluded under applicable law.'],
];

export default function Information({ kind }: { kind: 'privacy' | 'terms' | 'creators' }) {
  const title = kind === 'privacy' ? 'Privacy policy' : kind === 'terms' ? 'Terms & conditions' : 'Creators & credits';
  return <div className="page-x pb-12 pt-32">
    <article className="mx-auto max-w-3xl">
      <p className="eyebrow">InkBlade</p>
      <h1 className="mt-4 font-display text-4xl font-extrabold sm:text-5xl">{title}</h1>
      {kind === 'creators' ? <>
        <p className="mt-6 leading-relaxed text-muted">Explore the credits listed for our three published series. These are the creative names used in the catalog; the stories and illustrations include AI-assisted material.</p>
        <div className="mt-8 space-y-4">{catalog.map(s => <section key={s.slug} className="rounded-2xl border hairline bg-card/40 p-6">
          <h2 className="font-display text-2xl font-bold"><Link className="hover:text-accent" to={`/series/${s.slug}`}>{s.title}</Link></h2>
          <p className="mt-3 text-muted">Story: {s.author} · Art: {s.artist}</p>
          <Link className="mt-3 inline-block text-accent" to={`/series/${s.slug}`}>Explore series →</Link>
        </section>)}</div>
      </> : <div className="mt-8 space-y-8">{(kind === 'privacy' ? privacy : terms).map(([heading, body]) => <section key={heading}>
        <h2 className="font-display text-2xl font-bold">{heading}</h2><p className="mt-3 leading-8 text-muted">{body}</p>
      </section>)}{kind === 'privacy' && <p className="leading-8 text-muted">More about external font requests: <a className="text-accent underline" href="https://developers.google.com/fonts/faq/privacy">Google Fonts privacy information</a>.</p>}</div>}
      <nav aria-label="Information pages" className="mt-12 flex flex-wrap gap-6 border-t hairline pt-6 text-accent"><Link to="/browse">Browse comics</Link><Link to="/privacy">Privacy policy</Link><Link to="/terms">Terms & conditions</Link><Link to="/creators">Creators</Link></nav>
    </article>
  </div>;
}
