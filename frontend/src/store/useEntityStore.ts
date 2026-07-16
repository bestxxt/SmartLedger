import { create } from 'zustand';
import api from '../api';
import type { Transaction } from './useTransactionStore';

export interface TrackingEntity {
  id: string;
  name: string;
  type: string;
  purchasePrice?: number | null;
  residualValue?: number | null;
  purchaseDate?: string | null;
  status: string;
  _count?: {
    transactions: number;
  };
}

interface EntityState {
  entities: TrackingEntity[];
  isLoading: boolean;
  error: string | null;
  fetchEntities: () => Promise<void>;
  createEntity: (data: Omit<TrackingEntity, 'id' | '_count'>) => Promise<TrackingEntity>;
  updateEntity: (id: string, data: Partial<TrackingEntity>) => Promise<void>;
  deleteEntity: (id: string) => Promise<void>;
}

export const useEntityStore = create<EntityState>((set, get) => ({
  entities: [],
  isLoading: false,
  error: null,
  
  fetchEntities: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/entities');
      set({ entities: response.data });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch entities' });
    } finally {
      set({ isLoading: false });
    }
  },

  createEntity: async (data) => {
    try {
      const response = await api.post('/entities', data);
      set({ entities: [response.data, ...get().entities] });
      return response.data;
    } catch (error: any) {
      console.error('Failed to create entity:', error);
      throw error;
    }
  },

  updateEntity: async (id, data) => {
    try {
      const response = await api.put(`/entities/${id}`, data);
      set({
        entities: get().entities.map(e => e.id === id ? response.data : e)
      });
    } catch (error: any) {
      console.error('Failed to update entity:', error);
      throw error;
    }
  },

  deleteEntity: async (id) => {
    try {
      await api.delete(`/entities/${id}`);
      set({
        entities: get().entities.filter(e => e.id !== id)
      });
    } catch (error: any) {
      console.error('Failed to delete entity:', error);
      throw error;
    }
  }
}));
