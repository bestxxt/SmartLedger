import { Transaction, EditableTransaction } from '@/types/transaction';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { BillCard } from './BillCard';
import { format } from 'date-fns';
import { motion, AnimatePresence } from "framer-motion";
import { User } from '@/types/user';
import { useState } from 'react';
import PopupEdit from './PopupEdit';
import { toast } from 'sonner';

type TransactionListProps = {
  transactions: Transaction[];
  deleteTransaction: (id: string) => Promise<void>;
  user: User | null;
  onEdit: (editedTx: EditableTransaction, id: string) => Promise<void>;
};

type BillCardProps = {
  transaction: Transaction;
  onDelete: (id: string) => Promise<void>;
  user: User | null;
  onEdit: () => void;
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

  // group by month
  const groups: Record<string, Transaction[]> = {};
  transactions.forEach(tx => {
    const key = format(tx.timestamp, 'yyyy-MM');
    if (!groups[key]) groups[key] = [];
    groups[key].push(tx);
  });
  const sortedKeys = Object.keys(groups).sort().reverse();

  return (
    <>
      {sortedKeys.map(monthKey => {
        const items = groups[monthKey];
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
            <div className="bg-gray-50 px-4 py-2 border-b">
              <h4 className="font-medium text-gray-700">{title}</h4>
            </div>
            <ul className="py-2 px-2">
              <AnimatePresence>
                {items.map((tx, index) => (
                  <motion.li
                    key={tx.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ 
                      duration: 0.3,
                      delay: index * 0.1
                    }}
                    className={`mb-2 rounded-md ${tx.type === 'income' ? 'bg-green-50' : 'bg-red-50'}`}
                  > 
                    <Popover>
                      <PopoverTrigger asChild>
                        <div className={`flex items-center justify-between cursor-pointer rounded-md p-3 hover:bg-orange-100 border-l-4 ${tx.type === 'income' ? 'border-green-500' : 'border-red-500'}`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <motion.div 
                              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${tx.type === 'income' ? 'bg-green-200' : 'bg-red-200'}`}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            > 
                              <span className="text-xl">{tx.emoji}</span>
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <p className="font-medium text-gray-800 truncate">
                                    {tx.category}
                                {tx.subcategory && (
                                        <span className="text-sm text-gray-500 ml-1">• {tx.subcategory}</span>
                                )}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-sm text-gray-500">{format(tx.timestamp, 'MM/dd HH:mm')}</p>
                                {/* {tx.location && (
                                  <span className="text-sm text-gray-500">• {tx.location}</span>
                                )} */}
                              </div>
                              {tx.tags && tx.tags.length > 0 && (
                                <motion.div 
                                  className="flex flex-wrap gap-1 mt-1"
                                  initial={{ opacity: 0 }}
                                  whileInView={{ opacity: 1 }}
                                  viewport={{ once: true }}
                                  transition={{ delay: 0.2 }}
                                >
                                  {tx.tags.map((tag, index) => (
                                    <motion.span
                                      key={index}
                                      initial={{ scale: 0.8, opacity: 0 }}
                                      whileInView={{ scale: 1, opacity: 1 }}
                                      viewport={{ once: true }}
                                      transition={{ delay: 0.3 + index * 0.1 }}
                                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                                    >
                                      {tag}
                                    </motion.span>
                                  ))}
                                </motion.div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end ml-4 flex-shrink-0">
                            <p className={`font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-500'}`}> 
                              {tx.type === 'income' ? `${tx.amount} ${tx.currency || '$'}` : `-${Math.abs(tx.amount)} ${tx.currency || '$'}`}
                            </p>
                            {tx.note && (
                              <p className="text-xs text-gray-500 mt-1 max-w-[150px] truncate">
                                {tx.note}
                              </p>
                            )}
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
                  </motion.li>
                ))}
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