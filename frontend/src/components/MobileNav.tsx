import { Link, useLocation } from 'react-router-dom';
import { Home as HomeIcon, Settings, PieChart, FileText, Package } from 'lucide-react';

export default function MobileNav() {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: HomeIcon, label: 'Home' },
    { path: '/archive', icon: FileText, label: 'Archive' },
    { path: '/entities', icon: Package, label: 'Objects' },
    { path: '/statistics', icon: PieChart, label: 'Stats' },
    { path: '/settings', icon: Settings, label: 'Setup' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-paper border-t-4 border-ink flex justify-around items-center p-3 pb-safe z-50">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;

        return isActive ? (
          <div key={item.path} className="flex flex-col items-center text-ink">
            <Icon size={24} strokeWidth={2.5} />
            <span className="text-[10px] font-bold font-mono uppercase tracking-wider mt-1">{item.label}</span>
          </div>
        ) : (
          <Link 
            key={item.path} 
            to={item.path} 
            className="flex flex-col items-center text-ink-light hover:text-ink transition-colors"
          >
            <Icon size={24} strokeWidth={2.5} />
            <span className="text-[10px] font-bold font-mono uppercase tracking-wider mt-1">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
