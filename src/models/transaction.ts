import { Schema, model, Document, Types, models } from 'mongoose';

/**
 * Mongoose Document interface for Transaction
 */
export interface ITransaction extends Document {
    userId: Types.ObjectId;
    amount: number;  // Amount in user's default currency
    originalAmount?: number;  // Original amount in original currency
    type: 'income' | 'expense';
    category: string;
    // subcategory?: string;
    timestamp: Date;
    note?: string;
    currency?: string;  // User's default currency
    originalCurrency?: string;  // Original transaction currency
    tags?: string[];
    location?: string;
    emoji?: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Frontend data type for Transaction
 */
export type Transaction = {
    id: string;
    userId?: string;
    amount: number;  // Amount in user's default currency
    originalAmount?: number;  // Original amount in original currency
    type: 'income' | 'expense';
    category: string;
    // subcategory?: string;
    timestamp: Date;
    note?: string;
    currency?: string;  // User's default currency
    originalCurrency?: string;  // Original transaction currency
    tags?: string[];
    location?: string;
    emoji?: string;
    createdAt: string;
    updatedAt: string;
};

/**
 * Mongoose schema definition for Transaction
 */
const TransactionSchema = new Schema<ITransaction>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        amount: { type: Number, required: true },
        originalAmount: { type: Number },
        type: { type: String, enum: ['income', 'expense'], required: true },
        category: { type: String, required: true },
        // subcategory: { type: String },
        timestamp: { type: Date, required: true },
        note: { type: String },
        currency: { type: String },
        originalCurrency: { type: String },
        tags: { type: [String], default: [] },
        location: { type: String },
        emoji: { type: String },
    },
    { timestamps: true }
);

// Prevent model recompilation error
export const TransactionModel = models.Transaction || model<ITransaction>('Transaction', TransactionSchema);

/**
 * Editable transaction type for frontend use
 */
export type EditableTransaction = Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>; 