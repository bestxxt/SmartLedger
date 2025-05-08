import { NextRequest, NextResponse } from 'next/server';
import { getUserCollection } from '@/lib/db';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import { IUserSettings } from '@/types/user';

export async function POST(request: NextRequest) {
    try {
        const { email, password, name, inviteCode, avatar } = await request.json();

        // 验证必填字段
        if (!email || !password || !name || !inviteCode) {
            return NextResponse.json(
                { message: 'All fields are required' },
                { status: 400 }
            );
        }

        // 验证邀请码
        if (inviteCode !== process.env.INVITE_CODE) {
            return NextResponse.json(
                { message: 'Invalid invite code' },
                { status: 400 }
            );
        }

        const users = await getUserCollection();

        // 只检查邮箱是否已存在
        const existingUser = await users.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { message: 'Email already registered' },
                { status: 400 }
            );
        }

        // 加密密码
        const hashedPassword = await bcrypt.hash(password, 10);

        // 创建默认用户设置
        const defaultSettings: IUserSettings = {
            avatar: avatar || '',
            language: 'en',
            currency: 'USD',
            locations: [],
            tags: []
        };

        // 创建新用户
        const result = await users.insertOne({
            _id: new ObjectId(),
            email,
            name,
            password: hashedPassword,
            role: 'user',
            settings: defaultSettings,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        return NextResponse.json(
            { 
                message: 'Registration successful',
                user: {
                    id: result.insertedId.toString(),
                    email,
                    name,
                    role: 'user',
                    settings: defaultSettings,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
} 