import { getUserFromCookie } from '@/lib/auth';
import { getUserCollection } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { User } from '@/types/user';

export async function GET(req: Request) {
    try {
        const user = await getUserFromCookie(req);
        const users = await getUserCollection();
        const found = await users.findOne({ _id: new ObjectId(user.userId as string) });
        if (!found) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const safeUser = {
            id: found._id.toString(),
            username: found.username,
            email: found.email,
            role: found.role,
            settings: found.settings,
            customCategories: found.customCategories,
            createdAt: found.createdAt,
            updatedAt: found.updatedAt,
        };

        return NextResponse.json({ message: 'ok', user: safeUser });
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
}

export async function PATCH(req: Request) {
    try {
        const user = await getUserFromCookie(req);
        const { username, settings } = await req.json();
        const users = await getUserCollection();

        // Filter out fields that cannot be updated
        const updateData: Partial<User> = {};
        if (username) updateData.username = username;
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
            { _id: new ObjectId(user.userId as string) },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        if (!result) throw new Error('User not found or update failed');
        const updatedUser = result;

        // Filter out sensitive fields
        const { password, ...safeUser } = updatedUser;
        return NextResponse.json({ message: 'User updated successfully', user: safeUser });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ message: 'Failed to update user' }, { status: 400 });
    }
}

export async function DELETE(req: Request) {
    try {
        const user = await getUserFromCookie(req);
        const users = await getUserCollection();
        const result = await users.deleteOne({ _id: new ObjectId(user.userId as string) });
        if (result.deletedCount === 0) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'ok' });
    } catch {
        return NextResponse.json({ message: 'Failed to delete user' }, { status: 400 });
    }
}

