import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="relative grid min-h-[80vh] place-items-center overflow-hidden px-6 pt-24 text-center">
      <div>
        <motion.p initial={{ scale: 1.4, opacity: 0, rotate: -8 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="font-brush text-[10rem] leading-none text-accent">迷</motion.p>
        <h1 className="mt-4 font-display text-4xl font-extrabold">This page was lost to the mist</h1>
        <p className="mt-3 text-muted">The scroll you’re looking for doesn’t exist — or hasn’t been inked yet.</p>
        <Link to="/" className="btn btn-primary mt-8"><ArrowLeft size={16} /> Back to home</Link>
      </div>
    </div>
  );
}
