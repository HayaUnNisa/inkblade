import Hero from '@/components/home/Hero';
import { ContinueReading, CreatorCTA, Genres, LatestAndSchedule, RankingPreview, Spotlight, Ticker, Trending } from '@/components/home/Sections';

export default function Home() {
  return (
    <>
      <Hero />
      <Ticker />
      <ContinueReading />
      <Trending />
      <LatestAndSchedule />
      <Genres />
      <Spotlight />
      <RankingPreview />
      <CreatorCTA />
    </>
  );
}
