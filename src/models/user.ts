import { Schema, model, Document, models } from 'mongoose';

export type Language = 'en' | 'zh';

/**
 * Base tag interface for both locations and tags
 */
export interface IUserTag {
  _id: Schema.Types.ObjectId; // Changed from id: string. Mongoose will provide _id.
  name: string;
  color?: string;
  description?: string;
}

/**
 * Frontend data type for User
 */

export type Location = {
  id: string; // This will be the string representation of _id from the backend
  name: string;
  color?: string;
  description?: string;
};

export type Tag = {
  id: string; // This will be the string representation of _id from the backend
  name: string;
  color?: string;
  description?: string; // Added
};

/**
 * User data type for backend use
 */
export type User = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  avatar: string;
  language: Language;
  currency: string;
  locations: Location[];
  tags: Tag[];
  stats: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    totalTransactions: number;
    monthlyBalances?: { month: string; balance: number }[];
  };
  createdAt: string;
  updatedAt: string;
};

/**
 * Mongoose Document interface for User
 */
export interface IUser extends Document {
  email: string;
  name: string;
  role: 'admin' | 'user';
  password: string; // Added for password storage
  avatar: string;
  language: Language;
  currency: string;
  locations: IUserTag[]; // IUserTag definition updated
  tags: IUserTag[]; // IUserTag definition updated
  stats: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    totalTransactions: number;
    monthlyBalances?: { month: string; balance: number }[];
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Reusable schema for tags and locations
 */
const TagSchema = new Schema<IUserTag>(
  {
    name: { type: String, required: true },
    color: String,
    description: String, // Field was already present, optional
  },
);

/**
 * Mongoose schema definition for User
 */
const UserSchema = new Schema<IUser>(
  {
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true }, // Added for password storage
    name: { type: String, required: true },
    avatar: { type: String, default: '' },
    language: { type: String, enum: ['en', 'zh'], default: 'en' },
    currency: { type: String, default: 'USD' },
    locations: { type: [TagSchema], default: [] },
    tags: { type: [TagSchema], default: [] },
    stats: {
      totalIncome: { type: Number, default: 0 },
      totalExpense: { type: Number, default: 0 },
      balance: { type: Number, default: 0 },
      totalTransactions: { type: Number, default: 0 },
      monthlyBalances: {
        type: [
          {
            month: { type: String, required: true },
            balance: { type: Number, required: true }
          }
        ],
        default: []
      }
    },
  },
  { timestamps: true }
);

/**
 * Mongoose model for User
 */
export const UserModel = models.User || model<IUser>('User', UserSchema);

/**
 * Editable user type for frontend use
 */
export type EditableUser = Omit<User, 'id' | 'role' | 'createdAt' | 'updatedAt'>;
