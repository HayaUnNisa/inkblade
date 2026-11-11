import { lazy, Suspense, type ReactNode } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SlashFlash } from '@/components/ThemeToggle';
import { BackToTop, RouteCurtain, ScrollProgress } from '@/components/Chrome';
import Home from '@/pages/Home';

const Browse = lazy(() => import('@/pages/Browse'));
const SeriesPage = lazy(() => import('@/pages/SeriesPage'));
const Reader = lazy(() => import('@/pages/Reader'));
const LibraryPage = lazy(() => import('@/pages/LibraryPage'));
const Rankings = lazy(() => import('@/pages/Rankings'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function Page({ children }: { children: ReactNode }) {
  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.3, duration: 0.45 } }}>
      {children}
    </motion.main>
  );
}

function Loader() {
  return (
    <div className="grid min-h-[70vh] place-items-center">
      <span className="animate-pulse font-brush text-5xl text-accent">墨</span>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const reading = location.pathname.startsWith('/read/');

  return (
    <div className="grain relative min-h-screen">
      {!reading && <ScrollProgress />}
      {!reading && <Navbar />}
      <RouteCurtain />
      <SlashFlash />
      <Suspense fallback={<Loader />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Page><Home /></Page>} />
          <Route path="/browse" element={<Page><Browse /></Page>} />
          <Route path="/series/:slug" element={<Page><SeriesPage /></Page>} />
          <Route path="/read/:slug/:chapter" element={<Reader />} />
          <Route path="/library" element={<Page><LibraryPage /></Page>} />
          <Route path="/rankings" element={<Page><Rankings /></Page>} />
          <Route path="*" element={<Page><NotFound /></Page>} />
        </Routes>
      </Suspense>
      {!reading && <Footer />}
      {!reading && <BackToTop />}
    </div>
  );
}
