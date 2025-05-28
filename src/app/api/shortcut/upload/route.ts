import { NextResponse } from 'next/server';
import { UserModel } from "@/models/user";
import { connectMongoose } from "@/lib/db";
import { TransactionModel, Transaction } from "@/models/transaction";
import { AIService } from '@/lib/services/ai/pictureToBill';
import { exchangeRateService } from '@/lib/services/exchangeRate';
import { randomUUID } from 'crypto';

// In-memory cache for pending transactions
const pendingTransactions: Record<string, { expires: number, data: any, userId: string }> = {};
const PENDING_TTL = 60 * 1000; // 1 minute

// Helper function to validate API token
async function validateToken(token: string) {
  await connectMongoose();
  const user = await UserModel.findOne({ apiToken: token });
  return user;
}

// Helper function to format transaction as text
function formatTransactionAsText(transaction: any): string {
  const { amount, type, category, note, currency, location, emoji, tags } = transaction;
  const typeText = type === 'income' ? 'Income' : 'Expense';
  const locationText = location ? `Location: ${location}` : 'No location';
  const tagsText = tags ? `Tags: ${tags.join(', ')}` : 'No tags';
  return `${emoji} ${typeText}: ${amount} ${currency}
🗂️ Category: ${category}
🏷️ ${tagsText}
📍 ${locationText}
📝 Note: ${note}`;
}

export async function POST(req: Request) {
  try {
    const token = req.headers.get('x-api-token');
    if (!token) {
      return new Response('API token required', { status: 401 });
    }
    const user = await validateToken(token);
    if (!user) {
      return new Response('Invalid API token', { status: 401 });
    }
    const formData = await req.formData();
    const image = formData.get('image') as File;
    if (!image) {
      return new Response('No image provided', { status: 400 });
    }
    const buffer = await image.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString('base64');
    const aiService = new AIService();
    const context = {
      timezone: 'UTC',
      userCurrency: user.currency,
      userLanguage: user.language,
      userTags: user.tags,
      userLocations: user.locations
    };
    const recognizedTransaction = await aiService.recognizeBill(base64Image, image.type, context);
    if (!recognizedTransaction) {
      return new Response('No transaction information found in the image', { status: 400 });
    }
    // Prepare for preview (do not save yet)
    const userDefaultCurrency = user.currency || 'USD';
    const transactionCurrency = recognizedTransaction.currency || userDefaultCurrency;
    let convertedAmount = recognizedTransaction.amount;
    let originalAmount = recognizedTransaction.amount;
    let originalCurrency = transactionCurrency;
    if (transactionCurrency !== userDefaultCurrency) {
      try {
        convertedAmount = await exchangeRateService.convertCurrency(
          recognizedTransaction.amount,
          transactionCurrency,
          userDefaultCurrency
        );
      } catch (error) {
        console.error('Error converting currency:', error);
        return new Response('Failed to convert currency', { status: 500 });
      }
    }
    // Prepare transaction object for cache
    const pending = {
      userId: user._id.toString(),
      expires: Date.now() + PENDING_TTL,
      data: {
        userId: user._id,
        amount: convertedAmount,
        originalAmount: originalAmount,
        type: recognizedTransaction.type,
        category: recognizedTransaction.category,
        timestamp: new Date(recognizedTransaction.timestamp),
        note: recognizedTransaction.note,
        currency: userDefaultCurrency,
        originalCurrency: originalCurrency,
        tags: recognizedTransaction.tags,
        location: recognizedTransaction.location,
        emoji: recognizedTransaction.emoji,
      }
    };
    // Generate unique id
    const id = randomUUID();
    pendingTransactions[id] = pending;
    // Clean up expired
    for (const [k, v] of Object.entries(pendingTransactions)) {
      if (v.expires < Date.now()) delete pendingTransactions[k];
    }
    // Format preview text
    const textResponse = formatTransactionAsText({
      ...pending.data,
      currency: originalCurrency,
      amount: originalAmount,
    });
    return NextResponse.json({ id, result: textResponse });
  } catch (error) {
    console.error('Shortcut upload error:', error);
    return new Response('Failed to process image', { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const id = req.headers.get('id');
    if (!id) {
      return new Response('Missing transaction id in headers', { status: 400 });
    }
    const pending = pendingTransactions[id];
    if (!pending) {
      return new Response('No pending transaction found or expired', { status: 404 });
    }
    if (pending.expires < Date.now()) {
      delete pendingTransactions[id];
      return new Response('Pending transaction expired', { status: 410 });
    }
    // Actually save the transaction
    const transaction = new TransactionModel(pending.data);
    const savedTransaction = await transaction.save();
    delete pendingTransactions[id];
    return new Response('🥳 Success!');
  } catch (error) {
    console.error('Shortcut upload GET error:', error);
    return new Response('Failed to save transaction', { status: 500 });
  }
}
