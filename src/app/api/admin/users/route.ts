import { getUserFromCookie } from '@/lib/auth';
import { getUserCollection } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    // 验证管理员身份
    const user = await getUserFromCookie(req);
    if (user.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // 查询所有用户
    const users = await getUserCollection();
    const cursor = users.find({}).project({ password: 0 });

    const list = await cursor.toArray();

    // 格式化输出
    const safeList = list.map(u => ({
      id: u._id.toString(),
      username: u.username,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
    }));

    return NextResponse.json({ message: 'ok', users: safeList });
  } catch (error) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
}