import mongoose from 'mongoose';

const TagSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    color: { type: String },
    description: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const UserSettingsSchema = new mongoose.Schema({
    avatar: { type: String, default: '' },
    language: { 
        type: String, 
        enum: ['en', 'zh', 'ja', 'ko', 'es', 'fr', 'de', 'it', 'pt', 'ru'], 
        default: 'en' 
    },
    currency: { type: String, default: 'USD' },
    locations: { type: [TagSchema], default: [] },
    tags: { type: [TagSchema], default: [] }
});

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    settings: { type: UserSettingsSchema, default: () => ({}) },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema); 