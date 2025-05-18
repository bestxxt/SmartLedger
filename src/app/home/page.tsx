'use client';

import { useEffect, useState, useCallback, useRef } from "react";
import { Transaction, EditableTransaction } from '@/models/transaction';
import { Loader, RefreshCw, Filter } from "lucide-react"
import { toast } from "sonner";
import { User } from '@/models/user';
import PopupEdit from '@/components/PopupEdit';
import PopupAudio from "@/components/PopupAudio";
import PopupPicture from "@/components/PopupPicture";
import CurrentBalance from '@/components/CurrentBalance';
import TransactionList from '@/components/TransactionList';
import Setting from '@/components/Setting';
import Head from "@/components/Head";
import Bottom from "@/components/Bottom";
import { main_income_categories, main_expense_categories } from '@/lib/constants';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function Home() {
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const limit = 10;
    const [loading, setLoading] = useState(true);
    const [isInView, setIsInView] = useState(true);

    // Drawer states
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isAudioOpen, setIsAudioOpen] = useState(false);
    const [isPictureOpen, setIsPictureOpen] = useState(false);
    const [isSettingOpen, setIsSettingOpen] = useState(false);

    const [user, setUser] = useState<User | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        type: 'all',
        category: 'all',
        minAmount: '',
        maxAmount: '',
        dateFrom: '',
        dateTo: '',
        tags: [] as string[],
        location: '',
    });

    const fetchUser = useCallback(async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/app/me');
            if (!res.ok) throw new Error('Failed to fetch user data');
            const json = await res.json();
            setUser(json.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching user data:', err);
            toast.error('Failed to fetch user data');
        }
    }, []);

    const fetchData = useCallback(async (pageNumber = 1, append = false) => {
        if (append) setLoadingMore(true);
        try {
            // Build query string with filters
            const queryParams = new URLSearchParams();
            queryParams.append('page', pageNumber.toString());
            queryParams.append('limit', limit.toString());

            // Add filters to query params
            Object.entries(filters).forEach(([key, value]) => {
                if (value) {
                    if (Array.isArray(value)) {
                        value.forEach(v => queryParams.append(key, v));
                    } else {
                        queryParams.append(key, value);
                    }
                }
            });

            const res = await fetch(
                `/api/app/transactions?${queryParams.toString()}`
            );
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

            setTransactions(prev => append ? [...prev, ...items] : items);
            setPage(pageNumber);
            setHasMore(!json.isEnd);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            if (append) setLoadingMore(false);
        }
    }, [limit, filters]);


    const handleAdd = async (txData: EditableTransaction) => {
        try {
            const payload = {
                amount: txData.amount,
                type: txData.type,
                category: txData.category,
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
                fetchUser();
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
            fetchUser();
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
                fetchUser();
                toast.success('Transaction updated successfully');
            }
        } catch (err) {
            console.error('Error updating transaction:', err);
            toast.error('Failed to update transaction');
        }
    };

    useEffect(() => {
        fetchUser();
        // fetchData(1);
    }, [fetchUser]);

    // Infinite scroll: load next page when reaching bottom and more is available
    // Use IntersectionObserver for infinite scroll
    const loaderRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!isInView || loadingMore || !hasMore) return;
        const loadMore = async () => {
            setLoadingMore(true);
            await fetchData(page + 1, true);
            setLoadingMore(false);
        };
        loadMore();
    }, [isInView]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                setIsInView(entry.isIntersecting);
            },
            {
                root: null, // 默认是 viewport
                threshold: 0.1, // 可视部分大于 10% 就触发
            }
        );

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => {
            if (loaderRef.current) {
                observer.unobserve(loaderRef.current);
            }
        };
    }, []);

    // useEffect(() => {
    //     if (!hasMore || loadingMore) return;

    //     const handleIntersection = (entries: IntersectionObserverEntry[]) => {
    //         entries.forEach(entry => {
    //             if (entry.isIntersecting) {
    //                 fetchData(page + 1, true);
    //             }
    //         });
    //     };

    //     const observer = new IntersectionObserver(handleIntersection, {
    //         root: null,
    //         rootMargin: '0px',
    //         threshold: 1.0,
    //     });

    //     const loader = loaderRef.current;
    //     if (loader) observer.observe(loader);

    //     return () => {
    //         if (loader) observer.unobserve(loader);
    //         observer.disconnect();
    //     };
    // }, [hasMore, loadingMore, page, fetchData]);

    const handleRefreshTransactions = async () => {
        try {
            setLoadingMore(true);
            await fetchData(1); // Reset to first page and fetch fresh data
            toast.success('Transactions refreshed');
        } catch (error) {
            console.error('Error refreshing transactions:', error);
            toast.error('Failed to refresh transactions');
        } finally {
            setLoadingMore(false);
        }
    };

    const handleFilterChange = (key: string, value: string | string[]) => {
        setFilters(prev => ({
            ...prev,
            [key]: key === 'tags' ? value : (value === 'all' ? '' : value)
        }));
    };

    const applyFilters = () => {
        // Reset to first page and apply filters
        fetchData(1);
        setIsFilterOpen(false);
    };

    const resetFilters = () => {
        setFilters({
            type: '',
            category: '',
            minAmount: '',
            maxAmount: '',
            dateFrom: '',
            dateTo: '',
            tags: [],
            location: '',
        });
    };

    return (
        <main className="relative flex items-start justify-center min-h-screen bg-[#F8F8F7]" >
            <div className="w-full max-w-md ">
                <Head loading={loading} user={user} onMenuClick={() => setIsSettingOpen(true)}></Head>
                {/* Balance fetched from stats API */}
                <CurrentBalance loading={loading} user={user} />

                {/* Transaction List */}
                <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-dashed border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-between items-center px-4">
                        <button
                            onClick={() => setIsFilterOpen(true)}
                            className="p-1 bg-[#F8F8F7] hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <Filter className="w-4 h-4 text-gray-600" />
                        </button>
                        <h3 className="text-lg font-semibold bg-[#F8F8F7] rounded-full px-4 text-gray-800">Transactions</h3>
                        <button
                            onClick={handleRefreshTransactions}
                            disabled={loadingMore}
                            className="p-1 bg-[#F8F8F7] hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <RefreshCw className={`w-4 h-4 text-gray-600 ${loadingMore ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Filter Dialog */}
                <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <DialogContent className="overflow-y-auto max-h-[85dvh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle>Filter Transactions</DialogTitle>
                        </DialogHeader>
                        <div className="flex-1 overflow-y-auto">
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Type</Label>
                                        <Select
                                            value={filters.type || 'all'}
                                            onValueChange={(value) => handleFilterChange('type', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All</SelectItem>
                                                <SelectItem value="income">Income</SelectItem>
                                                <SelectItem value="expense">Expense</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Category</Label>
                                        <Select
                                            value={filters.category || 'all'}
                                            onValueChange={(value) => handleFilterChange('category', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All</SelectItem>
                                                {filters.type === 'income' ? (
                                                    main_income_categories.map((cat) => (
                                                        <SelectItem key={cat} value={cat}>
                                                            {cat}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    main_expense_categories.map((cat) => (
                                                        <SelectItem key={cat} value={cat}>
                                                            {cat}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Min Amount</Label>
                                        <Input
                                            type="number"
                                            value={filters.minAmount}
                                            onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Max Amount</Label>
                                        <Input
                                            type="number"
                                            value={filters.maxAmount}
                                            onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>From Date</Label>
                                        <Input
                                            type="date"
                                            value={filters.dateFrom}
                                            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>To Date</Label>
                                        <Input
                                            type="date"
                                            value={filters.dateTo}
                                            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Location</Label>
                                    <Select
                                        value={filters.location || 'all'}
                                        onValueChange={(value) => handleFilterChange('location', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select location" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            {user?.locations.map((loc) => (
                                                <SelectItem key={loc.id} value={loc.name}>
                                                    {loc.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Tags</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {user?.tags.map((tag) => (
                                            <Button
                                                key={tag.name}
                                                variant={filters.tags.includes(tag.name) ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => {
                                                    const newTags = filters.tags.includes(tag.name)
                                                        ? filters.tags.filter(t => t !== tag.name)
                                                        : [...filters.tags, tag.name];
                                                    handleFilterChange('tags', newTags);
                                                }}
                                            >
                                                {tag.name}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="p-0 mt-4 border-t pt-4">
                            <div className="flex justify-evenly space-x-2">
                                <Button
                                    variant="outline"
                                    className="w-[45%] h-11"
                                    onClick={resetFilters}
                                >
                                    Reset
                                </Button>
                                <Button
                                    className="w-[45%] h-11"
                                    onClick={applyFilters}
                                >
                                    Apply Filters
                                </Button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <TransactionList
                    transactions={transactions}
                    deleteTransaction={deleteTransaction}
                    user={user}
                    onEdit={handleEdit}
                />
                <div ref={loaderRef} className="h-1"></div>
                {!hasMore && (
                    <p className="text-gray-500 h-30 w-full flex justify-center my-5">No more transactions</p>
                )}

            </div>


            {/* Drawer components */}
            {user && (
                <>
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
                        user={user}
                    />
                    <PopupPicture
                        open={isPictureOpen}
                        onOpenChange={setIsPictureOpen}
                        onSubmit={handleAdd}
                        user={user}
                    />
                    <Setting
                        open={isSettingOpen}
                        onOpenChange={(open) => {
                            setIsSettingOpen(open);
                            if (!open) fetchUser();
                        }}
                        user={user}
                    />
                </>
            )}

            <Bottom
                onPicture={() => setIsPictureOpen(true)}
                onAdd={() => setIsEditOpen(true)}
                onAudio={() => setIsAudioOpen(true)}
            />
        </main>
    );
}
