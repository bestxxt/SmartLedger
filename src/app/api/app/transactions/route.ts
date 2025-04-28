import { getUserFromCookie } from '@/lib/auth';
import { getTransactionCollection } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

// GET /api/app/transactions
export async function GET(req: Request) {
  try {
    // 验证用户身份
    const user = await getUserFromCookie(req);

    // 解析分页和搜索参数
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const search = url.searchParams.get('search');

    // 构建查询条件
    const filter: any = { userId: new ObjectId(user.userId as string) };
    if (search) {
      filter.description = { $regex: search, $options: 'i' };
    }
    // 支持更多筛选参数
    url.searchParams.forEach((value, key) => {
      if (!['page', 'limit', 'search'].includes(key)) {
        filter[key] = value;
      }
    });

    const transactions = await getTransactionCollection();
    const total = await transactions.countDocuments(filter);
    const items = await transactions
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      message: 'ok',
      data: items,
      pagination: { total, page, limit }
    });
  } catch (error) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
}

// POST /api/app/transactions
export async function POST(req: Request) {
  try {
    const user = await getUserFromCookie(req);
    const body = await req.json();
    // TODO: validate required fields e.g. amount, type, date
    const doc: any = {
      userId: new ObjectId(user.userId as string),
      ...body,
      createdAt: new Date()
    };
    const transactions = await getTransactionCollection();
    const result = await transactions.insertOne(doc);
    const record = await transactions.findOne({ _id: result.insertedId });
    return NextResponse.json({ message: 'Transaction created', transaction: record });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ message: 'Failed to create transaction' }, { status: 400 });
  }
}