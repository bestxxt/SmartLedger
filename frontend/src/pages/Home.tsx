import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, PenTool } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';
import { useTransactionStore } from '../store/useTransactionStore';
import TransactionForm from '../components/TransactionForm';

export default function Home() {
  const { user, isAuthenticated, fetchUser, isLoading: isUserLoading } = useUserStore();
  const { transactions, fetchTransactions, isLoading: isTxLoading } = useTransactionStore();
  const navigate = useNavigate();
  const [isEntryFormOpen, setIsEntryFormOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      fetchUser();
      fetchTransactions();
    }
  }, [isAuthenticated, navigate]);

  return (
    <>
      <main className="flex-1 p-4 md:p-10 pb-24 md:pb-10 max-w-5xl mx-auto w-full relative">
        {/* Header */}
        <header className="flex justify-between items-end border-b-2 border-ink pb-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Logo" className="w-8 h-8 sm:w-10 sm:h-10 md:hidden object-contain" />
              <h2 className="text-4xl font-bold font-serif italic">The Ledger</h2>
            </div>
            <p className="text-ink-light font-mono uppercase tracking-widest text-xs mt-2 font-bold">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button 
            onClick={() => setIsEntryFormOpen(true)}
            className="neo-button w-auto bg-brick text-paper border-ink hover:bg-brick-light flex items-center gap-2 group px-6 hidden sm:flex"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            <span>New Entry</span>
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Balance Overview */}
            <section className="neo-box p-8 bg-ink text-paper relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-paper/5 rounded-bl-full"></div>
              <div className="absolute bottom-4 right-4 text-6xl opacity-5 font-serif italic">§</div>
              
              <div className="relative z-10">
                <h3 className="font-mono text-xs uppercase tracking-[0.3em] font-bold text-paper/70 mb-2">Total Capital</h3>
                {isUserLoading ? (
                  <div className="h-16 flex items-center">
                    <div className="h-8 w-48 bg-paper/20 animate-pulse"></div>
                  </div>
                ) : (
                  <div className="text-6xl font-serif font-bold italic tracking-tight text-paper">
                    ${(user?.stats?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                )}
                
                <div className="mt-8 grid grid-cols-2 gap-4 border-t border-paper/20 pt-6">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-paper/70 mb-1">Monthly Income</p>
                    <p className="text-xl font-bold text-olive">+${(user?.stats?.totalIncome || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-paper/70 mb-1">Monthly Expense</p>
                    <p className="text-xl font-bold text-brick-light">-${(user?.stats?.totalExpense || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Recent Transactions */}
            <section>
              <div className="flex justify-between items-center mb-4 border-b-2 border-ink pb-2">
                <h3 className="text-xl font-serif font-bold italic">Recent Movements</h3>
                <span className="font-mono text-[10px] uppercase tracking-widest font-bold px-2 py-1 bg-ink text-paper">Last 5</span>
              </div>
              
              <div className="bg-white border-4 border-ink shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
                {isTxLoading ? (
                  <div className="p-8 text-center font-mono text-ink-light animate-pulse">Loading ledgers...</div>
                ) : transactions.length === 0 ? (
                  <div className="p-12 text-center flex flex-col items-center justify-center border-2 border-dashed border-ink/20 m-4">
                    <div className="w-16 h-16 mb-4 opacity-20">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                        <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4" />
                        <polyline points="14 2 14 8 20 8" />
                        <path d="M2 15h10" />
                        <path d="M9 18l3-3-3-3" />
                      </svg>
                    </div>
                    <p className="font-mono font-bold text-ink">No entries found.</p>
                    <p className="text-sm font-mono text-ink-light mt-2">Stamp your first transaction to begin.</p>
                  </div>
                ) : (
                  <div className="divide-y-2 divide-ink">
                    {transactions.slice(0, 5).map((tx) => (
                      <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-paper/50 transition-colors">
                        <div className="flex items-center gap-4 min-w-0 mr-4">
                          <div className="w-12 h-12 flex items-center justify-center text-xl shrink-0">
                            {(tx as any).imageUrl ? (
                              <img src={(tx as any).imageUrl} alt={tx.category} className="w-10 h-10 object-contain" />
                            ) : (
                              tx.emoji || '📝'
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-ink uppercase tracking-wider font-mono text-sm truncate">{tx.category}</p>
                            <p className="text-xs font-mono text-ink-light mt-1 flex items-center gap-2">
                              <span className="shrink-0">{new Date(tx.timestamp).toLocaleDateString()}</span>
                              {tx.note && (
                                <>
                                  <span className="w-1 h-1 bg-ink/30 rounded-full shrink-0"></span>
                                  <span className="italic truncate">{tx.note}</span>
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className={`font-bold font-serif text-xl whitespace-nowrap shrink-0 ${tx.type === 'income' ? 'text-olive' : 'text-brick'}`}>
                          {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-8">
            {/* User Profile Mini */}
            <div className="neo-box p-6 bg-white flex items-center gap-4">
              <div className="w-12 h-12 bg-ink text-paper rounded-full flex items-center justify-center font-serif text-2xl italic">
                {user?.name.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest font-bold text-ink-light">Account Holder</p>
                <p className="font-bold text-ink">{user?.name}</p>
              </div>
            </div>

            {/* Print Ad / Decorative Element */}
            <div className="border-4 border-ink p-1">
              <div className="border-2 border-ink p-6 text-center bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
                <h4 className="font-serif font-bold italic text-2xl mb-2">Subscribe</h4>
                <p className="font-mono text-xs uppercase tracking-widest mb-4">To the daily financial chronicle</p>
                <div className="w-full border-b-2 border-dashed border-ink mb-4"></div>
                <p className="text-[10px] uppercase font-bold text-ink-light">Keep your records straight & narrow.</p>
              </div>
            </div>

            <div className="border-4 border-ink p-6 relative">
              <div className="absolute -top-4 bg-paper px-2 left-4 font-bold font-mono uppercase tracking-widest text-sm text-ink">
                Quick Draft
              </div>
              <p className="font-mono text-sm text-ink-light mb-4">Draft a new financial record rapidly.</p>
              <button 
                onClick={() => setIsEntryFormOpen(true)}
                className="neo-button flex items-center justify-center gap-2"
              >
                <PenTool size={16} />
                New Entry
              </button>
            </div>
          </div>
        </div>
        
        {/* Floating Action Button (Mobile) */}
        <div className="md:hidden fixed bottom-24 right-6 z-40">
          <button 
            onClick={() => setIsEntryFormOpen(true)}
            className="bg-brick text-paper w-14 h-14 rounded-full border-2 border-ink shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] flex items-center justify-center hover:-translate-y-1 active:translate-y-px transition-transform"
          >
            <Plus size={24} strokeWidth={3} />
          </button>
        </div>
      </main>

      {/* Transaction Entry Form Modal */}
      <TransactionForm 
        isOpen={isEntryFormOpen} 
        onClose={() => setIsEntryFormOpen(false)} 
      />
    </>
  );
}
