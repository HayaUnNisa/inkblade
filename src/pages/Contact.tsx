import { Link, useSearchParams } from 'react-router-dom';
import { Send } from 'lucide-react';
import { catalog } from '@/data/catalog';

export default function Contact() {
  const [params] = useSearchParams();
  const series = catalog.find(s => s.slug === params.get('series'));
  return <div className="page-x pb-16 pt-32">
    <div className="mx-auto max-w-2xl">
      <p className="eyebrow">Your voice matters</p>
      <h1 className="mt-4 font-display text-4xl font-extrabold sm:text-5xl">Contact & feedback</h1>
      <p className="mt-5 leading-7 text-muted">Tell us what you think of a story, suggest an improvement, or report a problem. Messages go privately to the InkBlade team and are not posted as public comments.</p>
      <form action="https://formspree.io/f/mgakeybq" method="POST" className="mt-8 space-y-6 rounded-2xl border hairline bg-card/40 p-6 sm:p-8">
        <input type="hidden" name="_subject" value="InkBlade reader feedback" />
        <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
        <div><label htmlFor="contact-name" className="mb-2 block text-sm font-semibold">Name (optional)</label><input id="contact-name" name="name" autoComplete="name" maxLength={100} className="input" /></div>
        <div><label htmlFor="contact-email" className="mb-2 block text-sm font-semibold">Email</label><input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={254} className="input" aria-describedby="email-help" /><p id="email-help" className="mt-2 text-xs text-muted">Used to respond to your message, not to subscribe you to marketing.</p></div>
        <div><label htmlFor="contact-topic" className="mb-2 block text-sm font-semibold">What is your message about?</label><select id="contact-topic" name="topic" className="input" defaultValue="Story opinion"><option>Story opinion</option><option>Suggestion</option><option>Technical support</option><option>Privacy request</option><option>Copyright concern</option><option>Other</option></select></div>
        <div><label htmlFor="contact-series" className="mb-2 block text-sm font-semibold">Series (optional)</label><select id="contact-series" name="series" className="input" defaultValue={series?.title ?? ''}><option value="">General website feedback</option>{catalog.map(s => <option key={s.slug} value={s.title}>{s.title}</option>)}</select></div>
        <div><label htmlFor="contact-message" className="mb-2 block text-sm font-semibold">Your message</label><textarea id="contact-message" name="message" required minLength={10} maxLength={5000} rows={7} className="input resize-y" placeholder="Share your thoughts. For an issue, include the series, chapter and page number." /><p className="mt-2 text-xs text-muted">10–5,000 characters. Please do not include passwords or sensitive personal information.</p></div>
        <p className="text-sm leading-6 text-muted">Submitting sends your details and message to InkBlade through Formspree. You will continue to Formspree for confirmation or any required spam check. Read our <Link className="text-accent underline" to="/privacy">privacy policy</Link>.</p>
        <button type="submit" className="btn btn-primary"><Send size={16} />Send message</button>
      </form>
    </div>
  </div>;
}
