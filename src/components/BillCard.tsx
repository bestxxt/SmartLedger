import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import { Transaction, EditableTransaction } from "@/models/transaction"
import { Check, X, Pencil, Trash2, CalendarIcon, Loader } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import PopupEdit from './PopupEdit';
import { cn } from "@/lib/utils"

type BillCardProps = {
    transaction: Transaction;
    onDelete?: (id: string) => Promise<void>;
    user?: any; // Add user prop for PopupEdit
    onEdit?: () => void;
};

export function BillCard({ transaction, onDelete, user, onEdit }: BillCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleEdit = async (editedTx: EditableTransaction) => {
        try {
            const res = await fetch(`/api/app/transactions/${transaction.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editedTx),
            });
            if (!res.ok) throw new Error('Failed to update transaction');
            setIsEditing(false);
            window.location.reload(); // Refresh to show updated data
        } catch (err) {
            console.error('Error updating transaction:', err);
        }
    };
    const handleDelete = async () => {
        if (!onDelete || isDeleting) return;
        setIsDeleting(true);
        try {
            await onDelete(transaction.id);
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
                        {transaction.type === 'income' ? '+' : '-'}{transaction.amount} {transaction.currency || "USD"}
                    </span>
                </div>
                {transaction.subcategory && (
                    <CardDescription className="text-sm">{transaction.subcategory}</CardDescription>
                )}
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
                onSubmit={handleEdit}
                user={user}
            />
        </>
    );
}

type ConfirmBillCardProps = {
    transaction: EditableTransaction;
    /** custom confirm handler: should POST and update parent state */
    onConfirm?: (tx: EditableTransaction) => Promise<void>;
    /** called after successful confirmation, for removing the card */
    onSuccess?: () => void;
    /** called when user cancels the transaction */
    onCancel?: () => void;
};

export function ConfirmBillCard({ transaction, onConfirm, onSuccess, onCancel }: ConfirmBillCardProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            if (onConfirm) {
                await onConfirm(transaction);
            } else {
                const res = await fetch('/api/app/transactions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(transaction),
                });
                if (!res.ok) throw new Error('Failed to create transaction');
                // default: refresh the page
                router.refresh();
            }
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
                        {transaction.type === 'income' ? '+' : '-'}{transaction.amount} {transaction.currency || "USD"}
                    </span>
                </div>
                {transaction.subcategory && (
                    <CardDescription className="text-sm">{transaction.subcategory}</CardDescription>
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