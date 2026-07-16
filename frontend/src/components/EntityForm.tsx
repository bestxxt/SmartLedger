import { useState } from 'react';
import { X } from 'lucide-react';
import { useEntityStore } from '../store/useEntityStore';

export default function EntityForm({ onClose }: { onClose: () => void }) {
  const { createEntity } = useEntityStore();
  
  const [name, setName] = useState('');
  const [type, setType] = useState('asset');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [residualValue, setResidualValue] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createEntity({
        name,
        type,
        status: 'active',
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
        residualValue: residualValue ? parseFloat(residualValue) : null,
        purchaseDate: purchaseDate ? new Date(purchaseDate).toISOString() : null,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-paper border-4 border-ink p-8 w-full max-w-md neo-box relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-ink hover:text-brick transition-colors">
          <X size={24} />
        </button>

        <h3 className="text-3xl font-serif font-bold italic mb-6 border-b-2 border-ink pb-2">Register Entity</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-xs font-bold uppercase tracking-widest mb-2">Entity Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., iPhone 15 Pro, Netflix" 
              className="neo-input"
            />
          </div>

          <div>
            <label className="block font-mono text-xs font-bold uppercase tracking-widest mb-2">Type</label>
            <select 
              value={type}
              onChange={e => setType(e.target.value)}
              className="neo-input cursor-pointer appearance-none"
            >
              <option value="asset">Asset (Physical/Digital)</option>
              <option value="subscription">Subscription</option>
              <option value="person">Person (Family/Friend)</option>
              <option value="other">Other</option>
            </select>
          </div>

          {type === 'asset' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs font-bold uppercase tracking-widest mb-2">Purchase Price</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={purchasePrice}
                  onChange={e => setPurchasePrice(e.target.value)}
                  placeholder="0.00" 
                  className="neo-input"
                />
              </div>
              <div>
                <label className="block font-mono text-xs font-bold uppercase tracking-widest mb-2">Residual Value</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={residualValue}
                  onChange={e => setResidualValue(e.target.value)}
                  placeholder="0.00" 
                  className="neo-input"
                />
              </div>
              <div className="col-span-2">
                <label className="block font-mono text-xs font-bold uppercase tracking-widest mb-2">Purchase Date</label>
                <input 
                  type="date"
                  value={purchaseDate}
                  onChange={e => setPurchaseDate(e.target.value)}
                  className="neo-input"
                />
              </div>
            </div>
          )}

          <div className="pt-4 mt-6 border-t-2 border-ink">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="neo-button uppercase tracking-widest text-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Registering...' : 'Register Entity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
