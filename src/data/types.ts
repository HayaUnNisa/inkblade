export type Status = 'Ongoing' | 'Completed' | 'Hiatus';

export type Weekday = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface Chapter {
  /** Chapter number, e.g. 1, 2, 12.5 */
  number: number;
  title: string;
  /** ISO date string — when this chapter was released */
  date: string;
  /**
   * Page image URLs, in reading order.
   * Leave empty to show auto-generated placeholder pages (useful before artwork is uploaded).
   */
  pages: string[];
  /** Used only when `pages` is empty: how many placeholder pages to render */
  placeholderPages?: number;
}

export interface Series {
  slug: string;
  title: string;
  /** Japanese / alternate title shown as an accent */
  altTitle: string;
  /** 1–2 kanji used in generated covers and accents */
  kanji: string;
  author: string;
  artist: string;
  status: Status;
  year: number;
  genres: string[];
  rating: number;
  /** Total reads */
  views: number;
  follows: number;
  synopsis: string;
  /** Optional cover image URL. When missing, an original generated cover is drawn. */
  cover?: string;
  /** Optional wide banner image URL for the series page */
  banner?: string;
  /** Two colours used for generated covers + accents */
  palette: [string, string];
  /** Day new chapters drop */
  schedule: Weekday;
  /** Default reading direction for this series */
  direction: 'rtl' | 'ltr' | 'vertical';
  featured?: boolean;
  /** Ranking scores (higher = better) */
  weeklyScore: number;
  monthlyScore: number;
  chapters: Chapter[];
}
