import { getUserCollection } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getUserFromCookie } from '@/lib/auth';

export async function DELETE(req: Request) {
    // 确保 Content-Type 为 application/json
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        return NextResponse.json({ message: 'Request must be in JSON format' }, { status: 415 }); // Unsupported Media Type
    }

    // 验证用户身份
    let user;
    try {
        user = await getUserFromCookie(req);
        // console.log('role:', user);
    } catch (error) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // 检查用户是否为管理员
    if (user.role !== 'admin') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // 确保请求体中包含 email
    const { email } = await req.json();
    if (!email) {
        return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const users = await getUserCollection();
    const result = await users.deleteOne({ email });

    if (result.deletedCount === 0) {
        return NextResponse.json({ message: 'User does not exist or deletion failed' }, { status: 404 });
    }

    return NextResponse.json({ message: 'ok' });
}