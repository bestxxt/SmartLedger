import { getUserCollection } from "@/lib/db";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    // 确保 Content-Type 为 application/json
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        return NextResponse.json({ message: 'Request must be in JSON format' }, { status: 415 }); // Unsupported Media Type
    }

    const { username, email, password, role = 'user', adminKey } = await req.json();

    if (!username || !email || !password) {
        return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    if (role === 'admin') {
        if (adminKey !== process.env.ADMIN_KEY) {
            return NextResponse.json({ message: 'Invalid admin key' }, { status: 403 });
        }
    }

    const users = await getUserCollection();
    const existingUser = await users.findOne({ email });

    if (existingUser) {
        return NextResponse.json({ message: 'User already exists' }, { status: 409 });
    }

    const hashedPassword = await hash(password, 10); // bcrypt's hash function
    const result = await users.insertOne({ username, email, password: hashedPassword, role, createdAt: new Date() });

    return NextResponse.json({ message: 'ok', userId: result.insertedId });
}