import { parse } from 'cookie';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function getUserFromCookie(req: Request) {
    const cookieHeader = req.headers.get('Cookie');
    if (!cookieHeader) {
        throw new Error('未提供 Cookie');
    }

    const cookies = parse(cookieHeader);
    const token = cookies.token;
    if (!token) {
        throw new Error('未提供身份验证令牌');
    }

    const { payload } = await jwtVerify(token, secret);
    return payload; // 返回包含 userId 和 role 的信息
}

/**
 * 验证用户身份并返回用户信息
 * 用于服务器端 API 路由函数中验证用户身份
 * @returns 用户信息对象，包含 userId 和 role，如果未认证则返回 null
 */
export async function checkAuth() {
    try {
        // 获取 cookies
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        
        if (!token) {
            return null;
        }
        
        // 验证 JWT token
        const { payload } = await jwtVerify(token, secret);
        
        // 返回用户信息
        return {
            userId: payload.userId as string,
            role: payload.role as string,
            // 可以根据需要添加其他用户相关信息
        };
    } catch (error) {
        console.error('认证错误:', error);
        return null;
    }
}

/**
 * 获取当前登录用户的用户ID
 * 这是一个辅助函数，方便直接获取用户ID
 * @returns 用户ID 或 null（如果未登录）
 */
export async function getCurrentUserId() {
    const user = await checkAuth();
    return user ? user.userId : null;
}

