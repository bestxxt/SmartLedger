import { parse } from 'cookie';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/utils/authOptions";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function getUserFromCookie(req: Request) {
    const cookieHeader = req.headers.get('Cookie');
    if (!cookieHeader) {
        throw new Error('No Cookie provided');
    }

    const cookies = parse(cookieHeader);
    const token = cookies.token;
    if (!token) {
        throw new Error('No authentication token provided');
    }

    const { payload } = await jwtVerify(token, secret);
    return payload; // Return information containing userId and role
}

/**
 * Verify user identity and return user information
 * Used in server-side API route functions to verify user identity
 * @returns User information object containing userId and role, or null if not authenticated
 */
export async function checkAuth() {
    try {
        // Get cookies
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        
        if (!token) {
            return null;
        }
        
        // Verify JWT token
        const { payload } = await jwtVerify(token, secret);
        
        // Return user information
        return {
            userId: payload.userId as string,
            role: payload.role as string,
            // Add other user-related information if needed
        };
    } catch (error) {
        console.error('Authentication error:', error);
        return null;
    }
}

/**
 * Get the user ID of the currently logged-in user
 * This is a helper function for directly obtaining the user ID
 * @returns User ID or null (if not logged in)
 */
export async function getCurrentUserId() {
    const user = await checkAuth();
    return user ? user.userId : null;
}

export async function getCurrentUser() {
    const session = await getServerSession(authOptions);
    return session?.user;
}

export async function requireAuth() {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('Unauthorized');
    }
    return user;
}

