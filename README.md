# Inkblade — Manga & Comics Platform

A professional manga/comics reading platform. It has a blood-moon **night** theme and a sakura **day** theme, built with **React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion + React Router**.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npm run preview    # preview the production build
```

**Deploy:** push to GitHub and import into Vercel. The `vercel.json` rewrite is already included, so deep links like `/series/...` work.

---

## Pages

| Route | What it does |
|---|---|
| `/` | Home: hero, ticker, continue reading, trending, latest chapters, weekly schedule, genres, spotlight, rankings, creator CTA |
| `/browse` | Search, multi-genre filter, status, sort, grid/list view. All filters are kept in the URL, so you can share them |
| `/series/:slug` | Series details, chapter list (search + sort + read markers), bookmark, share, related series |
| `/read/:slug/:chapter` | Full-screen reader (see below) |
| `/library` | Saved series + reading history (stored per device in localStorage) |
| `/rankings` | Weekly / Monthly / All-time / Top-rated podium + leaderboard |

## Reader features
- **Single page**, **Spread** (two pages) and **Webtoon** (vertical scroll) layouts
- **Manga RTL** or **Comic LTR** direction, fit to height or width, zoom 50–200%
- Page-turn animation, tap zones, keyboard (← → Space, F = fullscreen, Esc = back)
- Page grid, page slider, chapter switcher, previous/next chapter, end-of-chapter card
- Auto-hiding controls and preloading of the next pages
- Saves progress automatically, which powers "Continue reading"

## Signature effects (unique to this build)
- **Katana-slash theme switch:** a blade flash, then a diagonal cut reveals the new theme. It uses the View Transitions API and falls back to an instant switch in older browsers.
- **Blood-moon ⇄ sun morphing toggle icon**
- **Falling foliage canvas:** maple leaves at night, sakura petals by day. The leaves move away from the cursor.
- **Ink-bleed reveals:** sections spread in like ink on paper.
- **Speed-line burst** on button hover, **halftone dots** that dissolve on card hover
- **3D tilt + glare** cover cards, **brush curtain** route transitions
- Manga-panel **genre grid**, vertical **Japanese text accents**, film-grain overlay
- **⌘K / Ctrl K / "/"** command palette search

---

## Adding your comics (step by step)

Everything lives in **`src/data/catalog.ts`**.

### 1. Upload images
Put the files here (WebP or JPG, around 1200–1600 px wide is ideal):

```
public/comics/<series-slug>/cover.webp
public/comics/<series-slug>/<chapter-number>/001.webp
public/comics/<series-slug>/<chapter-number>/002.webp
...
```

Example: `public/comics/crimson-moonblade/1/001.webp`

### 2. Point the series at the images
Open `src/data/catalog.ts`. Find the series in the `seeds` array, or copy an entry to make a new one.

- Set `cover: '/comics/<slug>/cover.webp'`
- To use real chapters, replace the generated ones. Change the export at the bottom of the file:

```ts
// in catalog.ts, after `seeds` (the `pages` helper and `Chapter` type are already in this file)
const realChapters: Record<string, Chapter[]> = {
  'crimson-moonblade': [
    { number: 1, title: 'The First Cut', date: '2026-11-01', pages: pages('crimson-moonblade', 1, 24) },
    { number: 2, title: 'Moon Debt',     date: '2026-11-08', pages: pages('crimson-moonblade', 2, 21) },
  ],
};

export const catalog: Series[] = seeds.map(({ chapterCount, latestDaysAgo, every, ...s }) => ({
  ...s,
  chapters: realChapters[s.slug] ?? demoChapters(s.slug, chapterCount, latestDaysAgo, every),
}));
```

`pages(slug, chapter, count, ext = 'webp')` builds the list of URLs `001 … count` for you. If your files are `.jpg`, pass `'jpg'` as the last argument.

### 3. Series fields you can edit
`title`, `altTitle` (Japanese title), `kanji` (used on generated covers), `author`, `artist`, `status` (`Ongoing | Completed | Hiatus`), `genres`, `synopsis`, `palette` (two hex colours), `schedule` (release day), `direction` (`rtl | ltr | vertical`), `featured` (shows in the hero rotator), `weeklyScore` / `monthlyScore` (rankings), `banner` (optional wide image for the series page).

If a series has no `cover`, an original cover is generated from its `palette` and `kanji`. Chapters with empty `pages` show generated placeholder pages, so the site always looks finished.

### 4. Remove the demo series
Delete any entry from `seeds` that you don't want. All the demo series and authors are fictional.

---

## Theme assets
The two artworks are in `public/theme/`. These are the `*-hero` (hero crop), `*-full` (spotlight/banner), `*-cover` (cover crop) and `*-lower` (footer mist) files. Replace the files with the same names to change the art.

Theme colours are CSS variables at the top of `src/index.css` (`[data-theme='dark']` / `[data-theme='light']`).

## Project structure
```
src/
  components/      Navbar, Footer, Cover, SeriesCard, Particles, Reveal, CommandPalette, ThemeToggle, Chrome (progress bar, curtain, marquee)…
  components/home/ Hero + home sections
  context/         Theme (katana slash), Library (bookmarks/history), Toasts
  data/            catalog.ts (your content) + types.ts
  pages/           Home, Browse, SeriesPage, Reader, LibraryPage, Rankings, NotFound
