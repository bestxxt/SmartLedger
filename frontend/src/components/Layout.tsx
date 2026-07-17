import { useLocation, Routes, Route } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import Home from '../pages/Home';
import Archive from '../pages/Archive';
import Entities from '../pages/Entities';
import Settings from '../pages/Settings';
import Statistics from '../pages/Statistics';

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-paper flex flex-col md:flex-row font-sans selection:bg-ink selection:text-paper">
      <Sidebar />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 w-full"
        >
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="/entities" element={<Entities />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/statistics" element={<Statistics />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
      
      <MobileNav />
    </div>
  );
}
