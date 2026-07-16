import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { UserModel, IUserTag } from '@/models/user'; // Import UserModel
import { connectMongoose } from '@/lib/db'; // Import connectMongoose

// Define initial tags and their colors
const initialTags: Omit<IUserTag, '_id'>[] = [
    // Food-related
    { name: 'Breakfast', color: '#E63946', description: 'Breakfast expenses' },
    { name: 'Lunch', color: '#D62828', description: 'Lunch expenses' },
    { name: 'Dinner', color: '#C1121F', description: 'Dinner expenses' },
    { name: 'Snacks', color: '#780000', description: 'Snacks and drinks' },
    { name: 'Groceries', color: '#9D0208', description: 'Fresh food' },
    
    // Transportation-related
    { name: 'Taxi', color: '#1A535C', description: 'Taxi expenses' },
    { name: 'Public', color: '#2A9D8F', description: 'Public transportation' },
    { name: 'Parking', color: '#006D77', description: 'Parking fees' },
    { name: 'Fuel', color: '#073B4C', description: 'Fuel expenses' },
    
    // Shopping-related
    { name: 'Clothing', color: '#7209B7', description: 'Clothing and accessories' },
    { name: 'Electronics', color: '#3A0CA3', description: 'Electronics and appliances' },
    { name: 'Beauty', color: '#4CC9F0', description: 'Personal care and beauty' },
    { name: 'Gifts', color: '#4361EE', description: 'Gifts and presents' },
    
    // Life services
    { name: 'Rent', color: '#2B2D42', description: 'Rent and utilities' },
    { name: 'Medical', color: '#8D0801', description: 'Medical and healthcare' },
    { name: 'Education', color: '#003049', description: 'Education and training' },
    { name: 'Entertainment', color: '#D90429', description: 'Leisure and entertainment' },
    
    // Others
    { name: 'Travel', color: '#1B4332', description: 'Travel and vacation' },
    { name: 'Social', color: '#2D6A4F', description: 'Social interactions' },
    { name: 'Pet', color: '#40916C', description: 'Pet-related expenses' },
    { name: 'Other', color: '#495057', description: 'Other expenses' }
];

export async function POST(request: NextRequest) {
    try {
        await connectMongoose(); // Ensure Mongoose is connected

        const { email, password, name, avatar } = await request.json();

        // Validate required fields
        if (!email || !password || !name ) {
            return NextResponse.json(
                { message: 'All fields are required' },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingUser = await UserModel.findOne({ email }); // Use UserModel
        if (existingUser) {
            return NextResponse.json(
                { message: 'Email already registered' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new user - Mongoose will handle _id, createdAt, updatedAt automatically
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