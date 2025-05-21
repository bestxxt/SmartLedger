'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import { Transaction, EditableTransaction } from "@/models/transaction"
import { Check, X, Pencil, Trash2, Loader } from "lucide-react";
import { useState } from 'react';
import PopupEdit from './PopupEdit';
import { cn } from "@/lib/utils"
import { useTransactionStore } from '@/store/useTransactionStore';
import { useUserStore } from '@/store/useUserStore';
type BillCardProps = {
    transaction: Transaction;
    onEdit?: () => void;
};

export function BillCard({ transaction, onEdit }: BillCardProps) {
    const { user } = useUserStore();
    const { deleteTransaction } = useTransactionStore();
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (isDeleting) return;
        setIsDeleting(true);
        try {
            await deleteTransaction(transaction.id);
        } catch (err) {
            console.error('Error deleting transaction:', err);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <Card className="w-[350px] hover:shadow-md transition-shadow relative">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2">
                            <span>{transaction.emoji || '💰'}</span>
                            <span>{transaction.category}</span>
                        </CardTitle>
                        <span className={`font-bold ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                            {transaction.originalAmount && transaction.originalCurrency && transaction.originalCurrency !== transaction.currency ? (
                                <div className="flex flex-col items-end">
                                    <span>
                                        {transaction.type === 'income' ? '+' : '-'}
                                        {transaction.amount} {transaction.currency || "USD"}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        {transaction.originalAmount} {transaction.originalCurrency}
                                    </span>
                                </div>
                            ) : (
                                <>
                                    {transaction.type === 'income' ? '+' : '-'}
                                    {transaction.amount} {transaction.currency || "USD"}
                                </>
                            )}
                        </span>
                    </div>
                    {/* {transaction.category && (
                    <CardDescription className="text-sm">{transaction.category}</CardDescription>
                )} */}
                </CardHeader>
                <CardContent>
                    <div className="text-sm space-y-1">
                        <p className="text-gray-600">{transaction.note || "No description available"}</p>
                        <p className="text-gray-500">{transaction.timestamp.toLocaleString()}</p>
                        {transaction.tags && transaction.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {transaction.tags.map(tag => (
                                    <span key={tag} className="bg-gray-100 text-xs px-2 py-1 rounded-full">{tag}</span>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="pt-0 text-xs text-gray-500">
                    <p>{transaction.location || "No location"}</p>
                </CardFooter>
                <div className="absolute bottom-4 right-4 flex gap-4">
                    <button
                        onClick={onEdit}
                        className="p-3 hover:bg-blue-100 bg-blue-50 rounded-full transition-colors text-blue-500 shadow-sm"
                        aria-label="Edit transaction"
                    >
                        <Pencil className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className={cn(
                            "p-3 rounded-full transition-colors shadow-sm",
                            isDeleting
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "hover:bg-red-100 bg-red-50 text-red-500"
                        )}
                        aria-label="Delete transaction"
                    >
                        {isDeleting ? (
                            <Loader className="w-5 h-5 animate-spin" />
                        ) : (
                            <Trash2 className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </Card>
            <PopupEdit
                transaction={transaction}
                open={isEditing}
                onOpenChange={setIsEditing}
            />
        </>
    );
}

type ConfirmBillCardProps = {
    transaction: EditableTransaction;
    onSuccess?: () => void;
    onCancel?: () => void;
};

export function ConfirmBillCard({ transaction, onSuccess, onCancel }: ConfirmBillCardProps) {
    const { addTransaction } = useTransactionStore();
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await addTransaction(transaction);
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        }
    };

    return (
        <Card className="w-full hover:shadow-md transition-shadow mt-2">
            <CardHeader className="">
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                        <span>{transaction.emoji || '💰'}</span>
                        <span>{transaction.category}</span>
                    </CardTitle>
                    <span className={`font-bold ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {transaction.originalAmount && transaction.originalCurrency && transaction.originalCurrency !== transaction.currency ? (
                            <div className="flex flex-col items-end">
                                <span className="text-sm text-gray-500">
                                    {transaction.originalAmount} {transaction.originalCurrency}
                                </span>
                                <span>
                                    {transaction.amount} {transaction.currency || "USD"}
                                </span>
                            </div>
                        ) : (
                            <>
                                {transaction.amount} {transaction.currency || "USD"}
                            </>
                        )}
                    </span>
                </div>
                {transaction.category && (
                    <CardDescription className="text-sm">{transaction.category}</CardDescription>
                )}
            </CardHeader>
            <CardContent className="">
                <div className="text-sm space-y-1">
                    <p className="text-gray-600">{transaction.note || "No description available"}</p>
                    <p className="text-gray-500">{transaction.timestamp.toLocaleString()}</p>
                    {transaction.tags && transaction.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {transaction.tags.map(tag => (
                                <span key={tag} className="bg-gray-100 text-xs px-2 py-1 rounded-full">{tag}</span>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="pt-0 text-xs text-gray-500 flex justify-between items-center">
                <p>{transaction.location || "No location"}</p>
                <div className="flex gap-2">
                    <button
                        onClick={handleCancel}
                        disabled={loading}
                        className={`flex items-center justify-center w-12 h-12 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        aria-label="Cancel transaction"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className={`flex items-center justify-center w-12 h-12 bg-amber-200 text-green-600 rounded-full hover:bg-green-200 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        aria-label="Confirm transaction"
                    >
                        {loading ? (
                            <Loader className="w-6 h-6 animate-spin" />
                        ) : (
                            <Check className="w-6 h-6" />
                        )}
                    </button>
                </div>
            </CardFooter>
        </Card>
    );
}