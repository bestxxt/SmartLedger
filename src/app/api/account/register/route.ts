import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { UserModel, IUserTag } from '@/models/user'; // Import UserModel
import { connectMongoose } from '@/lib/db'; // Import connectMongoose

export async function POST(request: NextRequest) {
    try {
        await connectMongoose(); // Ensure Mongoose is connected

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

        // 只检查邮箱是否已存在
        const existingUser = await UserModel.findOne({ email }); // Use UserModel
        if (existingUser) {
            return NextResponse.json(
                { message: 'Email already registered' },
                { status: 400 }
            );
        }

        // 加密密码
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 创建新用户 - Mongoose 会自动处理 _id, createdAt, updatedAt
        const newUserDoc = new UserModel({
            email,
            name,
            password: hashedPassword, // Store the hashed password
            role: 'user', // Schema has a default, but can be explicit
            avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${(name)}`, // URL encode name
            language: 'en', // Schema has a default
            currency: 'USD', // Schema has a default
            locations: [], // Schema has a default
            tags: [], // Schema has a default
            // No need to manually set _id, createdAt, or updatedAt here
        });

        const savedUser = await newUserDoc.save();

        return NextResponse.json(
            { 
                message: 'Registration successful',
                user: {
                    id: String(savedUser._id), // Use _id from savedUser
                    email: savedUser.email,
                    name: savedUser.name,
                    role: savedUser.role,
                    avatar: savedUser.avatar,
                    language: savedUser.language,
                    currency: savedUser.currency,
                    // locations and tags will be empty arrays by default as per schema
                    // If they had content, we'd map them similarly to ensure correct format
                    locations: savedUser.locations.map((loc: IUserTag) => ({
                        id: loc._id.toString(),
                        name: loc.name,
                        color: loc.color,
                        description: loc.description,
                    })),
                    tags: savedUser.tags.map((tag: IUserTag) => ({
                        id: tag._id.toString(),
                        name: tag.name,
                        color: tag.color,
                        description: tag.description,
                    })),
                    createdAt: savedUser.createdAt.toISOString(), // Use createdAt from savedUser
                    updatedAt: savedUser.updatedAt.toISOString()  // Use updatedAt from savedUser
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