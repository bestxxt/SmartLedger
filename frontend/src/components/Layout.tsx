import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

export default function Layout() {
  const location = useLocation();
  const outlet = useOutlet();

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
          {outlet}
        </motion.div>
      </AnimatePresence>
      
      <MobileNav />
    </div>
  );
}
