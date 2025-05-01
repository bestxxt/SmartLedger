import { Schema, model, Document, Types } from 'mongoose';

/**
 * Mongoose Document interface for Transaction
 */
export interface ITransaction extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    subcategory?: string;
    timestamp: Date;
    note?: string;
    currency?: string;
    tags?: string[];
    location?: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Mongoose schema definition for Transaction
 */
const TransactionSchema = new Schema<ITransaction>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        amount: { type: Number, required: true },
        type: { type: String, enum: ['income', 'expense'], required: true },
        category: { type: String, required: true },
        subcategory: { type: String },
        timestamp: { type: Date, required: true },
        note: { type: String },
        currency: { type: String },
        tags: { type: [String], default: [] },
        location: { type: String },
    },
    { timestamps: true }
);

/**
 * Mongoose model for Transaction
 */
export const TransactionModel = model<ITransaction>('Transaction', TransactionSchema);

/**
 * Frontend data type for Transaction
 */
export type Transaction = {
    id: string;
    userId?: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    subcategory?: string;
    timestamp: Date;
    note?: string;
    currency?: string;
    tags?: string[];
    location?: string;
    createdAt?: Date;
    updatedAt?: Date;
};
