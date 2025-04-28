import { getUserFromCookie } from '@/lib/auth';
import { getUserCollection } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

export async function GET(
    req: Request,
    params: { params: Promise<{ id: string }> }
) {
    try {
        // 验证管理员身份
        const admin = await getUserFromCookie(req);
        if (admin.role !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        // 验证并转换 ID
        let userId: ObjectId;
        const { id } = await params.params;
        try {
            userId = new ObjectId(id);
        } catch {
            return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
        }

        // 查询用户（排除 password）
        const users = await getUserCollection();
        const found = await users.findOne(
            { _id: userId },
            { projection: { password: 0 } }
        );

        if (!found) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // 构造返回对象
        const safeUser = {
            id: found._id.toString(),
            username: found.username,
            email: found.email,
            role: found.role,
            createdAt: found.createdAt
        };

        return NextResponse.json({ message: 'ok', user: safeUser });
    } catch {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
}

export async function DELETE(
    req: Request,
    params: { params: Promise<{ id: string }> }
) {
    try {
        // 验证管理员身份
        const admin = await getUserFromCookie(req);
        if (admin.role !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        // 验证并转换用户ID
        let userId;
        const { id } = await params.params;
        try {
            userId = new ObjectId(id);
        } catch {
            return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
        }

        // 删除用户
        const users = await getUserCollection();
        const result = await users.deleteOne({ _id: userId });
        if (result.deletedCount === 0) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'ok' });
    } catch {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
}

export async function PATCH(
    req: Request,
    params: { params: Promise<{ id: string }> }
) {
    try {
        // 验证管理员身份
        const admin = await getUserFromCookie(req);
        if (admin.role !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        // 验证并转换用户ID
        let userId: ObjectId;
        const { id } = await params.params;
        try {
            userId = new ObjectId(id);
        } catch {
            return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
        }

        // 获取更新数据
        const updates = await req.json();
        if (!updates || typeof updates !== 'object') {
            return NextResponse.json({ message: 'No update data provided' }, { status: 400 });
        }

        // 更新用户信息
        const users = await getUserCollection();
        const result = await users.findOneAndUpdate(
            { _id: userId },
            { $set: updates },
            { returnDocument: 'after' }
        );
        if (!result) {
            return NextResponse.json({ message: 'User not found or update failed' }, { status: 404 });
        }

        // 排除敏感字段
        const { password, ...safeUser } = result;
        return NextResponse.json({ message: 'User updated successfully', user: safeUser });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ message: 'Failed to update user' }, { status: 500 });
    }
}