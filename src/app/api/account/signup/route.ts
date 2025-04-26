import { getUserCollection } from "@/lib/db";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    // 确保 Content-Type 为 application/json
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        return NextResponse.json({ message: '请求必须为 JSON 格式' }, { status: 415 }); // Unsupported Media Type
    }

    const { username, email, password, role = 'user', adminKey } = await req.json();

    if (!username || !email || !password) {
        return NextResponse.json({ message: '缺少必要字段' }, { status: 400 });
    }

    if (role === 'admin') {
        if (adminKey !== process.env.ADMIN_KEY) {
            return NextResponse.json({ message: '无效的管理员密钥' }, { status: 403 });
        }
    }

    const users = await getUserCollection();
    const existingUser = await users.findOne({ email });

    if (existingUser) {
        return NextResponse.json({ message: '用户已存在' }, { status: 409 });
    }

    const hashedPassword = await hash(password, 10); // bcrypt's hash function
    const result = await users.insertOne({ username, email, password: hashedPassword, role, createdAt: new Date() });

    return NextResponse.json({ message: '注册成功', userId: result.insertedId });
}