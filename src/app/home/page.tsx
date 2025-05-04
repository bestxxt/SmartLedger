'use client';

import { useEffect, useState, FormEvent, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/types/transaction';
import { format } from 'date-fns';
import FormattedNumber from "@/components/FormattedNumber";
import PopupEdit, { PopupEditState } from '@/components/PopupEdit';
import PopupAudio from "@/components/PopupAudio";
import { Loader } from "lucide-react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"


export default function Home() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const limit = 10;
    const [loading, setLoading] = useState(true);

    // stats API state
    const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0, balance: 0, totalCount: 0 });
    const { totalIncome, totalExpense, balance, totalCount } = stats;
    const incomeWidth = balance !== 0 ? `${((totalIncome / (totalIncome + totalExpense)) * 100).toFixed(2)}%` : '50%';
    const expensesWidth = balance !== 0 ? `${((totalExpense / (totalIncome + totalExpense)) * 100).toFixed(2)}%` : '50%';

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

            setTransactions(prev => append ? [...prev, ...items] : items);
            setPage(pageNumber);
            setHasMore(!json.isEnd);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            if (append) setLoadingMore(false);
        }
    }, [limit]);


    const handleAdd = async (txData: PopupEditState) => {
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
            };
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

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/account/logout', {
                method: 'POST',
            });
            if (response.ok) {
                window.location.href = '/login';
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };


    return (
        <main className="relative flex items-start justify-center min-h-screen bg-white py-10">
            <div className="w-full max-w-md ">
                {/* Balance fetched from stats API */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl mb-6 shadow-sm">
                    <div className="flex justify-between items-center">
                        <div className="space-y-2">
                            <h2 className="text-gray-600 text-sm font-medium uppercase tracking-wider">Current Balance</h2>
                            {loading ? (
                                <div className="flex items-center space-x-2">
                                    <Loader className="h-5 w-5 animate-spin text-blue-500" />
                                    <span className="text-gray-500">Loading...</span>
                                </div>
                            ) : (
                                <div className="flex items-baseline">
                                    <span className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">$</span>
                                    <span className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                                        <FormattedNumber value={balance.toFixed(2)} />
                                    </span>
                                </div>
                            )}
                            <p className="text-xs text-gray-500">Updated {format(new Date(), 'MMM d, yyyy')}</p>
                        </div>
                        <div className="bg-white p-2 rounded-full shadow-md">
                            <img
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=happy"
                                alt="User Avatar"
                                className="w-14 h-14 rounded-full"
                            />
                        </div>
                    </div>
                </div>
                {/* Stats fetched from API */}
                <div className="mb-6 bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="flex flex-col p-4">
                        <h3 className="text-gray-700 font-medium mb-3">Financial Summary</h3>
                        
                        {/* Comparison Bar */}
                        <div className="w-full h-8 bg-gray-100 rounded-full mb-4 overflow-hidden flex">
                            {loading ? (
                                <div className="w-full flex items-center justify-center">
                                    <Loader className="h-5 w-5 animate-spin text-blue-500" />
                                </div>
                            ) : (
                                <>
                                    <div 
                                        className="h-full bg-green-400 flex items-center justify-center text-xs font-medium text-white"
                                        style={{ width: incomeWidth }}
                                    >
                                        {parseInt(incomeWidth) > 15 && `${parseInt(incomeWidth)}%`}
                                    </div>
                                    <div 
                                        className="h-full bg-red-400 flex items-center justify-center text-xs font-medium text-white"
                                        style={{ width: expensesWidth }}
                                    >
                                        {parseInt(expensesWidth) > 15 && `${parseInt(expensesWidth)}%`}
                                    </div>
                                </>
                            )}
                        </div>
                        
                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-green-50 rounded-lg p-3 border-l-4 border-green-400">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-green-600 font-medium">Income</span>
                                    <span className="bg-green-100 p-1 rounded-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                                        </svg>
                                    </span>
                                </div>
                                {loading ? (
                                    <div className="mt-2 flex items-center">
                                        <Loader className="h-4 w-4 animate-spin text-green-600 mr-2" />
                                    </div>
                                ) : (
                                    <p className="text-lg font-bold text-gray-800 mt-1">
                                        ${totalIncome.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                    </p>
                                )}
                            </div>
                            
                            <div className="bg-red-50 rounded-lg p-3 border-l-4 border-red-400">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-red-600 font-medium">Expenses</span>
                                    <span className="bg-red-100 p-1 rounded-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                                        </svg>
                                    </span>
                                </div>
                                {loading ? (
                                    <div className="mt-2 flex items-center">
                                        <Loader className="h-4 w-4 animate-spin text-red-600 mr-2" />
                                    </div>
                                ) : (
                                    <p className="text-lg font-bold text-gray-800 mt-1">
                                        ${totalExpense.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Transaction List */}
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Transactions</h3>
                
                {/* Group transactions by month */}
                {(() => {
                    // Create groups by month
                    const groups: Record<string, Transaction[]> = {};
                    transactions.forEach(tx => {
                        const monthKey = format(tx.timestamp, 'yyyy-MM');
                        if (!groups[monthKey]) {
                            groups[monthKey] = [];
                        }
                        groups[monthKey].push(tx);
                    });

                    // Sort month keys in descending order (newest first)
                    const sortedMonthKeys = Object.keys(groups).sort().reverse();
                    
                    return sortedMonthKeys.map(monthKey => {
                        const monthTransactions = groups[monthKey];
                        // 修复: 使用正确的日期格式化方式来显示月份
                        // 原来的格式: monthKey + '-01' 可能导致时区问题
                        // 直接从 monthKey 中提取年和月，确保正确显示
                        const [year, month] = monthKey.split('-');
                        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
                        const monthName = format(date, 'MMMM yyyy');
                        
                        return (
                            <div key={monthKey} className="mb-6 bg-white rounded-xl shadow-sm overflow-hidden">
                                <div className="bg-gray-50 px-4 py-2 border-b">
                                    <h4 className="font-medium text-gray-700">{monthName}</h4>
                                </div>
                                <ul className="py-2 px-2">
                                    {monthTransactions.map(tx => (
                                        <li key={tx.id} 
                                            className={`mb-1 rounded-md ${tx.type === 'income' ? 'bg-green-50' : 'bg-red-50'}`}>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <div className={`flex items-center justify-between cursor-pointer rounded-md p-3 
                                                                    hover:bg-orange-100 border-l-4 ${tx.type === 'income' ? 'border-green-500' : 'border-red-500'}`}>
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                                                                        ${tx.type === 'income' ? 'bg-green-200' : 'bg-red-200'}`}>
                                                                <span className="text-xl">{tx.type === 'income' ? '↑' : '↓'}</span>
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-800">{tx.category}</p>
                                                                <p className="text-sm text-gray-500">
                                                                    {format(tx.timestamp, 'yyyy/MM/dd HH:mm')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <p className={`font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                                                            {tx.type === 'expense' ? `-$${Math.abs(tx.amount)}` : `$${tx.amount}`}
                                                        </p>
                                                    </div>
                                                </PopoverTrigger>
                                                <PopoverContent>
                                                    <div className="flex flex-col items-start p-2">
                                                        <p className="text-sm text-gray-600">Transaction ID: {tx.id}</p>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            className="mt-2 w-full"
                                                            onClick={() => deleteTransaction(tx.id)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    });
                })()}
                
                {hasMore && (
                    <div className="text-center py-4 flex justify-center">
                        <Loader className="animate-spin" />
                        <div ref={loaderRef} className="h-4"></div>
                    </div>
                )}
            </div>

            {/* Replace Drawer popup with PopupEdit component */}
            <PopupEdit
                onSubmit={handleAdd}
            />
            <PopupAudio
                onSubmit={handleAdd}
            />

            <div className="absolute top-4 right-4 hidden">
                <Button variant="outline" onClick={handleLogout}>
                    Logout
                </Button>
            </div>
        </main>
    );
}
