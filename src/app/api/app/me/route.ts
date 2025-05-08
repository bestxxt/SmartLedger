import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/utils/authOptions";
import { getUserCollection } from "@/lib/db";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { User } from '@/types/user';

// GET /api/app/me
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const users = await getUserCollection();
        const user = await users.findOne({ _id: new ObjectId(session.user.id) });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'ok',
            data: {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                avatar: user.avatar,
                settings: user.settings,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            }
        });
    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { name, settings } = await req.json();
        const users = await getUserCollection();

        // Filter out fields that cannot be updated
        const updateData: Partial<User> = {};
        if (name) updateData.name = name;
        if (settings) {
            updateData.settings = {
                ...settings,
                locations: settings.locations?.map((location: any) => ({
                    id: location.id,
                    name: location.name,
                    color: location.color,
                    description: location.description,
                    createdAt: location.createdAt,
                })),
                tags: settings.tags?.map((tag: any) => ({
                    id: tag.id,
                    name: tag.name,
                    color: tag.color,
                    description: tag.description,
                    createdAt: tag.createdAt,
                })),
            };
        }

        const result = await users.findOneAndUpdate(
            { _id: new ObjectId(session.user.id) },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        if (!result) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const updatedUser = result;
        const { password, ...safeUser } = updatedUser;
        
        return NextResponse.json({ 
            message: 'User updated successfully', 
            data: {
                id: safeUser._id.toString(),
                email: safeUser.email,
                name: safeUser.name,
                role: safeUser.role,
                settings: safeUser.settings,
                createdAt: safeUser.createdAt.toISOString(),
                updatedAt: safeUser.updatedAt.toISOString()
            }
        });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const users = await getUserCollection();
        const result = await users.deleteOne({ _id: new ObjectId(session.user.id) });
        
        if (result.deletedCount === 0) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        
        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

