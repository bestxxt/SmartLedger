import { parse } from 'cookie';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function getUserFromCookie(req: Request) {
    const cookieHeader = req.headers.get('Cookie');
    if (!cookieHeader) {
        throw new Error('未提供 Cookie');
    }

    const cookies = parse(cookieHeader);
    const token = cookies.access_token;
    if (!token) {
        throw new Error('未提供身份验证令牌');
    }

    const { payload } = await jwtVerify(token, secret);
    return payload; // 返回包含 userId 和 role 的信息
}