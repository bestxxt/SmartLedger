import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Package, Target } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';
import { useEntityStore } from '../store/useEntityStore';
import type { TrackingEntity } from '../store/useEntityStore';
import EntityForm from '../components/EntityForm';

export default function Entities() {
  const { isAuthenticated, fetchUser } = useUserStore();
  const { entities, fetchEntities, isLoading } = useEntityStore();
  const navigate = useNavigate();

  const [filter, setFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      fetchUser();
      fetchEntities();
    }
  }, [isAuthenticated, navigate]);

  const filteredEntities = filter === 'all' 
    ? entities 
    : entities.filter(e => e.type === filter);

  // Calculate daily cost for assets
  const calculateDailyCost = (entity: TrackingEntity) => {
    if (!entity.purchasePrice || !entity.purchaseDate) return null;
    const days = Math.max(1, Math.floor((Date.now() - new Date(entity.purchaseDate).getTime()) / (1000 * 60 * 60 * 24)));
    const costBasis = entity.purchasePrice - (entity.residualValue || 0);
    return (costBasis / days).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <main className="flex-1 p-4 md:p-10 pb-24 md:pb-10 max-w-5xl mx-auto w-full relative">
      <header className="flex justify-between items-end border-b-2 border-ink pb-4 mb-8">
        <div>
          <h2 className="text-4xl font-bold font-serif italic">Entity Tracker</h2>
          <p className="text-ink-light font-mono uppercase tracking-widest text-xs mt-2 font-bold">
            Asset & Subscription Management
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="neo-button w-auto bg-brick text-paper border-ink hover:bg-brick-light flex items-center gap-2 px-6"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">New Entity</span>
        </button>
      </header>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-8 border-b-2 border-ink pb-4 overflow-x-auto">
        {(['all', 'asset', 'subscription', 'person', 'other']).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`font-mono text-xs uppercase tracking-widest font-bold px-4 py-2 border-2 whitespace-nowrap ${filter === f ? 'bg-ink text-paper border-ink' : 'border-transparent text-ink-light hover:border-ink/30 hover:text-ink'}`}
          >
            {f === 'all' ? 'All Entities' : f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="p-8 text-center font-mono text-ink-light animate-pulse">Loading entities...</div>
      ) : filteredEntities.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center justify-center border-2 border-dashed border-ink/20 m-4">
          <Target size={48} className="opacity-20 mb-4" />
          <p className="font-mono font-bold text-ink">No entities found.</p>
          <p className="text-sm font-mono text-ink-light mt-2">Track objects, subscriptions, or people to calculate costs.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEntities.map((entity) => (
            <div key={entity.id} className="neo-box p-6 flex flex-col justify-between bg-white group cursor-pointer hover:bg-paper/30">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-ink text-paper flex items-center justify-center border-2 border-ink">
                    <Package size={20} />
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-widest font-bold px-2 py-1 bg-paper border border-ink text-ink">
                    {entity.type}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-xl mb-1">{entity.name}</h3>
                
                {entity.purchasePrice && (
                  <p className="font-mono text-sm text-ink-light">
                    Value: ${entity.purchasePrice.toLocaleString()}
                  </p>
                )}
              </div>
              
              <div className="mt-6 pt-4 border-t border-ink/10 flex justify-between items-end">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-ink/50 mb-1">Status</p>
                  <p className="font-bold text-sm uppercase font-mono">{entity.status}</p>
                </div>
                {entity.type === 'asset' && entity.purchasePrice && entity.purchaseDate && (
                  <div className="text-right">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-ink/50 mb-1">Daily Cost</p>
                    <p className="font-serif font-bold italic text-brick text-lg">${calculateDailyCost(entity)}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Basic modal placeholder for now */}
      {isModalOpen && (
        <EntityForm onClose={() => setIsModalOpen(false)} />
      )}
    </main>
  );
}
