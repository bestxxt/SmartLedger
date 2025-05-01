import { Schema, model, Document } from 'mongoose';

/**
 * Mongoose Document interface for User
 */
export interface IUser extends Document {
  username: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose schema definition for User
 */
const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    email:    { type: String, required: true, unique: true },
    role:     { type: String, enum: ['admin', 'user'], default: 'user' },
  },
  { timestamps: true }
);

/**
 * Mongoose model for User
 */
export const UserModel = model<IUser>('User', UserSchema);

/**
 * Frontend data type for User
 */
export type User = {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt?: string;
};
