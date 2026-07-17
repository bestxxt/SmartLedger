import { Link, useLocation } from 'react-router-dom';
import { Home as HomeIcon, Settings, PieChart, FileText, LogOut, Package } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';

export default function Sidebar() {
  const { logout } = useUserStore();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: HomeIcon, label: 'Front Page' },
    { path: '/archive', icon: FileText, label: 'Ledger Archive' },
    { path: '/entities', icon: Package, label: 'Tracking Objects' },
    { path: '/statistics', icon: PieChart, label: 'Statistics' },
    { path: '/settings', icon: Settings, label: 'Press Setup' },
  ];

  return (
    <aside className="hidden md:flex w-72 h-screen sticky top-0 border-r-2 border-ink flex-col justify-between bg-paper z-10">
      <div className="p-6">
        <div className="border-b-4 border-ink pb-6 mb-8 text-center flex flex-col items-center">
          <img src="/logo.png" alt="Smart Ledger Logo" className="w-16 h-16 mb-2 object-contain" />
          <h1 className="text-3xl font-bold font-serif italic text-ink">Smart Ledger</h1>
          <p className="text-xs  tracking-[0.2em] font-mono mt-2 font-bold">Daily Chronicle</p>
        </div>
        <nav className="space-y-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return isActive ? (
              <div key={item.path} className="flex items-center space-x-3 text-paper bg-ink px-4 py-3 font-bold  tracking-wider text-sm border-2 border-ink shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transition-transform">
                <Icon size={18} strokeWidth={2.5} />
                <span>{item.label}</span>
              </div>
            ) : (
              <Link 
                key={item.path} 
                to={item.path} 
                className="flex items-center space-x-3 text-ink hover:bg-ink hover:text-paper px-4 py-3 font-bold  tracking-wider text-sm border-2 border-transparent hover:border-ink transition-all"
              >
                <Icon size={18} strokeWidth={2.5} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="p-6 border-t-2 border-ink">
        <button onClick={logout} className="flex items-center w-full space-x-3 text-brick hover:bg-brick hover:text-paper px-4 py-3 font-bold  tracking-wider text-sm border-2 border-transparent hover:border-brick transition-all">
          <LogOut size={18} strokeWidth={2.5} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