```

## Next steps when you need a backend
Bookmarks and history are stored in localStorage. To sync them across devices or to add accounts and comments, connect Supabase or Firebase. Swap `LibraryContext.tsx` to read and write there. The catalog can also move to a CMS or API that returns the same `Series` shape.

## InkBlade logo integration

The supplied original logos are in `public/branding/inkblade-dark.png` and
`public/branding/inkblade-light.png`. The shared `src/components/Logo.tsx`
reads the existing ThemeContext, so the navbar and footer follow the saved
site theme and the existing katana-slash toggle. Both navbar images are
loaded eagerly to avoid a new image request on the first theme switch.
The full square artwork is preserved with no cropping. The footer uses a
larger 160px version; the navbar uses a compact 56px version.

Run `npm ci`, then `npm run dev` to preview or `npm run build` to build.

## Illustrated opening chapter

Crimson Moonblade chapter 1, "After the Hollow Crown", now contains six generated manga pages in `public/comics/crimson-moonblade/1/001.png` through `006.png`.
Open `/read/crimson-moonblade/1` or choose **Start reading** on the series page.
Panels are arranged right to left. Existing single-page, spread, and vertical reader modes remain available.
Chapters 1–7 are illustrated, with six pages each. Placeholder chapters 8–148 have been removed from the catalog. Crimson Moonblade remains Ongoing; chapter 7 is the latest available release, not the story ending. Its release timestamp ages normally after publication.
The artwork is an AI-generated adaptation of the supplied character reference and approved outline. Existing demo author and artist labels are unchanged.


## Chapter 2 — Beneath the Paper Oath

Six pages are available at /read/crimson-moonblade/2, or through Next chapter after Chapter 1. Assets are in public/comics/crimson-moonblade/2/.



## Chapter 3 — Beneath the Last Duel

Six illustrated pages are available at /read/crimson-moonblade/3, or through Next chapter after Chapter 2. Assets are in public/comics/crimson-moonblade/3/.



## Chapter 4 — A Falling Petals

Six illustrated pages are available at /read/crimson-moonblade/4, or through Next chapter after Chapter 3. Assets are in public/comics/crimson-moonblade/4/.

## Chapters 5–7

- Chapter 5, Within the Red Tide: `/read/crimson-moonblade/5`
- Chapter 6, Beyond the Ash Garden: `/read/crimson-moonblade/6`
- Chapter 7, The Hidden Gate: `/read/crimson-moonblade/7`

Each chapter contains six illustrated PNG pages. The existing chapter selector and Next chapter controls connect them in order. Assets are in `public/comics/crimson-moonblade/5/` through `7/`.

## Sakura Oathkeeper — eight illustrated chapters

The catalog uses `src/data/sakura-chapters.json` for exactly eight chapters, each containing six PNG pages in `public/comics/sakura-oathkeeper/1/` through `8/`. Open `/read/sakura-oathkeeper/1` to start. The requested titles are preserved, including The First Snow for both chapters 6 and 8. Demo chapters 9–86 are no longer listed. Both flagship series remain Ongoing.

Saved reading history for removed chapters is hidden from Continue reading and resume links; bookmarks and valid progress are preserved.


## Neon Kitsune

4 complete illustrated chapters (24 pages), left-to-right reading, plus original cyberpunk cover. Metadata: src/data/neon-chapters.json. Artwork: public/comics/neon-kitsune. Chapters 5–9 remain in production; demo entries are removed. The series remains Ongoing. Reader direction now defaults per series and remembers explicit per-series overrides.

## Published catalog
Only Crimson Moonblade (7 chapters), Sakura Oathkeeper (8 chapters), and Neon Kitsune (4 complete chapters) are listed. The nine other demo series have been removed.

