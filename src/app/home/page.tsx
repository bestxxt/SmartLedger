'use client';

import { useEffect, useRef, useState } from "react";
import { Loader, RefreshCw, Filter, Plus } from "lucide-react"
import { toast } from "sonner";
import PopupEdit from '@/components/PopupEdit';
import PopupAudio from "@/components/PopupAudio";
import PopupPicture from "@/components/PopupPicture";
import CurrentBalance from '@/components/CurrentBalance';
import TransactionList from '@/components/TransactionList';
import Setting from '@/components/Setting';
import Head from "@/components/Head";
import Bottom from "@/components/Bottom";
import { main_income_categories, main_expense_categories } from '@/lib/constants';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useUserStore } from '@/store/useUserStore';
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
import { useRouter } from "next/navigation";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { signOut } from "next-auth/react";

export default function Home() {
    const [isInView, setIsInView] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isAudioOpen, setIsAudioOpen] = useState(false);
    const [isPictureOpen, setIsPictureOpen] = useState(false);
    const [isSettingOpen, setIsSettingOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const { user, queryUser } = useUserStore();
    const {
        transaction_loading,
        hasMore,
        loadMore,
        filters,
        queryTransactions,
        handleFilterChange,
        applyFilters,
        resetFilters,
    } = useTransactionStore();
    const router = useRouter();
    const loaderRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        try {
            queryUser();
        } catch (error) {
            console.error('Error fetching user data:', error);
            // 不需要在这里处理登出，因为 useUserStore 中已经处理了
        }
    }, [queryUser]);

    useEffect(() => {
        if (!isInView || transaction_loading || !hasMore) return;
        loadMore();
    }, [isInView]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                setIsInView(entry.isIntersecting);
            },
            {
                root: null,
                threshold: 0.1,
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

    const handleRefreshTransactions = async () => {
        try {
            await queryTransactions(1);
            toast.success('Transactions refreshed');
        } catch (error) {
            console.error('Error refreshing transactions:', error);
            toast.error('Failed to refresh transactions');
        }
    };

    return (
        <main className="relative flex items-start justify-center min-h-screen bg-[#F8F8F7]" >
            <div className="w-full max-w-md ">
                <Head onMenuClick={() => setIsSettingOpen(true)} />
                <CurrentBalance />

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
                            disabled={transaction_loading}
                            className="p-1 bg-[#F8F8F7] hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <RefreshCw className={`w-4 h-4 text-gray-600 ${transaction_loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

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
                                    onClick={() => {
                                        applyFilters();
                                        setIsFilterOpen(false);
                                    }}
                                >
                                    Apply Filters
                                </Button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <TransactionList />
                <div ref={loaderRef} className="h-1"></div>
                {!hasMore && (
                    <p className="text-gray-500 h-30 w-full flex justify-center my-5">No more transactions</p>
                )}
            </div>

            {user && (
                <>
                    <PopupEdit
                        open={isEditOpen}
                        onOpenChange={setIsEditOpen}
                    />
                    <Setting
                        open={isSettingOpen}
                        onOpenChange={(open) => {
                            setIsSettingOpen(open);
                            if (!open) queryUser();
                        }}
                        user={user}
                    />
                </>
            )}

            {/* add button */}
            <button
                className="fixed bottom-10 right-10 w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center"
                onClick={() => setIsEditOpen(true)}
            >
                <Plus className="w-7 h-7" />
            </button>

            {/* <Bottom
                onPicture={() => setIsPictureOpen(true)}
                onAdd={() => setIsEditOpen(true)}
                onAudio={() => setIsAudioOpen(true)}
            /> */}
        </main>
    );
}
