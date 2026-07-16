import { create } from 'zustand';
import api from '../api';

export type Transaction = {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  timestamp: string;
  note?: string;
  currency?: string;
  emoji?: string;
};

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  fetchTransactions: () => Promise<void>;
  createTransaction: (data: Partial<Transaction>) => Promise<void>;
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  isLoading: false,
  error: null,

  fetchTransactions: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/transactions');
      set({ transactions: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to fetch transactions', isLoading: false });
    }
  },

  createTransaction: async (data) => {
    try {
      const response = await api.post('/transactions', data);
      const newTransaction = response.data;
      set({ transactions: [newTransaction, ...get().transactions] });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to create transaction' });
      throw error;
    }
  },

  updateTransaction: async (id, data) => {
    try {
      const response = await api.put(`/transactions/${id}`, data);
      const updatedTx = response.data;
      set({ transactions: get().transactions.map(t => t.id === id ? updatedTx : t) });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to update transaction' });
      throw error;
    }
  },

  deleteTransaction: async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      set({ transactions: get().transactions.filter(t => t.id !== id) });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to delete transaction' });
      throw error;
    }
  }
}));
