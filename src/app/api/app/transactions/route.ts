import { getServerSession } from "next-auth/next";
import { authOptions } from '@/app/utils/authOptions';
import { connectMongoose } from '@/lib/db';
import { NextResponse } from 'next/server';
import { TransactionModel, ITransaction, Transaction } from '@/models/transaction';

type Pagination = {
  total: number;
  page: number;
  limit: number;
};

// GET /api/app/transactions
export async function GET(req: Request): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const search = url.searchParams.get('search') || '';

    const filter: any = { userId: session.user.id };
    
    if (search) {
      filter.category = { $regex: search, $options: 'i' };
    }
    url.searchParams.forEach((value, key) => {
      if (!['page', 'limit', 'search'].includes(key)) {
        filter[key] = value;
      }
    });

    await connectMongoose();
    const total = await TransactionModel.countDocuments(filter);
    
    const docs = await TransactionModel
      .find(filter)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const data: Transaction[] = docs.map(doc => ({
      id: String(doc._id),
      amount: doc.amount,
      type: doc.type,
      category: doc.category,
      subcategory: doc.subcategory,
      timestamp: doc.timestamp,
      note: doc.note,
      currency: doc.currency,
      tags: doc.tags,
      emoji: doc.emoji,
      location: doc.location,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    }));

    const pagination: Pagination = { total, page, limit };
    const isEnd = page * limit >= total;
    
    return NextResponse.json({ message: 'ok', data, pagination, isEnd });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/app/transactions
export async function POST(req: Request): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const { amount, type, category, timestamp } = body;
    if (amount == null || !type || !category || !timestamp) {
      return NextResponse.json(
        { message: 'Missing required fields: amount, type, category or timestamp' },
        { status: 400 }
      );
    }

    await connectMongoose();
    const transaction = new TransactionModel({
      userId: session.user.id,
      amount,
      type,
      category,
      subcategory: body.subcategory,
      timestamp: new Date(timestamp),
      note: body.note,
      currency: body.currency,
      tags: body.tags,
      location: body.location,
      emoji: body.emoji,
    });

    const savedTransaction = await transaction.save();

    const transactionDTO: Transaction = {
      id: String(savedTransaction._id),
      amount: savedTransaction.amount,
      type: savedTransaction.type,
      category: savedTransaction.category,
      subcategory: savedTransaction.subcategory,
      timestamp: savedTransaction.timestamp,
      note: savedTransaction.note,
      currency: savedTransaction.currency,
      emoji: savedTransaction.emoji,
      tags: savedTransaction.tags,
      location: savedTransaction.location,
      createdAt: savedTransaction.createdAt.toISOString(),
      updatedAt: savedTransaction.updatedAt.toISOString(),
    };

    return NextResponse.json({ message: 'Transaction created', transaction: transactionDTO });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}