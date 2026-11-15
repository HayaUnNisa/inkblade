import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { catalog } from '@/data/catalog';
import faq from '@/data/faq.json';
const origin = 'https://www.inkblade.xyz';
export default function Seo() {
  const { pathname } = useLocation();
  useEffect(() => {
    const parts = pathname.split('/').filter(Boolean);
    const series = catalog.find(s => s.slug === parts[1]);
    const chapter = series?.chapters.find(c => String(c.number) === parts[2]);
    const isSeries = parts[0] === 'series' && parts.length === 2 && !!series;
    const isChapter = parts[0] === 'read' && parts.length === 3 && !!chapter;
    const names: Record<string, string> = { '/': 'InkBlade — Manga & Comics', '/browse': 'Browse comics', '/rankings': 'Series rankings', '/about': 'About InkBlade', '/contact': 'Contact InkBlade', '/privacy': 'Privacy policy', '/terms': 'Terms & conditions', '/creators': 'Creators & credits', '/library': 'My library' };
    const known = !!names[pathname] || isSeries || isChapter;
    const title = isChapter ? `${series!.title} — Chapter ${chapter!.number}: ${chapter!.title}` : isSeries ? series!.title : names[pathname] || 'Page not found';
    const description = (isSeries || isChapter) ? series!.synopsis : 'Read Crimson Moonblade, Sakura Oathkeeper, Neon Kitsune and The Last Table on InkBlade. Explore illustrated stories and published chapters.';
    const url = origin + pathname;
    const cover = origin + ((isSeries || isChapter) ? series!.cover : '/og-image.png');
    document.title = title + (pathname === '/' ? '' : ' | InkBlade');
    function meta(key: string, content: string, property = false) {
      const attr = property ? 'property' : 'name';
      let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.append(el); }
      el.content = content;
    }
    meta('description', description); meta('robots', !known || pathname === '/library' ? 'noindex, follow' : 'index, follow');
    for (const [key,value] of Object.entries({ 'og:title': document.title, 'og:description': description, 'og:url': url, 'og:image': cover, 'og:type': 'website' })) meta(key,value,true);
    meta('twitter:card','summary_large_image'); meta('twitter:title',document.title); meta('twitter:description',description); meta('twitter:image',cover);
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.append(canonical); }
    canonical.href = url;
    const graph: object[] = [{ '@type': 'WebSite', '@id': origin+'/#website', name: 'InkBlade', url: origin+'/', inLanguage: 'en' }];
    if (isSeries) graph.push({ '@type': 'ComicSeries', '@id': url+'#series', name: series!.title, description, url, image: cover, genre: series!.genres, inLanguage: 'en', isAccessibleForFree: true, creditText: `Story: ${series!.author}; Art: ${series!.artist}. Creative catalog names; see Creators & credits.`, hasPart: series!.chapters.map(c => ({ '@type': 'ComicStory', name: c.title, url: `${origin}/read/${series!.slug}/${c.number}` })) });
    if (isChapter) graph.push({ '@type': 'ComicStory', '@id': url+'#story', name: title, url, description, image: chapter!.pages.map(p => origin+p), inLanguage: 'en', isAccessibleForFree: true, isPartOf: { '@type': 'ComicSeries', '@id': `${origin}/series/${series!.slug}#series`, name: series!.title } });
    if (pathname === '/about') graph.push({ '@type': 'FAQPage', '@id': url+'#faq', mainEntity: faq.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })) });
    if (known && pathname !== '/') graph.push({ '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'InkBlade', item: origin+'/' }, ...(isChapter ? [{ '@type': 'ListItem', position: 2, name: series!.title, item: `${origin}/series/${series!.slug}` }] : []), { '@type': 'ListItem', position: isChapter ? 3 : 2, name: title, item: url }] });
    const script = document.createElement('script'); script.type = 'application/ld+json'; script.id = 'inkblade-schema'; script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c'); document.head.append(script);
    return () => { script.remove(); };
  }, [pathname]);
  return null;
}
