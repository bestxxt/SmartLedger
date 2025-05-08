import { Schema, model, Document } from 'mongoose';

/**
 * User tag interface
 */
export interface IUserTag {
  id: string;
  name: string;
  color?: string;
  description?: string;
  createdAt: Date;
}

/**
 * User settings interface
 */
export interface IUserSettings {
  avatar: string;
  language: 'en' | 'zh' | 'ja' | 'ko' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru';
  currency: string;
  locations: IUserTag[];
  tags: IUserTag[];
}

/**
 * Mongoose Document interface for User
 */
export interface IUser extends Document {
  email: string;
  name: string;
  role: 'admin' | 'user';
  settings: IUserSettings;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Reusable schema for tags and locations
 */
const TagSchema = new Schema<IUserTag>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    color: String,
    description: String,
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

/**
 * Schema for user settings
 */
const SettingsSchema = new Schema<IUserSettings>(
  {
    avatar: { type: String, default: '' },
    language: { type: String, enum: ['en', 'zh', 'ja', 'ko', 'es', 'fr', 'de', 'it', 'pt', 'ru'], default: 'en' },
    currency: { type: String, default: 'USD' },
    locations: { type: [TagSchema], default: [] },
    tags: { type: [TagSchema], default: [] },
  },
  { _id: false }
);

/**
 * Mongoose schema definition for User
 */
const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    settings: { type: SettingsSchema, default: () => ({}) },
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
export type Language = 'en' | 'zh' | 'ja' | 'ko' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru';

export type User = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  settings: {
    avatar: string;
    language: Language;
    currency: string;
    locations: Location[];
    tags: Tag[];
  };
  createdAt: string;
  updatedAt: string;
};

/**
 * Editable user type for frontend use
 */
export type EditableUser = Omit<User, 'id' | 'role' | 'createdAt' | 'updatedAt'>;

/**
 * DeepPartial utility for nested updates
 */
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

/**
 * Type for user profile update (nested partial)
 */
export type UserProfileUpdate = DeepPartial<
  Omit<User, 'id' | 'role' | 'createdAt' | 'updatedAt'>
>;

/**
 * Type for individual tag updates
 */
export type UserTagUpdate = {
  name: string;
  color?: string;
  description?: string;
};

/**
 * Type for user settings update
 */
export type UserSettingsUpdate = DeepPartial<IUserSettings>;

export type Location = {
  id: string;
  name: string;
  color?: string;
  description?: string;
  createdAt: string;
};

export type Tag = {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
};

