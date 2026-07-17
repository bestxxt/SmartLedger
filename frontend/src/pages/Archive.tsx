import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
import { useTransactionStore } from '../store/useTransactionStore';
import type { Transaction } from '../store/useTransactionStore';
import TransactionForm from '../components/TransactionForm';

export default function Archive() {
  const { isAuthenticated, fetchUser } = useUserStore();
  const { transactions, fetchTransactions, deleteTransaction, isLoading: isTxLoading } = useTransactionStore();
  const navigate = useNavigate();

  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      fetchUser();
      fetchTransactions();
    }
  }, [isAuthenticated, navigate]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Strike this record from the ledger?")) {
      await deleteTransaction(id);
      await fetchUser(); // Refresh stats
    }
  };

  // Get unique months from transactions for the filter dropdown
  const availableMonths = Array.from(new Set(transactions.map(t => {
    const d = new Date(t.timestamp);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }))).sort().reverse(); // Newest first

  const filteredTransactions = transactions.filter(t => {
    const matchesType = filter === 'all' ? true : t.type === filter;
    
    if (selectedMonth === 'all') return matchesType;
    
    const d = new Date(t.timestamp);
    const txMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return matchesType && txMonth === selectedMonth;
  });

  return (
    <>
      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 pb-24 md:pb-10 max-w-5xl mx-auto w-full relative">
        <header className="flex justify-between items-end border-b-2 border-ink pb-4 mb-8">
          <div>
            <h2 className="text-4xl font-bold font-serif italic">Ledger Archive</h2>
            <p className="text-ink-light font-mono  tracking-widest text-xs mt-2 font-bold">
              Complete Financial Records
            </p>
          </div>
        </header>

        {/* Filter Tabs & Month Selection */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b-2 border-ink pb-4">
          <div className="flex gap-2">
            {(['all', 'income', 'expense'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`font-mono text-sm  tracking-widest font-bold px-4 py-2 border-2 ${filter === f ? 'bg-ink text-paper border-ink' : 'border-transparent text-ink-light hover:border-ink/30 hover:text-ink'}`}
              >
                {f === 'all' ? 'Entire Ledger' : f === 'income' ? 'Deposits Only' : 'Withdrawals Only'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 font-mono text-sm font-bold">
            <label htmlFor="month-select" className=" tracking-widest text-ink-light">Vol.</label>
            <select 
              id="month-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent border-b-2 border-ink py-1 focus:outline-none  tracking-widest"
            >
              <option value="all">All Volumes</option>
              {availableMonths.map(m => {
                const [year, month] = m.split('-');
                const date = new Date(Number(year), Number(month) - 1);
                return (
                  <option key={m} value={m}>
                    {date.toLocaleString('en-US', { month: 'short' })} {year}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Financial Table */}
        <div className="bg-white border-4 border-ink shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="grid grid-cols-12 border-b-4 border-ink bg-paper p-4 font-mono font-bold  tracking-widest text-xs">
              <div className="col-span-3">Date / Category</div>
              <div className="col-span-4 border-l-2 border-ink pl-4">Particulars (Memo)</div>
              <div className="col-span-3 border-l-2 border-ink pl-4 text-right">Amount</div>
              <div className="col-span-2 border-l-2 border-ink pl-4 text-center">Act</div>
            </div>
            
            <div className="divide-y-2 divide-ink">
              {isTxLoading ? (
                <div className="p-8 text-center font-mono text-ink-light">Fetching archives...</div>
              ) : filteredTransactions.length === 0 ? (
                <div className="p-8 text-center font-mono text-ink-light">No records found for this filter.</div>
              ) : (
                filteredTransactions.map((tx) => (
                  <div key={tx.id} className="grid grid-cols-12 p-4 hover:bg-paper/50 transition-colors group">
                    <div className="col-span-3">
                      <p className="font-bold text-ink  tracking-wider font-mono text-sm flex items-center gap-2">
                        <span className="w-8 h-8 flex items-center justify-center text-lg">
                          {(tx as any).imageUrl ? (
                            <img src={(tx as any).imageUrl} alt={tx.category} className="w-6 h-6 object-contain" />
                          ) : (
                            tx.emoji || '📝'
                          )}
                        </span> 
                        <span className="truncate">{tx.category}</span>
                      </p>
                      <p className="text-xs font-mono text-ink-light mt-1">
                        {new Date(tx.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="col-span-4 border-l-2 border-ink/20 pl-4 flex items-center font-mono text-sm text-ink-light">
                      {tx.note ? <span className="truncate">{tx.note}</span> : <span className="opacity-50 italic">No memorandum</span>}
                    </div>
                    <div className="col-span-3 border-l-2 border-ink/20 pl-4 flex items-center justify-end">
                      <p className={`font-bold font-serif text-lg ${tx.type === 'income' ? 'text-olive' : 'text-brick'}`}>
                        {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="col-span-2 border-l-2 border-ink/20 pl-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button 
                        onClick={() => setEditingTx(tx)}
                        className="text-xs font-bold font-mono text-ink hover:text-denim underline decoration-2 underline-offset-4 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                      >
                        EDIT
                      </button>
                      <button 
                        onClick={() => handleDelete(tx.id)}
                        className="text-xs font-bold font-mono text-ink hover:text-brick underline decoration-2 underline-offset-4 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                      >
                        STRIKE
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </main>

      {/* Edit Modal */}
      <TransactionForm 
        isOpen={!!editingTx} 
        onClose={() => setEditingTx(null)} 
        initialData={editingTx}
      />
    </>
  );
}
