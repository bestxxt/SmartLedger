import { create } from 'zustand';
import { Transaction, EditableTransaction } from '@/models/transaction';
import { toast } from 'sonner';
import { useUserStore } from './useUserStore';

interface TransactionFilters {
    type: string;
    category: string;
    minAmount: string;
    maxAmount: string;
    dateFrom: string;
    dateTo: string;
    tags: string[];
    location: string;
}

interface TransactionState {
    transactions: Transaction[];
    transaction_loading: boolean;
    hasMore: boolean;
    page: number;
    filters: TransactionFilters;
    limit: number;
    queryTransactions: (pageNumber?: number, append?: boolean) => Promise<void>;
    loadMore: () => void;
    addTransaction: (txData: EditableTransaction) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    updateTransaction: (editedTx: EditableTransaction, id: string) => Promise<void>;
    handleFilterChange: (key: string, value: string | string[]) => void;
    applyFilters: () => void;
    resetFilters: () => void;
}

const initialFilters: TransactionFilters = {
    type: 'all',
    category: 'all',
    minAmount: '',
    maxAmount: '',
    dateFrom: '',
    dateTo: '',
    tags: [],
    location: '',
};

export const useTransactionStore = create<TransactionState>((set, get) => ({
    transactions: [],
    transaction_loading: false,
    hasMore: true,
    page: 0,
    filters: initialFilters,
    limit: 20,

    queryTransactions: async (pageNumber = 1, append = false) => {
        const { filters, limit } = get();
        if (append) set({ transaction_loading: true });
        try {
            const queryParams = new URLSearchParams();
            queryParams.append('page', pageNumber.toString());
            queryParams.append('limit', limit.toString());

            Object.entries(filters).forEach(([key, value]) => {
                if (value) {
                    if (Array.isArray(value)) {
                        value.forEach(v => queryParams.append(key, v));
                    } else {
                        queryParams.append(key, value);
                    }
                }
            });

            const res = await fetch(`/api/app/transactions?${queryParams.toString()}`);
            if (!res.ok) throw new Error('Network response was not ok');
            const json = await res.json() as {
                data: Transaction[];
                pagination: { total: number; page: number; limit: number };
                isEnd: boolean;
            };

            const items: Transaction[] = json.data.map((item: Transaction) => ({
                ...item,
                timestamp: new Date(item.timestamp),
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
            }));

            set(state => ({
                transactions: append ? [...state.transactions, ...items] : items,
                page: pageNumber,
                hasMore: !json.isEnd,
                transaction_loading: false,
            }));
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to fetch transactions');
            set({ transaction_loading: false });
        }
    },

    loadMore: () => {
        const { page, queryTransactions } = get();
        queryTransactions(page + 1, true);
    },

    addTransaction: async (txData: EditableTransaction) => {
        try {
            const payload = {
                amount: txData.amount,
                originalAmount: txData.originalAmount,
                type: txData.type,
                category: txData.category,
                timestamp: txData.timestamp,
                note: txData.note,
                currency: txData.currency,
                originalCurrency: txData.originalCurrency,
                tags: txData.tags,
                location: txData.location,
                emoji: txData.emoji,
            };
            const res = await fetch('/api/app/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            if (json.transaction) {
                await get().queryTransactions(1);
                toast.success('Transaction added successfully');
                useUserStore.getState().queryUser();
            }
        } catch (err) {
            console.error('Failed to add transaction', err);
            toast.error('Failed to add transaction');
        }
    },

    deleteTransaction: async (id: string) => {
        try {
            const res = await fetch(`/api/app/transactions/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
            set(state => ({
                transactions: state.transactions.filter(tx => tx.id !== id)
            }));
            toast.success('Transaction deleted successfully');
            useUserStore.getState().queryUser();
        } catch (err) {
            console.error('Error deleting transaction:', err);
            toast.error('Failed to delete transaction');
        }
    },

    updateTransaction: async (editedTx: EditableTransaction, id: string) => {
        try {
            const res = await fetch(`/api/app/transactions/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editedTx),
            });
            if (!res.ok) throw new Error('Failed to update transaction');
            const json = await res.json();
            if (json.transaction) {
                const updatedTx: Transaction = {
                    ...json.transaction,
                    timestamp: new Date(json.transaction.timestamp),
                    updatedAt: json.transaction.updatedAt ? new Date(json.transaction.updatedAt) : undefined,
                };
                set(state => ({
                    transactions: state.transactions.map(tx =>
                        tx.id === updatedTx.id ? updatedTx : tx
                    )
                }));
                toast.success('Transaction updated successfully');
                useUserStore.getState().queryUser();
            }
        } catch (err) {
            console.error('Error updating transaction:', err);
            toast.error('Failed to update transaction');
        }
    },

    handleFilterChange: (key: string, value: string | string[]) => {
        set(state => ({
            filters: {
                ...state.filters,
                [key]: key === 'tags' ? value : (value === 'all' ? '' : value)
            }
        }));
    },

    applyFilters: () => {
        get().queryTransactions(1);
    },

    resetFilters: () => {
        set({ filters: initialFilters });
    },
})); 