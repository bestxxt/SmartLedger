import { create } from 'zustand';
import api from '../api';

export interface Hotword {
  id: string;
  word: string;
  context?: string | null;
  replacement?: string | null;
}

interface HotwordState {
  hotwords: Hotword[];
  isLoading: boolean;
  error: string | null;
  fetchHotwords: () => Promise<void>;
  createHotword: (data: Omit<Hotword, 'id'>) => Promise<Hotword>;
  updateHotword: (id: string, data: Partial<Hotword>) => Promise<void>;
  deleteHotword: (id: string) => Promise<void>;
}

export const useHotwordStore = create<HotwordState>((set, get) => ({
  hotwords: [],
  isLoading: false,
  error: null,
  
  fetchHotwords: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/hotwords');
      set({ hotwords: response.data });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch hotwords' });
    } finally {
      set({ isLoading: false });
    }
  },

  createHotword: async (data) => {
    try {
      const response = await api.post('/hotwords', data);
      set({ hotwords: [response.data, ...get().hotwords] });
      return response.data;
    } catch (error: any) {
      console.error('Failed to create hotword:', error);
      throw error;
    }
  },

  updateHotword: async (id, data) => {
    try {
      const response = await api.put(`/hotwords/${id}`, data);
      set({
        hotwords: get().hotwords.map(h => h.id === id ? response.data : h)
      });
    } catch (error: any) {
      console.error('Failed to update hotword:', error);
      throw error;
    }
  },

  deleteHotword: async (id) => {
    try {
      await api.delete(`/hotwords/${id}`);
      set({
        hotwords: get().hotwords.filter(h => h.id !== id)
      });
    } catch (error: any) {
      console.error('Failed to delete hotword:', error);
      throw error;
    }
  }
}));
