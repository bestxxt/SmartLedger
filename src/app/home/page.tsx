'use client';

import { useEffect, useState, FormEvent, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import PopupEdit, { PopupEditState } from '@/components/PopupEdit';
import { Transaction } from '@/types/transaction';
import { format } from 'date-fns';

import { Info } from 'lucide-react';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export default function Home() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const limit = 10;

    // stats API state
    const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0, balance: 0, totalCount: 0 });
    const { totalIncome, totalExpense, balance, totalCount } = stats;
    const incomeWidth = balance !== 0 ? `${((totalIncome / (totalIncome + totalExpense)) * 100 - 1).toFixed(2)}%` : '50%';
    const expensesWidth = balance !== 0 ? `${((totalExpense / (totalIncome + totalExpense)) * 100 - 1).toFixed(2)}%` : '50%';

    // const incomePct = totalIncome + totalExpense > 0
    //     ? ((totalIncome / (totalIncome + totalExpense)) * 100).toFixed(2)
    //     : '50';
    // const expensePct = totalIncome + totalExpense > 0
    //     ? ((totalExpense / (totalIncome + totalExpense)) * 100).toFixed(2)
    //     : '50';

    // fetch aggregated stats
    const fetchStats = useCallback(async () => {
        try {
            const res = await fetch('/api/app/transactions/stats');
            if (!res.ok) throw new Error('Failed to fetch stats');
            const json = await res.json();
            setStats(json.data);
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
            const json = await res.json();
            const items: Transaction[] = json.data.map((item: Transaction) => ({
                ...item,
                timestamp: new Date(item.timestamp),
                createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
                updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
            }));

            setTransactions(prev => append ? [...prev, ...items] : items);
            setHasMore((append ? transactions.length + items.length : items.length) < stats.totalCount);
            setPage(pageNumber);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            if (append) setLoadingMore(false);
        }
    }, [limit, stats.totalCount, transactions.length]);


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
    useEffect(() => {
        if (!hasMore) return;
        const onScroll = () => {
            if (loadingMore) return;
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100) {
                if (transactions.length < stats.totalCount) fetchData(page + 1, true);
            }
        };
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, [hasMore, loadingMore, page, stats.totalCount, transactions.length, fetchData]);

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
        <main className="relative flex items-start justify-center min-h-screen bg-[#F5EFE9] py-10">
            <div className="w-full max-w-md px-6">
                {/* Balance fetched from stats API */}
                <div className="shadow-md bg-[#FEF8F3] p-4 rounded-xl mb-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-gray-500 text-xl">Current Balance</h2>
                        <p className="text-4xl font-bold text-gray-900">${balance.toFixed(2)}</p>
                    </div>
                    <img
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=happy"
                        alt="User Avatar"
                        className="w-16 h-16 rounded-full mr-5 border-2 border-gray-300"
                    />
                </div>
                {/* Stats fetched from API */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex flex-col items-center bg-green-100 rounded-xl p-4 shadow-md mr-2 min-w-20" style={{ width: incomeWidth }}>
                        <h4 className="text-sm font-medium text-green-600">Income</h4>
                        <p className="text-lg font-bold text-green-800">${totalIncome.toFixed(2)}</p>
                    </div>
                    <div className="flex flex-col items-center bg-red-100 rounded-xl p-4 shadow-md ml-2 min-w-20" style={{ width: expensesWidth }}>
                        <h4 className="text-sm font-medium text-red-600">Expenses</h4>
                        <p className="text-lg font-bold text-red-800">${totalExpense.toFixed(2)}</p>
                    </div>
                </div>
                {/* Transaction List */}
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Transactions</h3>
                <ul className="shadow-md rounded-xl p-4 bg-[#FEF8F3]">
                    {transactions.map(tx => (
                        <li key={tx.id}>
                            <DropdownMenu>
                                <div className="flex items-center justify-between cursor-pointer rounded-md px-2 py-2 hover:bg-orange-100 ">
                                    <div className="flex items-center gap-3">
                                        {/* <span className="text-xl">{tx.icon}</span> */}
                                        <div>
                                            <p className="font-medium text-gray-800">{tx.category}</p>
                                            <p className="text-sm text-gray-500">
                                                {format(tx.timestamp, 'yyyy/MM/dd HH:mm')}
                                            </p>
                                        </div>
                                    </div>
                                    <p className={`font-semibold ${tx.type === 'income' ? 'text-teal-600' : 'text-red-500'}`}>
                                        {tx.type === 'expense' ? `-$${Math.abs(tx.amount)}` : `$${tx.amount}`}
                                    </p>
                                    <DropdownMenuTrigger asChild>
                                        <Info />
                                    </DropdownMenuTrigger>
                                    
                                </div>
                                {!transactions[transactions.length - 1] || transactions[transactions.length - 1].id !== tx.id ? <hr /> : null}
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => console.log('Details', tx.id)}>Details</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => console.log('Edit', tx.id)}>Edit</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => deleteTransaction(tx.id)}>Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </li>
                    ))}
                    {hasMore && (
                        <li className="text-center py-4 flex justify-center">
                            <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                            </svg>
                        </li>
                    )}
                </ul>
            </div>

            {/* Replace Drawer popup with PopupEdit component */}
            <PopupEdit
                onSubmit={handleAdd}
            />

            <div className="absolute top-4 right-4">
                <Button variant="outline" onClick={handleLogout}>
                    Logout
                </Button>
            </div>
        </main>
    );
}
