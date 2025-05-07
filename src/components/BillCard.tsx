import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import { Transaction, EditableTransaction } from "@/types/transaction"
import { Check } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type BillCardProps = {
    transaction: Transaction;
};

export function BillCard({ transaction }: BillCardProps) {
    return (
        <Card className="w-[350px] hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
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
            <CardContent className="pb-2">
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
            <CardFooter className="pt-0 text-xs text-gray-500 flex justify-between">
                <p>{transaction.location || "No location"}</p>
                <p>ID: {transaction.id.substring(0, 8)}</p>
            </CardFooter>
        </Card>
    );
}

type ConfirmBillCardProps = {
    transaction: EditableTransaction;
    /** custom confirm handler: should POST and update parent state */
    onConfirm?: (tx: EditableTransaction) => Promise<void>;
    /** called after successful confirmation, for removing the card */
    onSuccess?: () => void;
};

export function ConfirmBillCard({ transaction, onConfirm, onSuccess }: ConfirmBillCardProps) {
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
            <CardFooter className="pt-0 text-xs text-gray-500 flex justify-between ">
                <p>{transaction.location || "No location"}</p>
                <button
                    onClick={handleConfirm}
                    disabled={loading}
                    className={`flex items-center justify-center w-24 h-12 bg-amber-200 text-green-600 rounded-full hover:bg-green-200 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-label="Confirm transaction"
                >
                    <Check className="w-6 h-6" />
                </button>
            </CardFooter>
        </Card>
    );
}