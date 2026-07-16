import { create } from 'zustand';
import api from '../api';

export interface RecurringTransaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  frequency: string; // 'daily', 'weekly', 'monthly', 'yearly'
  nextDate: string;
  active: boolean;
  note?: string | null;
}

interface RecurringState {
  recurring: RecurringTransaction[];
  isLoading: boolean;
  error: string | null;
  fetchRecurring: () => Promise<void>;
  createRecurring: (data: Omit<RecurringTransaction, 'id'>) => Promise<RecurringTransaction>;
  updateRecurring: (id: string, data: Partial<RecurringTransaction>) => Promise<void>;
  deleteRecurring: (id: string) => Promise<void>;
}

export const useRecurringStore = create<RecurringState>((set, get) => ({
  recurring: [],
  isLoading: false,
  error: null,
  
  fetchRecurring: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/recurring');
      set({ recurring: response.data });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch recurring transactions' });
    } finally {
      set({ isLoading: false });
    }
  },

  createRecurring: async (data) => {
    try {
      const response = await api.post('/recurring', data);
      set({ recurring: [...get().recurring, response.data].sort((a, b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime()) });
      return response.data;
    } catch (error: any) {
      console.error('Failed to create recurring transaction:', error);
      throw error;
    }
  },

  updateRecurring: async (id, data) => {
    try {
      const response = await api.put(`/recurring/${id}`, data);
      set({
        recurring: get().recurring.map(r => r.id === id ? response.data : r).sort((a, b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime())
      });
    } catch (error: any) {
      console.error('Failed to update recurring transaction:', error);
      throw error;
    }
  },

  deleteRecurring: async (id) => {
    try {
      await api.delete(`/recurring/${id}`);
      set({
        recurring: get().recurring.filter(r => r.id !== id)
      });
    } catch (error: any) {
      console.error('Failed to delete recurring transaction:', error);
      throw error;
    }
  }
}));
