import neonChapters from './neon-chapters.json';
import sakuraChapters from './sakura-chapters.json';
import type { Chapter, Series, Weekday } from './types';
import { seeded } from '@/lib/utils';

/* ════════════════════════════════════════════════════════════════════
   CATALOG
   ────────────────────────────────────────────────────────────────────
   This file is the single source of truth for every series on Inkblade.
   To publish your own comics see README.md → "Adding your comics".

   Quick version:
   1. Put page images in  public/comics/<slug>/<chapter>/001.webp, 002.webp …
   2. In the series entry below, replace `demoChapters(...)` with real
      chapters, using the `pages()` helper:

        chapters: [
          { number: 1, title: 'The First Cut', date: '2026-11-01',
            pages: pages('crimson-moonblade', 1, 24) },
        ]

   3. Add a cover at public/comics/<slug>/cover.webp and set `cover`.
   ════════════════════════════════════════════════════════════════════ */

/** Builds page URLs: /comics/<slug>/<chapter>/001.<ext> … */
export function pages(slug: string, chapter: number, count: number, ext = 'webp'): string[] {
  return Array.from({ length: count }, (_, i) => `/comics/${slug}/${chapter}/${String(i + 1).padStart(3, '0')}.${ext}`);
}

const TITLE_A = ['The', 'A', 'Beneath the', 'Before the', 'After the', 'Within the', 'Beyond the', 'Under the'];
const TITLE_B = [
  'Silent Blade', 'Red Tide', 'Paper Oath', 'Broken Lantern', 'First Snow', 'Iron Bell', 'Long Night',
  'Hidden Gate', 'Ash Garden', 'Moon Debt', 'Ninth Scroll', 'Last Duel', 'Falling Petals', 'Crow Market',
  'Glass Shrine', 'Storm Pact', 'Hollow Crown', 'Ink Serpent', 'River of Lies', 'Burning Sky',
];

/** Generates demo chapters until real ones are uploaded. Newest chapter dropped `latestDaysAgo` days ago. */
function demoChapters(slug: string, count: number, latestDaysAgo: number, every = 7): Chapter[] {
  const r = seeded(slug + 'ch');
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const number = i + 1;
    const daysAgo = latestDaysAgo + (count - number) * every;
    const date = new Date(now - daysAgo * 86400000 - Math.floor(r() * 8) * 3600000).toISOString();
    const title = `${TITLE_A[Math.floor(r() * TITLE_A.length)]} ${TITLE_B[Math.floor(r() * TITLE_B.length)]}`;
    return { number, title, date, pages: [], placeholderPages: 14 + Math.floor(r() * 10) };
  });
}

type Seed = Omit<Series, 'chapters'> & { chapterCount: number; latestDaysAgo: number; every?: number };

const seeds: Seed[] = [
  {
    slug: 'crimson-moonblade', title: 'Crimson Moonblade', altTitle: '紅月の刃', kanji: '紅月',
    author: 'Ren Kagami', artist: 'Ren Kagami', status: 'Ongoing', year: 2023,
    genres: ['Action', 'Fantasy', 'Supernatural'], rating: 4.9, views: 48_200_000, follows: 1_940_000,
    synopsis:
      'Under a moon that bleeds every hundred years, the exiled swordsman Akane Shiro carries a blade that drinks memory instead of blood. Each cut erases a piece of who he was — and the shrine-lords who exiled him are counting on him forgetting why.',
    cover: '/theme/dark-cover.webp', banner: '/theme/dark-full.webp',
    palette: ['#e11d48', '#0b0a14'], schedule: 'Sat', direction: 'rtl', featured: true,
    weeklyScore: 98, monthlyScore: 97, chapterCount: 7, latestDaysAgo: 0.2,
  },
  {
    slug: 'sakura-oathkeeper', title: 'Sakura Oathkeeper', altTitle: '桜の誓い', kanji: '桜誓',
    author: 'Mio Hanazono', artist: 'Kei Arashi', status: 'Ongoing', year: 2024,
    genres: ['Fantasy', 'Adventure', 'Romance'], rating: 4.8, views: 36_700_000, follows: 1_520_000,
    synopsis:
      'Sworn to guard a sky-castle that only appears at sunrise, Yuki Shirogane has kept her oath for three hundred dawns. When a stranger climbs the waterfall stair carrying her own lost sword, the oath begins to unravel petal by petal.',
    cover: '/theme/light-cover.webp', banner: '/theme/light-full.webp',
    palette: ['#d03e74', '#f2ecfb'], schedule: 'Wed', direction: 'rtl', featured: true,
    weeklyScore: 95, monthlyScore: 96, chapterCount: 8, latestDaysAgo: 1,
  },
  {
    slug: 'neon-kitsune', cover: '/comics/neon-kitsune/cover.png', title: 'Neon Kitsune', altTitle: '電狐', kanji: '電狐',
    author: 'Aya Takeda', artist: 'Studio Hoshi', status: 'Ongoing', year: 2025,
    genres: ['Sci-Fi', 'Mystery', 'Thriller'], rating: 4.6, views: 18_400_000, follows: 760_000,
    synopsis:
      'Neo-Kyoto, 2189. A fox spirit trapped inside a city-wide AI starts leaving riddles in traffic lights. Hacker-courier Sora is the only one who can read them — and every answer gets someone erased from the grid.',
    palette: ['#22d3ee', '#1e1b4b'], schedule: 'Fri', direction: 'ltr',
    weeklyScore: 92, monthlyScore: 84, chapterCount: 4, latestDaysAgo: 0.6,
  },
];

