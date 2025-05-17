import { getServerSession } from "next-auth/next";
import { authOptions } from '@/app/utils/authOptions';
import { connectMongoose } from '@/lib/db';
import { NextResponse } from 'next/server';
import { TransactionModel, ITransaction, Transaction } from '@/models/transaction';
import { UserModel } from '@/models/user';
import { exchangeRateService } from '@/lib/services/exchangeRate';

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

    const filter: any = { userId: session.user.id };
    
    // Handle type filter
    const type = url.searchParams.get('type');
    if (type && type !== 'all') {
      filter.type = type;
    }

    // Handle category filter
    const category = url.searchParams.get('category');
    if (category && category !== 'all') {
      filter.category = category;
    }

    // Handle amount range filters
    const minAmount = url.searchParams.get('minAmount');
    const maxAmount = url.searchParams.get('maxAmount');
    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) {
        filter.amount.$gte = parseFloat(minAmount);
      }
      if (maxAmount) {
        filter.amount.$lte = parseFloat(maxAmount);
      }
    }

    // Handle date range filters
    const dateFrom = url.searchParams.get('dateFrom');
    const dateTo = url.searchParams.get('dateTo');
    if (dateFrom || dateTo) {
      filter.timestamp = {};
      if (dateFrom) {
        filter.timestamp.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        // Set to end of the day
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        filter.timestamp.$lte = endDate;
      }
    }

    // Handle location filter
    const location = url.searchParams.get('location');
    if (location && location !== 'all') {
      filter.location = location;
    }

    // Handle tags filter
    const tags = url.searchParams.getAll('tags');
    if (tags.length > 0) {
      filter.tags = { $in: tags };
    }

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
      originalAmount: doc.originalAmount,
      type: doc.type,
      category: doc.category,
      subcategory: doc.subcategory,
      timestamp: doc.timestamp,
      note: doc.note,
      currency: doc.currency,
      originalCurrency: doc.originalCurrency,
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

    const { amount, type, category, timestamp, currency } = body;
    if (amount == null || !type || !category || !timestamp) {
      return NextResponse.json(
        { message: 'Missing required fields: amount, type, category or timestamp' },
        { status: 400 }
      );
    }

    await connectMongoose();
    
    // Get user's default currency
    const user = await UserModel.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const userDefaultCurrency = user.currency || 'USD';
    const transactionCurrency = currency || userDefaultCurrency;

    // If transaction currency is different from user's default currency, convert the amount
    let convertedAmount = amount;
    let originalAmount = amount;
    let originalCurrency = transactionCurrency;

    if (transactionCurrency !== userDefaultCurrency) {
      try {
        convertedAmount = await exchangeRateService.convertCurrency(
          amount,
          transactionCurrency,
          userDefaultCurrency
        );
      } catch (error) {
        console.error('Error converting currency:', error);
        return NextResponse.json(
          { message: 'Failed to convert currency' },
          { status: 500 }
        );
      }
    }

    const transaction = new TransactionModel({
      userId: session.user.id,
      amount: convertedAmount,
      originalAmount: originalAmount,
      type,
      category,
      timestamp: new Date(timestamp),
      note: body.note,
      currency: userDefaultCurrency,
      originalCurrency: originalCurrency,
      tags: body.tags,
      location: body.location,
      emoji: body.emoji,
    });

    const savedTransaction = await transaction.save();

    const transactionDTO: Transaction = {
      id: String(savedTransaction._id),
      amount: savedTransaction.amount,
      originalAmount: savedTransaction.originalAmount,
      type: savedTransaction.type,
      category: savedTransaction.category,
      timestamp: savedTransaction.timestamp,
      note: savedTransaction.note,
      currency: savedTransaction.currency,
      originalCurrency: savedTransaction.originalCurrency,
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