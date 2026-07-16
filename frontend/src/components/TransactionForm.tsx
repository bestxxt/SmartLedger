import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useTransactionStore } from '../store/useTransactionStore';
import type { Transaction } from '../store/useTransactionStore';
import { useUserStore } from '../store/useUserStore';
import { useEntityStore } from '../store/useEntityStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useHotwordStore } from '../store/useHotwordStore';
import { useCategoryStore } from '../store/useCategoryStore';
import { parseTransactionWithAi } from '../lib/aiParser';
import { Sparkles } from 'lucide-react';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Transaction | null;
}

export default function TransactionForm({ isOpen, onClose, initialData }: TransactionFormProps) {
  const { categories, fetchCategories } = useCategoryStore();

  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [entityId, setEntityId] = useState<string>('');
  
  // Helper to get local time string in YYYY-MM-DDThh:mm format for the input
  const getLocalIsoString = (date = new Date()) => {
    const tzOffsetMs = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffsetMs).toISOString().slice(0, 16);
  };
  
  const [timestamp, setTimestamp] = useState(getLocalIsoString());
  
  const [aiTranscript, setAiTranscript] = useState('');
  const [isAiParsing, setIsAiParsing] = useState(false);
  const [aiError, setAiError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { createTransaction, updateTransaction } = useTransactionStore();
  const { fetchUser } = useUserStore();
  const { entities, fetchEntities } = useEntityStore();
  const { hotwords, fetchHotwords } = useHotwordStore();
  const settings = useSettingsStore();
  
  useEffect(() => {
    fetchEntities();
    fetchHotwords();
    fetchCategories();
  }, [fetchEntities, fetchHotwords, fetchCategories]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setAmount(initialData.amount.toString());
        setType(initialData.type);
        setCategory(initialData.category);
        setNote(initialData.note || '');
        setEntityId((initialData as any).entityId || '');
        // Parse UTC from backend into local time string for input
        setTimestamp(getLocalIsoString(new Date(initialData.timestamp)));
      } else {
        setAmount('');
        setType('expense');
        setCategory(categories.length > 0 ? categories[0].name : '');
        setNote('');
        setEntityId('');
        setTimestamp(getLocalIsoString());
      }
      setError('');
    }
  }, [isOpen, initialData]);

  const handleAiParse = async () => {
    if (!aiTranscript.trim()) return;
    
    setIsAiParsing(true);
    setAiError('');
    setError('');

    try {
      const hotwordsStr = hotwords.map(h => `${h.word}: ${h.replacement} (Context: ${h.context})`).join('\n');
      const categoriesStr = categories.map(c => c.name).join(', ');
      const entitiesStr = entities.map(e => `ID: ${e.id} | Name: ${e.name} | Type: ${e.type}`).join('\n');

      const result = await parseTransactionWithAi({
        transcript: aiTranscript,
        hotwords: hotwordsStr,
        categories: categoriesStr,
        entities: entitiesStr,
        apiKey: settings.aiApiKey,
        baseUrl: settings.aiBaseUrl,
        model: settings.aiModel,
        systemPromptTemplate: settings.systemPromptTemplate
      });

      // Auto-fill form
      setAmount(result.amount.toString());
      setType(result.type);
      setCategory(result.category);
      setEntityId(result.entityId || '');
      setNote(result.note || aiTranscript);
      if (result.timestamp) {
        setTimestamp(getLocalIsoString(new Date(result.timestamp)));
      }

      setAiTranscript(''); // Clear on success
    } catch (err: any) {
      setAiError(err.message || 'Failed to parse text via AI.');
    } finally {
      setIsAiParsing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) {
      setError('Please enter a valid amount.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      const selectedCat = categories.find(c => c.name === category);
      
      if (initialData) {
        await updateTransaction(initialData.id, {
          amount: Number(amount),
          type,
          category,
          emoji: selectedCat?.icon || '📝',
          imageUrl: selectedCat?.imageUrl || null,
          note,
          timestamp: new Date(timestamp).toISOString(),
          ...(entityId ? { entityId } : { entityId: null })
        } as any);
      } else {
        await createTransaction({
          amount: Number(amount),
          type,
          category,
          emoji: selectedCat?.icon || '📝',
          imageUrl: selectedCat?.imageUrl || null,
          timestamp: new Date(timestamp).toISOString(),
          note,
          ...(entityId ? { entityId } : {})
        } as any);
      }
      
      // Refresh user stats after transaction
      await fetchUser();
      onClose();
    } catch (err: any) {
      setError(`Failed to ${initialData ? 'update' : 'record'} transaction.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/20 backdrop-blur-sm z-40"
          />

          {/* Slide-over Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-paper border-l-4 border-ink shadow-[-8px_0_0_0_rgba(26,26,26,1)] z-50 flex flex-col overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b-4 border-ink bg-white">
              <div>
                <h2 className="text-2xl font-bold font-serif italic text-ink">Deposit Slip</h2>
                <p className="text-xs uppercase tracking-widest font-mono font-bold mt-1 text-ink-light">
                  {initialData ? 'Amend Record' : 'Record of Transaction'}
                </p>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 border-2 border-ink flex items-center justify-center hover:bg-ink hover:text-paper transition-colors"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            <div className="p-6 flex-1">
              {error && (
                <div className="mb-6 p-3 bg-brick/10 border-2 border-brick text-brick font-mono text-sm font-bold">
                  {error}
                </div>
              )}

              <form id="transaction-form" onSubmit={handleSubmit} className="space-y-8">
                
                {/* AI Extraction Section */}
                {!initialData && (
                  <div className="p-4 border-2 border-dashed border-ink bg-paper/50 relative">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-bold font-mono uppercase tracking-widest text-ink">AI Auto-Extraction</label>
                      <Sparkles size={16} className="text-ink" />
                    </div>
                    
                    {aiError && (
                      <div className="mb-2 p-2 bg-brick/10 border border-brick text-brick font-mono text-xs font-bold">
                        {aiError}
                      </div>
                    )}
                    
                    <textarea 
                      value={aiTranscript}
                      onChange={e => setAiTranscript(e.target.value)}
                      placeholder="e.g. Spent $23 at McDonald's for lunch..."
                      className="w-full h-20 neo-input text-sm resize-none"
                    />
                    
                    <button 
                      type="button"
                      onClick={handleAiParse}
                      disabled={isAiParsing || !aiTranscript.trim()}
                      className="mt-2 w-full flex items-center justify-center gap-2 border-2 border-ink py-2 font-mono font-bold text-xs uppercase tracking-widest hover:bg-ink hover:text-paper transition-colors disabled:opacity-50"
                    >
                      {isAiParsing ? 'Analyzing Data...' : 'Parse & Autofill Form'}
                    </button>
                  </div>
                )}
                
                {/* Type Selection (Radio) */}
                <div className="flex gap-4">
                  <label className="flex-1 relative cursor-pointer group">
                    <input type="radio" name="type" value="expense" checked={type === 'expense'} onChange={() => setType('expense')} className="peer sr-only" />
                    <div className="h-12 border-2 border-ink flex items-center justify-center font-mono font-bold uppercase text-sm tracking-wider peer-checked:bg-ink peer-checked:text-paper group-hover:bg-ink/5 transition-colors">
                      Withdrawal
                    </div>
                  </label>
                  <label className="flex-1 relative cursor-pointer group">
                    <input type="radio" name="type" value="income" checked={type === 'income'} onChange={() => setType('income')} className="peer sr-only" />
                    <div className="h-12 border-2 border-ink flex items-center justify-center font-mono font-bold uppercase text-sm tracking-wider peer-checked:bg-ink peer-checked:text-paper group-hover:bg-ink/5 transition-colors">
                      Deposit
                    </div>
                  </label>
                </div>
                
                {/* Date and Time */}
                <div>
                  <label className="block text-xs font-bold font-mono uppercase tracking-widest mb-2 border-b-2 border-ink pb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={timestamp}
                    onChange={(e) => setTimestamp(e.target.value)}
                    className="w-full font-mono text-sm bg-transparent border-b-2 border-dashed border-ink py-3 focus:outline-none focus:border-solid focus:border-ink appearance-none cursor-pointer"
                    required
                  />
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block text-xs font-bold font-mono uppercase tracking-widest mb-2 border-b-2 border-ink pb-1">Amount</label>
                  <div className="relative flex items-end mt-4">
                    <span className="text-3xl font-serif font-bold italic mr-2 text-ink">$</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="text-5xl font-mono font-bold bg-transparent border-b-2 border-dashed border-ink w-full focus:outline-none focus:border-solid focus:border-ink py-2"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Categories Grid */}
                <div>
                  <label className="block text-xs font-bold font-mono uppercase tracking-widest mb-4 border-b-2 border-ink pb-1">Classification</label>
                  <div className="grid grid-cols-2 gap-3">
                    {categories.map((cat) => (
                      <label key={cat.id} className="relative cursor-pointer group">
                        <input type="radio" name="category" value={cat.name} checked={category === cat.name} onChange={() => setCategory(cat.name)} className="peer sr-only" />
                        <div className="p-3 border-2 border-ink bg-white flex items-center gap-3 peer-checked:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] peer-checked:-translate-y-px transition-all">
                          {cat.imageUrl ? (
                            <img src={cat.imageUrl} alt={cat.name} className="w-6 h-6 object-contain" />
                          ) : (
                            <span className="text-xl">{cat.icon || '📌'}</span>
                          )}
                          <span className="font-mono font-bold text-xs uppercase tracking-wider line-clamp-1 flex-1">{cat.name}</span>
                          {category === cat.name && <Check size={16} strokeWidth={3} />}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Entity Selection */}
                {entities.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold font-mono uppercase tracking-widest mb-2 border-b-2 border-ink pb-1">Associated Object / Entity</label>
                    <select
                      value={entityId}
                      onChange={(e) => setEntityId(e.target.value)}
                      className="w-full font-mono text-sm bg-transparent border-b-2 border-dashed border-ink py-3 focus:outline-none focus:border-solid focus:border-ink cursor-pointer appearance-none"
                    >
                      <option value="">-- None --</option>
                      {entities.map(e => (
                        <option key={e.id} value={e.id}>{e.name} ({e.type})</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Note */}
                <div>
                  <label className="block text-xs font-bold font-mono uppercase tracking-widest mb-2 border-b-2 border-ink pb-1">Particulars / Memo</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full font-mono text-sm bg-transparent border-b-2 border-dashed border-ink py-3 focus:outline-none focus:border-solid focus:border-ink"
                    placeholder="Enter details here..."
                  />
                </div>

              </form>
            </div>

            {/* Footer */}
            <div className="p-6 bg-ink border-t border-paper/20 mt-auto">
              <button 
                type="submit" 
                form="transaction-form"
                disabled={isSubmitting}
                className="w-full bg-paper text-ink font-bold font-mono py-4 uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(244,241,234,0.3)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(244,241,234,0.3)] active:translate-y-px active:shadow-[2px_2px_0px_0px_rgba(244,241,234,0.3)] transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Stamping...' : (initialData ? 'Update Record' : 'Stamp & Record')}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
