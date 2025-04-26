import { getUserCollection } from '@/lib/db';
import { compare } from 'bcryptjs';
import { SignJWT } from 'jose';
import { NextResponse } from 'next/server';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

export async function POST(req: Request) {
    // 确保 Content-Type 为 application/json
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        return NextResponse.json({ message: '请求必须为 JSON 格式' }, { status: 415 }); // Unsupported Media Type
    }

    // 确保请求体中包含 email 和 password
    const { email, password } = await req.json();
    if (!email || !password) {
        return NextResponse.json({ message: '缺少邮箱或密码' }, { status: 400 });
    }

    const users = await getUserCollection();
    const user = await users.findOne({ email });
    if (!user) {
        return NextResponse.json({ message: '用户不存在' }, { status: 404 });
    }

    const isValid = await compare(password, user.password);
    if (!isValid) {
        return NextResponse.json({ message: '密码错误' }, { status: 401 });
    }

    const token = await new SignJWT({ userId: user._id.toString(), username: user.username, role: user.role })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .sign(secret);

    // // 直接返回 token
    // return NextResponse.json({ message: '登录成功', access_token: token });

    // 设置 Cookie
    // 设置 token 到 HttpOnly Cookie
    const response = new NextResponse(JSON.stringify({ 
        message: '登录成功', 
        user: {
            id: user._id.toString(),
            email: user.email,
            username: user.username,
            role: user.role,
        }
    }), {
        status: 200,
        headers: {
            'Set-Cookie': `access_token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`,
            'Content-Type': 'application/json',
        },
    });

    return response;
}
