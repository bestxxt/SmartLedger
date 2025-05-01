import { getUserFromCookie } from '@/lib/auth';
import { getTransactionCollection } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

// GET /api/app/transactions/stats
export async function GET(req: Request) {
  try {
    const user = await getUserFromCookie(req);
    const userId = new ObjectId(user.userId as string);
    const transactions = await getTransactionCollection();

    // aggregate income sum
    const incomeAgg = await transactions.aggregate([
      { $match: { userId, type: 'income' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).toArray();
    // aggregate expense sum
    const expenseAgg = await transactions.aggregate([
      { $match: { userId, type: 'expense' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).toArray();

    // count total records for this user
    const totalCount = await transactions.countDocuments({ userId });

    const totalIncome = incomeAgg[0]?.total || 0;
    const totalExpense = expenseAgg[0]?.total || 0;
    const balance = totalIncome - totalExpense;

    return NextResponse.json({
      message: 'ok',
      data: { totalIncome, totalExpense, balance, totalCount }
    });
  } catch (error) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
}
