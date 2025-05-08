import { getServerSession } from "next-auth/next";
import { authOptions } from '@/app/utils/authOptions';
import { getTransactionCollection } from '@/lib/db';
import { ObjectId, Filter, Collection } from 'mongodb';
import { NextResponse } from 'next/server';
import type { ITransaction, Transaction as TransactionDTO } from '@/types/transaction';

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

    const filter: Filter<ITransaction> = { userId: new ObjectId(session.user.id) as any };
    
    if (search) {
      filter.category = { $regex: search, $options: 'i' } as any;
    }
    url.searchParams.forEach((value, key) => {
      if (!['page', 'limit', 'search'].includes(key)) {
        filter[key] = value;
      }
    });

    const col = (await getTransactionCollection()) as Collection<ITransaction>;
    const total = await col.countDocuments(filter);
    
    const docs = await col
      .find(filter)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    const data: TransactionDTO[] = docs.map(doc => ({
      id: doc._id.toString(),
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
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));

    const pagination: Pagination = { total, page, limit };
    const isEnd = page * limit >= total;
    
    return NextResponse.json({ message: 'ok', data, pagination, isEnd });
  } catch (error) {
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

    const body = (await req.json()) as Partial<TransactionDTO>;

    const { amount, type, category, timestamp } = body;
    if (amount == null || !type || !category || !timestamp) {
      return NextResponse.json(
        { message: 'Missing required fields: amount, type, category or timestamp' },
        { status: 400 }
      );
    }

    const now = new Date();
    const toInsert: Partial<ITransaction> & { userId: ObjectId; createdAt: Date; updatedAt: Date } = {
      userId: new ObjectId(session.user.id),
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
      createdAt: now,
      updatedAt: now,
    };
    
    const col = (await getTransactionCollection()) as Collection<ITransaction>;
    const res = await col.insertOne(toInsert as ITransaction);
    
    const doc = await col.findOne({ _id: res.insertedId });

    if (!doc) {
      return NextResponse.json({ message: 'Insert failed' }, { status: 500 });
    }

    const transaction: TransactionDTO = {
      id: doc._id.toString(),
      amount: doc.amount,
      type: doc.type,
      category: doc.category,
      subcategory: doc.subcategory,
      timestamp: doc.timestamp,
      note: doc.note,
      currency: doc.currency,
      emoji: doc.emoji,
      tags: doc.tags,
      location: doc.location,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };

    return NextResponse.json({ message: 'Transaction created', transaction });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}