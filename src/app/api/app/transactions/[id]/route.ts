import { getServerSession } from "next-auth/next";
import { connectMongoose } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { TransactionModel, Transaction } from '@/models/transaction';
import { UserModel } from '@/models/user';
import { exchangeRateService } from '@/lib/services/exchangeRate';
import { authOptions } from '@/app/utils/authOptions';

// GET /api/app/transactions/:id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectMongoose();
    const record = await TransactionModel.findOne({
      _id: id,
      userId: session.user.id
    });

    if (!record) {
      return NextResponse.json({ message: 'Transaction not found' }, { status: 404 });
    }

    const dto: Transaction = {
      id: String(record._id),
      amount: record.amount,
      originalAmount: record.originalAmount,
      type: record.type,
      category: record.category,
      timestamp: record.timestamp,
      note: record.note,
      currency: record.currency,
      originalCurrency: record.originalCurrency,
      tags: record.tags,
      location: record.location,
      emoji: record.emoji,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
    return NextResponse.json({ message: 'ok', transaction: dto });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH /api/app/transactions/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json();
    if (!updates || typeof updates !== 'object') {
      return NextResponse.json({ message: 'No update data provided' }, { status: 400 });
    }

    // Remove id field from updates if present
    const { id: _, ...safeUpdates } = updates;

    await connectMongoose();

    // Get user's default currency
    const user = await UserModel.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const userDefaultCurrency = user.currency || 'USD';
    const transactionCurrency = safeUpdates.currency || userDefaultCurrency;

    // If amount or currency is being updated, handle currency conversion
    if (safeUpdates.amount !== undefined || safeUpdates.currency !== undefined) {
      const currentTransaction = await TransactionModel.findOne({
        _id: id,
        userId: session.user.id
      });

      if (!currentTransaction) {
        return NextResponse.json({ message: 'Transaction not found' }, { status: 404 });
      }

      const amount = safeUpdates.amount ?? currentTransaction.amount;
      const originalAmount = amount;
      let convertedAmount = amount;

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

      safeUpdates.amount = convertedAmount;
      safeUpdates.originalAmount = originalAmount;
      safeUpdates.currency = userDefaultCurrency;
      safeUpdates.originalCurrency = transactionCurrency;
    }

    const updated = await TransactionModel.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { 
        $set: {
          ...safeUpdates,
          timestamp: new Date(safeUpdates.timestamp),
        }
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ message: 'Transaction not found or update failed' }, { status: 404 });
    }

    const dto: Transaction = {
      id: String(updated._id),
      amount: updated.amount,
      originalAmount: updated.originalAmount,
      type: updated.type,
      category: updated.category,
      timestamp: updated.timestamp,
      note: updated.note,
      currency: updated.currency,
      originalCurrency: updated.originalCurrency,
      tags: updated.tags,
      emoji: updated.emoji,
      location: updated.location,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };

    return NextResponse.json({ message: 'Transaction updated', transaction: dto });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json({ message: 'Failed to update transaction' }, { status: 500 });
  }
}

// DELETE /api/app/transactions/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectMongoose();
    const result = await TransactionModel.findOneAndDelete({
      _id: id,
      userId: session.user.id
    });

    if (!result) {
      return NextResponse.json({ message: 'Transaction not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Transaction deleted' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json({ message: 'Failed to delete transaction' }, { status: 500 });
  }
}