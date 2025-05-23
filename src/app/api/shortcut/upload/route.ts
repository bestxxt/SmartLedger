import { NextResponse } from 'next/server';
import { UserModel } from "@/models/user";
import { connectMongoose } from "@/lib/db";
import { TransactionModel, Transaction } from "@/models/transaction";
import { AIService } from '@/lib/services/ai/pictureToBill';
import { exchangeRateService } from '@/lib/services/exchangeRate';

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
  return `${emoji} ${typeText}
💰 Amount: ${amount} ${currency}
🗂️  Category: ${category}
🏷️ ${tagsText}
📍 ${locationText}
📝 Note: ${note}`;
}

export async function POST(req: Request) {
  try {
    // Get API token from header
    const token = req.headers.get('x-api-token');
    if (!token) {
      return new Response('API token required', { status: 401 });
    }

    // Validate token and get user
    const user = await validateToken(token);
    if (!user) {
      return new Response('Invalid API token', { status: 401 });
    }

    // Get image data from request
    const formData = await req.formData();
    const image = formData.get('image') as File;
    if (!image) {
      return new Response('No image provided', { status: 400 });
    }

    // Convert image to base64
    const buffer = await image.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString('base64');

    // Initialize AI service
    const aiService = new AIService();

    // Prepare context for AI
    const context = {
      timezone: 'UTC', // You might want to get this from user preferences
      userCurrency: user.currency,
      userLanguage: user.language,
      userTags: user.tags,
      userLocations: user.locations
    };

    // Recognize bill from image
    const recognizedTransaction = await aiService.recognizeBill(base64Image, image.type, context);
    console.log('Recognized transaction:', recognizedTransaction);
    if (!recognizedTransaction) {
      return new Response('No transaction information found in the image', { status: 400 });
    }

    // Get user's default currency
    const userDefaultCurrency = user.currency || 'USD';
    const transactionCurrency = recognizedTransaction.currency || userDefaultCurrency;

    // If transaction currency is different from user's default currency, convert the amount
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

    // Create new transaction
    const transaction = new TransactionModel({
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
    });

    const savedTransaction = await transaction.save();

    // Format transaction as text for response
    const textResponse = formatTransactionAsText({
      ...savedTransaction.toObject(),
      currency: originalCurrency, // Use original currency for display
      amount: originalAmount, // Use original amount for display
    });

    // Return formatted text response
    return new Response(textResponse, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    });
  } catch (error) {
    console.error('Shortcut upload error:', error);
    return new Response('Failed to process image', { status: 500 });
  }
} 