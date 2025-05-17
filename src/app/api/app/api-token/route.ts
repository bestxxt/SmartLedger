import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/utils/authOptions";
import { UserModel } from "@/models/user";
import { connectMongoose } from "@/lib/db";
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongoose();

    // Generate a new API token
    const apiToken = crypto.randomBytes(32).toString('hex');

    // Update user with new token
    await UserModel.findByIdAndUpdate(session.user.id, {
      apiToken
    });

    return NextResponse.json({ 
      message: 'API token generated successfully',
      apiToken 
    });
  } catch (error) {
    console.error('API token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate API token' },
      { status: 500 }
    );
  }
}

// export async function GET(req: Request) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.id) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     await connectMongoose();

//     const user = await UserModel.findById(session.user.id).select('apiToken');
//     if (!user) {
//       return NextResponse.json({ error: 'User not found' }, { status: 404 });
//     }

//     return NextResponse.json({ 
//       apiToken: user.apiToken || null
//     });
//   } catch (error) {
//     console.error('API token fetch error:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch API token' },
//       { status: 500 }
//     );
//   }
// } 