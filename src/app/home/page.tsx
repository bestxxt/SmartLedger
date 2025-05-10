'use client';

import { useEffect, useState, FormEvent, useCallback, useRef } from "react";
import { Transaction } from '@/types/transaction';
import { User } from '@/types/user';
import { Loader } from "lucide-react"
import PopupEdit from '@/components/PopupEdit';
import PopupAudio from "@/components/PopupAudio";
import PopupPicture from "@/components/PopupPicture";
import { EditableTransaction } from "@/types/transaction";
import CurrentBalance from '@/components/CurrentBalance';
import FinancialSummary from '@/components/FinancialSummary';
import TransactionList from '@/components/TransactionList';
import Setting from '@/components/Setting';
import { toast } from "sonner";
import { Plus, Mic, Camera, Settings } from "lucide-react";

export default function Home() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const limit = 10;
    const [loading, setLoading] = useState(true);

    // Drawer states
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isAudioOpen, setIsAudioOpen] = useState(false);
    const [isPictureOpen, setIsPictureOpen] = useState(false);
    const [isSettingOpen, setIsSettingOpen] = useState(false);

    // stats API state
    const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0, balance: 0, totalCount: 0 });
    const { totalIncome, totalExpense, balance } = stats;    // fetch user data
    const [user, setUser] = useState<User | null>(null);
    const fetchUser = useCallback(async () => {
        try {
            const res = await fetch('/api/app/me');
            if (!res.ok) throw new Error('Failed to fetch user data');
            const json = await res.json();
            setUser(json.data);
        } catch (err) {
            console.error('Error fetching user data:', err);
        }
    }, []);
    // fetch aggregated stats
    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/app/transactions/stats');
            if (!res.ok) throw new Error('Failed to fetch stats');
            const json = await res.json();
            setStats(json.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    }, []);

    const fetchData = useCallback(async (pageNumber = 1, append = false) => {
        if (append) setLoadingMore(true);
        try {
            const res = await fetch(
                `/api/app/transactions?page=${pageNumber}&limit=${limit}`
            );
            if (!res.ok) throw new Error('Network response was not ok');
            const json = await res.json() as {
                data: Transaction[];
                pagination: { total: number; page: number; limit: number };
                isEnd: boolean;
            };
            // console.log('Fetched transactions:', json);
            const items: Transaction[] = json.data.map((item: Transaction) => ({
                ...item,
                timestamp: new Date(item.timestamp),
                createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
                updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
            }));
            // console.log('Fetched transactions:', items);

            setTransactions(prev => append ? [...prev, ...items] : items);
            setPage(pageNumber);
            setHasMore(!json.isEnd);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            if (append) setLoadingMore(false);
        }
    }, [limit]);


    const handleAdd = async (txData: EditableTransaction) => {
        try {
            const payload = {
                amount: txData.amount,
                type: txData.type,
                category: txData.category,
                subcategory: txData.subcategory,
                timestamp: txData.timestamp,
                note: txData.note,
                currency: txData.currency,
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
                // Instead of manually adding to the list, refresh the data
                await fetchData(1); // Reset to first page and fetch fresh data
                fetchStats();
                toast.success('Transaction added successfully');
            }
        } catch (err) {
            console.error('Failed to add transaction', err);
            toast.error('Failed to add transaction');
        }
    };

    // delete a transaction by id
    const deleteTransaction = async (id: string) => {
        try {
            const res = await fetch(`/api/app/transactions/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
            setTransactions(prev => prev.filter(tx => tx.id !== id));
            fetchStats();
            toast.success('Transaction deleted successfully');
        } catch (err) {
            console.error('Error deleting transaction:', err);
            toast.error('Failed to delete transaction');
        }
    };

    const handleEdit = async (editedTx: EditableTransaction, id: string) => {
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
                // 更新交易列表
                setTransactions(prev => prev.map(tx => 
                    tx.id === updatedTx.id ? updatedTx : tx
                ));
                // 更新统计数据
                fetchStats();
                toast.success('Transaction updated successfully');
            }
        } catch (err) {
            console.error('Error updating transaction:', err);
            toast.error('Failed to update transaction');
        }
    };

    useEffect(() => {
        fetchStats();
        fetchUser();
        fetchData(1);
    }, [fetchStats, fetchData]);

    // Infinite scroll: load next page when reaching bottom and more is available
    // Use IntersectionObserver for infinite scroll
    const loaderRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        if (!hasMore || loadingMore) return;
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        fetchData(page + 1, true);
                    }
                });
            },
            { root: null, rootMargin: '0px', threshold: 1.0 }
        );
        const loader = loaderRef.current;
        if (loader) observer.observe(loader);
        return () => {
            if (loader) observer.unobserve(loader);
            observer.disconnect();
        };
    }, [hasMore, loadingMore, page, fetchData]);

    return (
        <main className="relative flex items-start justify-center min-h-screen bg-white py-10">
            <div className="w-full max-w-md ">
                {/* Balance fetched from stats API */}
                <CurrentBalance loading={loading} balance={balance} user={user} />
                {/* Stats fetched from API */}
                <FinancialSummary loading={loading} totalIncome={totalIncome} totalExpense={totalExpense} balance={balance} />

                {/* Transaction List */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-dashed border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <h3 className="text-lg font-semibold bg-white px-4 text-gray-800">Transactions</h3>
                    </div>
                </div>
                <TransactionList 
                    transactions={transactions} 
                    deleteTransaction={deleteTransaction}
                    user={user}
                    onEdit={handleEdit}
                />

                {hasMore && (
                    <div className="text-center py-4 flex justify-center">
                        <Loader className="animate-spin" />
                        <div ref={loaderRef} className="h-4"></div>
                    </div>
                )}
            </div>

            {/* Floating action buttons */}
            <div className="fixed bottom-6 right-6 flex flex-col gap-4">
                <button
                    onClick={() => setIsEditOpen(true)}
                    className="bg-teal-500 hover:bg-teal-600 text-white rounded-full p-4 shadow-lg"
                    aria-label="Add transaction"
                >
                    <Plus />
                </button>
                <button
                    onClick={() => setIsAudioOpen(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg"
                    aria-label="Record audio"
                >
                    <Mic />
                </button>
                <button
                    onClick={() => setIsPictureOpen(true)}
                    className="bg-purple-500 hover:bg-purple-600 text-white rounded-full p-4 shadow-lg"
                    aria-label="Take picture"
                >
                    <Camera />
                </button>
                <button
                    onClick={() => setIsSettingOpen(true)}
                    className="bg-gray-500 hover:bg-gray-600 text-white rounded-full p-4 shadow-lg"
                    aria-label="Settings"
                >
                    <Settings />
                </button>
            </div>

            {/* Drawer components */}
            <PopupEdit
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                onSubmit={handleAdd}
                user={user}
            />
            <PopupAudio
                open={isAudioOpen}
                onOpenChange={setIsAudioOpen}
                onSubmit={handleAdd}
                user={user || undefined}
            />
            <PopupPicture
                open={isPictureOpen}
                onOpenChange={setIsPictureOpen}
                onSubmit={handleAdd}
                user={user || undefined}
            />
            <Setting 
                open={isSettingOpen}
                onOpenChange={setIsSettingOpen}
                user={user} 
            />
        </main>
    );
}
