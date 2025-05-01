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
        return NextResponse.json({ message: 'Request must be in JSON format' }, { status: 415 }); // Unsupported Media Type
    }

    // 确保请求体中包含 email 和 password
    const { email, password } = await req.json();
    if (!email || !password) {
        return NextResponse.json({ message: 'Email or password is missing' }, { status: 400 });
    }

    const users = await getUserCollection();
    const user = await users.findOne({ email });
    if (!user) {
        return NextResponse.json({ message: 'User does not exist' }, { status: 404 });
    }

    const isValid = await compare(password, user.password);
    if (!isValid) {
        return NextResponse.json({ message: 'Incorrect password' }, { status: 401 });
    }

    const token = await new SignJWT({ userId: user._id.toString(), username: user.username, role: user.role })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .sign(secret);

    // // 直接返回 token
    // return NextResponse.json({ message: 'Login successful', access_token: token });

    // 设置 Cookie
    // 设置 token 到 HttpOnly Cookie
    const response = new NextResponse(JSON.stringify({ 
        message: 'ok', 
        user: {
            id: user._id.toString(),
            email: user.email,
            username: user.username,
            role: user.role,
        }
    }), {
        status: 200,
        headers: {
            // 'Set-Cookie': `token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`,
            'Set-Cookie': `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800`,
            'Content-Type': 'application/json',
        },
    });

    return response;
}
