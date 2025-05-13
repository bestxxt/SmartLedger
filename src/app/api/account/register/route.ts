import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { UserModel, IUserTag } from '@/models/user'; // Import UserModel
import { connectMongoose } from '@/lib/db'; // Import connectMongoose
import { sub_expense_categories } from '@/lib/constants';
import { Schema } from 'mongoose';

// 定义初始标签及其颜色
const initialTags: Omit<IUserTag, '_id'>[] = [
    // 餐饮相关
    { name: 'Breakfast', color: '#E63946', description: '早餐支出' },
    { name: 'Lunch', color: '#D62828', description: '午餐支出' },
    { name: 'Dinner', color: '#C1121F', description: '晚餐支出' },
    { name: 'Snacks', color: '#780000', description: '零食饮料' },
    { name: 'Groceries', color: '#9D0208', description: '生鲜食品' },
    
    // 交通相关
    { name: 'Taxi', color: '#1A535C', description: '打车费用' },
    { name: 'Public', color: '#2A9D8F', description: '公共交通' },
    { name: 'Parking', color: '#006D77', description: '停车费用' },
    { name: 'Fuel', color: '#073B4C', description: '加油费用' },
    
    // 购物相关
    { name: 'Clothing', color: '#7209B7', description: '服饰鞋包' },
    { name: 'Electronics', color: '#3A0CA3', description: '数码电器' },
    { name: 'Beauty', color: '#4CC9F0', description: '个护美妆' },
    { name: 'Gifts', color: '#4361EE', description: '礼物礼品' },
    
    // 生活服务
    { name: 'Rent', color: '#2B2D42', description: '房租水电' },
    { name: 'Medical', color: '#8D0801', description: '医疗保健' },
    { name: 'Education', color: '#003049', description: '教育培训' },
    { name: 'Entertainment', color: '#D90429', description: '休闲娱乐' },
    
    // 其他
    { name: 'Travel', color: '#1B4332', description: '旅游度假' },
    { name: 'Social', color: '#2D6A4F', description: '人情往来' },
    { name: 'Pet', color: '#40916C', description: '宠物相关' },
    { name: 'Other', color: '#495057', description: '其他支出' }
];

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
            tags: initialTags,
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