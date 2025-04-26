import { getUserFromCookie } from '@/lib/auth';
import { getUserCollection } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        // 验证用户身份
        const user = await getUserFromCookie(req);
        // 从数据库中查询用户
        const users = await getUserCollection();
        const found = await users.findOne({ _id: new ObjectId(user.userId as string) });
        if (!found) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        // 返回用户信息
        return NextResponse.json({
            message: 'ok', user: {
                id: found._id.toString(),
                username: found.username,
                email: found.email,
                role: found.role,
            }
        });
    } catch (error) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
}

export async function PATCH(req: Request) {
    try {
        // 验证用户身份
        const user = await getUserFromCookie(req);

        // 获取请求体中的更新数据
        const { username } = await req.json();

        // 更新用户信息（内联 updateUser 逻辑）
        const users = await getUserCollection();
        const result = await users.findOneAndUpdate(
            { _id: new ObjectId(user.userId as string) },
            { $set: { username } },
            { returnDocument: 'after' }
        );
        if (!result) throw new Error('User not found or update failed');
        const updatedUser = result;

        // 排除 password 字段
        const { password, createdAt, ...safeUser } = updatedUser;
        return NextResponse.json({ message: 'User updated successfully', user: safeUser });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ message: 'Failed to update user' }, { status: 400 });
    }
}

export async function DELETE(req: Request) {
    try {
        // 验证用户身份
        const user = await getUserFromCookie(req);

        // 注销账户（内联 deleteUser 逻辑）
        const users = await getUserCollection();
        await users.deleteOne({ _id: new ObjectId(user.userId as string) });

        // 返回成功消息
        return NextResponse.json({ message: 'ok' });
    } catch (error) {
        return NextResponse.json({ message: 'Failed to delete user' }, { status: 400 });
    }
}

