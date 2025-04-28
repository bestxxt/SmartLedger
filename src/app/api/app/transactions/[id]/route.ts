import { getUserFromCookie } from '@/lib/auth';
import { getTransactionCollection } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

// GET /api/app/transactions/:id
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUserFromCookie(req);
    let txId: ObjectId;
    try {
      txId = new ObjectId(id);
    } catch {
      return NextResponse.json({ message: 'Invalid transaction ID' }, { status: 400 });
    }
    const transactions = await getTransactionCollection();
    const record = await transactions.findOne({ _id: txId, userId: new ObjectId(user.userId as string) });
    if (!record) {
      return NextResponse.json({ message: 'Transaction not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'ok', transaction: record });
  } catch {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
}

// PATCH /api/app/transactions/:id
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUserFromCookie(req);
    let txId: ObjectId;
    try {
      txId = new ObjectId(id);
    } catch {
      return NextResponse.json({ message: 'Invalid transaction ID' }, { status: 400 });
    }
    const updates = await req.json();
    if (!updates || typeof updates !== 'object') {
      return NextResponse.json({ message: 'No update data provided' }, { status: 400 });
    }
    const transactions = await getTransactionCollection();
    const result = await transactions.findOneAndUpdate(
      { _id: txId, userId: new ObjectId(user.userId as string) },
      { $set: updates },
      { returnDocument: 'after' }
    );
    if (!result) {
      return NextResponse.json({ message: 'Transaction not found or update failed' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Transaction updated', transaction: result });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json({ message: 'Failed to update transaction' }, { status: 500 });
  }
}

// DELETE /api/app/transactions/:id
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUserFromCookie(req);
    let txId: ObjectId;
    try {
      txId = new ObjectId(id);
    } catch {
      return NextResponse.json({ message: 'Invalid transaction ID' }, { status: 400 });
    }
    const transactions = await getTransactionCollection();
    const result = await transactions.deleteOne({ _id: txId, userId: new ObjectId(user.userId as string) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Transaction not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Transaction deleted' });
  } catch {
    return NextResponse.json({ message: 'Failed to delete transaction' }, { status: 500 });
  }
}