import { create } from 'zustand';
import api from '../api';

export type UserStats = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  totalTransactions: number;
};

export type User = {
  id: string;
  email: string;
  name: string;
  avatar: string;
  language: string;
  currency: string;
  locations: string;
  tags: string;
  createdAt: string;
  stats?: UserStats;
};

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  fetchUser: () => Promise<void>;
  logout: () => void;
  setAuthToken: (token: string) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  fetchUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/users/me');
      set({ user: response.data, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to fetch user', 
        isAuthenticated: false,
        user: null,
        isLoading: false 
      });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false });
    window.dispatchEvent(new Event('auth:unauthorized'));
  },

  setAuthToken: (token: string) => {
    localStorage.setItem('token', token);
    set({ isAuthenticated: true });
  }
}));
