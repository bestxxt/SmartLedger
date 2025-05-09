import { getServerSession } from "next-auth/next";
import { getTransactionCollection } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { ITransaction, Transaction } from '@/types/transaction';
import { authOptions } from '@/app/utils/authOptions';

// GET /api/app/transactions/:id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let txId: ObjectId;
  try {
    txId = new ObjectId(id);
  } catch {
    return NextResponse.json({ message: 'Invalid transaction ID' }, { status: 400 });
  }
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const col = await getTransactionCollection();
    const record = await col.findOne(
      { _id: txId, userId: new ObjectId(session.user.id) }
    ) as ITransaction | null;
    if (!record) {
      return NextResponse.json({ message: 'Transaction not found' }, { status: 404 });
    }
    // 转成前端要用的 DTO
    const dto: Transaction = {
      id: record._id.toString(),
      amount: record.amount,
      type: record.type,
      category: record.category,
      subcategory: record.subcategory,
      timestamp: record.timestamp,
      note: record.note,
      currency: record.currency,
      tags: record.tags,
      location: record.location,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
    return NextResponse.json({ message: 'ok', transaction: dto });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
}

// PATCH /api/app/transactions/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let txId: ObjectId;
  try {
    txId = new ObjectId(id);
  } catch {
    return NextResponse.json({ message: 'Invalid transaction ID' }, { status: 400 });
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json();
    if (!updates || typeof updates !== 'object') {
      return NextResponse.json({ message: 'No update data provided' }, { status: 400 });
    }

    const col = await getTransactionCollection();
    const result = await col.findOneAndUpdate(
      { _id: txId, userId: new ObjectId(session.user.id) },
      { $set: updates },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ message: 'Transaction not found or update failed' }, { status: 404 });
    }
    // console.log('Updated transaction:', result);

    const updated = result as ITransaction;
    const dto: Transaction = {
      id: updated._id.toString(),
      amount: updated.amount,
      type: updated.type,
      category: updated.category,
      subcategory: updated.subcategory,
      timestamp: updated.timestamp,
      note: updated.note,
      currency: updated.currency,
      tags: updated.tags,
      emoji: updated.emoji,
      location: updated.location,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
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
  let txId: ObjectId;
  try {
    txId = new ObjectId(id);
  } catch {
    return NextResponse.json({ message: 'Invalid transaction ID' }, { status: 400 });
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const col = await getTransactionCollection();
    const result = await col.deleteOne({ _id: txId, userId: new ObjectId(session.user.id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Transaction not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Transaction deleted' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json({ message: 'Failed to delete transaction' }, { status: 500 });
  }
}