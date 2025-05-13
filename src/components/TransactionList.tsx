import { Transaction, EditableTransaction } from '@/models/transaction';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { BillCard } from './BillCard';
import { format, isSameDay } from 'date-fns';
import { motion, AnimatePresence } from "framer-motion";
import { User, Tag } from '@/models/user';
import { useState } from 'react';
import PopupEdit from './PopupEdit';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

type TransactionListProps = {
  transactions: Transaction[];
  deleteTransaction: (id: string) => Promise<void>;
  user: User | null;
  onEdit: (editedTx: EditableTransaction, id: string) => Promise<void>;
};

export default function TransactionList({ transactions, deleteTransaction, user, onEdit }: TransactionListProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const handleEdit = async (editedTx: EditableTransaction) => {
    if (!selectedTransaction?.id) return;
    try {
      await onEdit(editedTx, selectedTransaction.id);
      setIsEditing(false);
      setSelectedTransaction(null);
    } catch (err) {
      console.error('Error updating transaction:', err);
    }
  };

  // Group by month and calculate monthly statistics
  const groups: Record<string, {
    transactions: Transaction[],
    income: number,
    expense: number
  }> = {};

  transactions.forEach(tx => {
    const key = format(tx.timestamp, 'yyyy-MM');
    if (!groups[key]) {
      groups[key] = {
        transactions: [],
        income: 0,
        expense: 0
      };
    }
    groups[key].transactions.push(tx);
    if (tx.type === 'income') {
      groups[key].income += tx.amount;
    } else {
      groups[key].expense += tx.amount;
    }
  });

  const sortedKeys = Object.keys(groups).sort().reverse();

  return (
    <>
      {sortedKeys.map(monthKey => {
        const { transactions: items, income, expense } = groups[monthKey];
        const [year, month] = monthKey.split('-');
        const date = new Date(+year, +month - 1, 1);
        const title = format(date, 'MMMM yyyy');

        return (
          <motion.div
            key={monthKey}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.3 }}
            className="mb-6 bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <div className="bg-gray-50 px-4 py-3 border-b">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-700">{title}</h4>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">{income.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <span className="text-red-500">{expense.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Wallet className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-600">{(income - expense).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            <ul className="py-2 px-2">
              <AnimatePresence>
                {items.map((tx, index) => {
                  const showDateSeparator = index === 0 || !isSameDay(tx.timestamp, items[index - 1].timestamp);

                  return (
                    <motion.li
                      key={tx.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true}}
                      exit={{ opacity: 0, y: -20 }}
                      // whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.03 }}
                      transition={{
                        duration: 0.2,
                      }}
                    >
                      {showDateSeparator && (
                        <div className="px-3 py-2 text-sm text-gray-500 font-medium">
                          {format(tx.timestamp, 'EEEE, MMMM d')}
                        </div>
                      )}
                      <div className={`mb-2 rounded-md ${tx.type === 'income' ? 'bg-green-50' : 'bg-red-50'}`}>
                        <Popover>
                          <PopoverTrigger asChild>
                            <div className={`flex items-center justify-between cursor-pointer rounded-md p-3 hover:bg-orange-100 border-l-4 ${tx.type === 'income' ? 'border-green-500' : 'border-red-500'}`}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${tx.type === 'income' ? 'bg-green-200' : 'bg-red-200'}`}
                                >
                                  <span className="text-xl">{tx.emoji}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center">
                                    <p className="font-medium text-gray-800 truncate">
                                      {tx.category}
                                    </p>
                                  </div>

                                  {tx.note && (
                                    <p className="text-xs text-gray-500  max-w-[250px] truncate">
                                      {tx.note}
                                    </p>
                                  )}
                                  {tx.tags && tx.tags.length > 0 && (
                                    <div
                                      className="flex flex-wrap gap-1 mt-1"
                                      // initial={{ opacity: 0 }}
                                      // whileInView={{ opacity: 1 }}
                                      // viewport={{ once: true }}
                                      // transition={{ delay: 0.1 }}
                                    >
                                      {tx.tags.map((tagName, index) => {
                                        const userTag = user?.tags.find(t => t.name === tagName);
                                        return (
                                          <motion.span
                                            key={index}
                                            initial={{ scale: 0, opacity: 0 }}
                                            whileInView={{ scale: 1, opacity: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.3 + index * 0.1 }}
                                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                                            style={{
                                              backgroundColor: userTag?.color ? `${userTag.color}20` : '#f3f4f6',
                                              color: userTag?.color || '#374151',
                                              border: userTag?.color ? `1px solid ${userTag.color}40` : 'none'
                                            }}
                                          >
                                            {tagName}
                                          </motion.span>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col items-end ml-4 flex-shrink-0">
                                {/* <div className="flex items-center gap-2 mt-1">
                                    <p className="text-sm text-gray-500">{format(tx.timestamp, 'h:mm a')}</p>
                                  </div> */}
                                <p className={`font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>

                                  {tx.originalAmount && tx.originalCurrency && tx.originalCurrency !== tx.currency ? (
                                    <div className="flex flex-col items-end">
                                      <span>
                                        {tx.type === 'income' ? '+' : '-'}
                                        {tx.amount} {tx.currency || "USD"}
                                      </span>
                                      <span className="text-sm text-gray-500">
                                        {tx.originalAmount} {tx.originalCurrency}
                                      </span>
                                    </div>
                                  ) : (
                                    <>
                                      {tx.type === 'income' ? '+' : '-'}
                                      {tx.amount} {tx.currency || "USD"}
                                    </>
                                  )}
                                </p>
                              </div>
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="w-full bg-transparent border-none shadow-none">
                            <BillCard
                              transaction={tx}
                              onDelete={deleteTransaction}
                              user={user}
                              onEdit={() => {
                                setSelectedTransaction(tx);
                                setIsEditing(true);
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          </motion.div>
        );
      })}

      <PopupEdit
        transaction={selectedTransaction || undefined}
        open={isEditing}
        onOpenChange={setIsEditing}
        onSubmit={handleEdit}
        user={user}
        source="transaction"
      />
    </>
  );
}