export const catalog: Series[] = seeds.map(({ chapterCount, latestDaysAgo, every, ...s }) => ({
  ...s,
  chapters: s.slug === 'neon-kitsune' ? neonChapters : s.slug === 'sakura-oathkeeper' ? sakuraChapters : demoChapters(s.slug, chapterCount, latestDaysAgo, every).map((chapter) =>
    s.slug === 'crimson-moonblade' && chapter.number === 1
      ? { ...chapter, title: 'After the Hollow Crown', pages: pages(s.slug, 1, 6, 'png'), placeholderPages: undefined }
      : s.slug === 'crimson-moonblade' && chapter.number === 2
      ? { ...chapter, title: 'Beneath the Paper Oath', pages: pages(s.slug, 2, 6, 'png'), placeholderPages: undefined }
      : s.slug === 'crimson-moonblade' && chapter.number === 3
      ? { ...chapter, title: 'Beneath the Last Duel', pages: pages(s.slug, 3, 6, 'png'), placeholderPages: undefined }
      : s.slug === 'crimson-moonblade' && chapter.number === 4
      ? { ...chapter, title: 'A Falling Petals', pages: pages(s.slug, 4, 6, 'png'), placeholderPages: undefined }
      : s.slug === 'crimson-moonblade' && chapter.number === 5
      ? { ...chapter, title: "Within the Red Tide", pages: pages(s.slug, 5, 6, 'png'), placeholderPages: undefined }
      : s.slug === 'crimson-moonblade' && chapter.number === 6
      ? { ...chapter, title: "Beyond the Ash Garden", pages: pages(s.slug, 6, 6, 'png'), placeholderPages: undefined }
      : s.slug === 'crimson-moonblade' && chapter.number === 7
      ? { ...chapter, title: "The Hidden Gate", date: '2026-11-10T17:14:41.1190379Z', pages: pages(s.slug, 7, 6, 'png'), placeholderPages: undefined }
      : chapter,
  ),
}));

export const genres = Array.from(new Set(catalog.flatMap((s) => s.genres))).sort();

export const genreKanji: Record<string, string> = {
  Action: '闘', Adventure: '旅', Comedy: '笑', Fantasy: '幻', Historical: '史', Horror: '怖',
  'Martial Arts': '武', Mystery: '謎', Psychological: '心', Romance: '恋', School: '学',
  'Sci-Fi': '機', 'Slice of Life': '日', Supernatural: '霊', Thriller: '緊',
};

export const weekdays: Weekday[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const getSeries = (slug?: string) => catalog.find((s) => s.slug === slug);
export const latestChapter = (s: Series) => s.chapters[s.chapters.length - 1];

export const latestUpdates = () =>
  catalog
    .map((s) => ({ series: s, chapter: latestChapter(s) }))
    .filter((x) => x.chapter)
    .sort((a, b) => +new Date(b.chapter.date) - +new Date(a.chapter.date));

