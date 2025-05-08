'use client';

import { useEffect, useState, FormEvent, useCallback, useRef } from "react";
import { Button } from '@/components/ui/button';
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

export default function Home() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const limit = 10;
    const [loading, setLoading] = useState(true);

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
            // console.log('Adding transaction:', payload);
            const res = await fetch('/api/app/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            if (json.transaction) {
                const tx: Transaction = {
                    ...json.transaction,
                    timestamp: new Date(json.transaction.timestamp),
                    createdAt: new Date(json.transaction.createdAt),
                    updatedAt: new Date(json.transaction.updatedAt),
                };
                setTransactions(prev => [tx, ...prev]);
                fetchStats();
            }
        } catch (err) {
            console.error('添加交易失败', err);
        }
    };

    // delete a transaction by id
    const deleteTransaction = async (id: string) => {
        try {
            const res = await fetch(`/api/app/transactions/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
            setTransactions(prev => prev.filter(tx => tx.id !== id));
            fetchStats();
        } catch (err) {
            console.error('Error deleting transaction:', err);
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
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Transactions</h3>
                <TransactionList transactions={transactions} deleteTransaction={deleteTransaction} />

                {hasMore && (
                    <div className="text-center py-4 flex justify-center">
                        <Loader className="animate-spin" />
                        <div ref={loaderRef} className="h-4"></div>
                    </div>
                )}
            </div>

            {/* Replace Drawer popup with PopupEdit component */}
            <PopupPicture
                onSubmit={handleAdd}
            />
            <PopupAudio
                onSubmit={handleAdd}
            />
            <PopupEdit
                onSubmit={handleAdd}
                user={user}
            />
            <Setting user={user} />
        </main>
    );
}
