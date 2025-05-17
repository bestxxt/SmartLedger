import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/utils/authOptions";
import { NextResponse } from "next/server";
import { UserModel, IUserTag } from "@/models/user";
import { connectMongoose } from "@/lib/db";
import { User } from "@/models/user";
import { TransactionModel } from "@/models/transaction";
import { ObjectId } from 'mongodb';

// GET /api/app/me
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await connectMongoose();
        const user = await UserModel.findById(session.user.id);

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        const userId = new ObjectId(session.user.id);

        // Get transaction statistics
        const incomeAgg = await TransactionModel.aggregate([
            { $match: { userId: userId, type: 'income' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        // console.log('Income Aggregation:', incomeAgg);
        
        const expenseAgg = await TransactionModel.aggregate([
            { $match: { userId: userId, type: 'expense' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        // console.log('Expense Aggregation:', expenseAgg);

        const totalCount = await TransactionModel.countDocuments({ userId: session.user.id });
        const totalIncome = incomeAgg[0]?.total || 0;
        const totalExpense = expenseAgg[0]?.total || 0;
        const balance = totalIncome - totalExpense;


        const now = new Date();
        const months: string[] = [];
        for (let i = 7; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
        }

        const monthlyAgg = await TransactionModel.aggregate([
            { $match: { userId: userId } },
            {
                $addFields: {
                    yearMonth: {
                        $dateToString: { format: "%Y-%m", date: "$timestamp" }
                    }
                }
            },
            {
                $group: {
                    _id: { yearMonth: "$yearMonth", type: "$type" },
                    total: { $sum: "$amount" }
                }
            }
        ]);
        // 整理成 { '2024-06': { income: 100, expense: 50 } }
        const monthMap: Record<string, { income: number; expense: number }> = {};
        for (const m of months) {
            monthMap[m] = { income: 0, expense: 0 };
        }
        for (const row of monthlyAgg) {
            const ym = row._id.yearMonth;
            if (!monthMap[ym]) continue;
            if (row._id.type === 'income') monthMap[ym].income = row.total;
            if (row._id.type === 'expense') monthMap[ym].expense = row.total;
        }
        // 计算每月余额（累加）
        let runningBalance = 0;
        const monthlyBalances = months.map(m => {
            runningBalance += (monthMap[m].income - monthMap[m].expense);
            return { month: m, balance: runningBalance };
        });

        return NextResponse.json({
            message: 'ok',
            data: {
                id: String(user._id),
                email: user.email,
                name: user.name,
                role: user.role,
                apiToken: user.apiToken,
                avatar: user.avatar,
                language: user.language,
                currency: user.currency,
                locations: user.locations.map((loc: IUserTag) => ({
                    id: loc._id.toString(),
                    name: loc.name,
                    color: loc.color,
                    description: loc.description,
                })),
                tags: user.tags.map((tag: IUserTag) => ({
                    id: tag._id.toString(),
                    name: tag.name,
                    color: tag.color,
                    description: tag.description,
                })),
                stats: {
                    totalIncome,
                    totalExpense,
                    balance,
                    totalCount,
                    monthlyBalances
                },
                createdAt: user.createdAt.toISOString(),
                updatedAt: user.updatedAt.toISOString()
            }
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { name, avatar, language, currency, locations, tags } = await req.json();
        await connectMongoose();

        // Filter out fields that cannot be updated
        const updateData: Partial<User> = {};
        if (name) updateData.name = name;
        if (avatar) updateData.avatar = avatar;
        if (language) updateData.language = language;
        if (currency) updateData.currency = currency;
        if (locations) {
            updateData.locations = locations.map((location: any) => ({
                name: location.name,
                color: location.color,
                description: location.description,
            }));
        }
        if (tags) {
            updateData.tags = tags.map((tag: any) => ({
                name: tag.name,
                color: tag.color,
                description: tag.description,
            }));
        }

        const updatedUser = await UserModel.findByIdAndUpdate(
            session.user.id,
            { $set: updateData },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ 
            message: 'User updated successfully', 
            data: {
                id: String(updatedUser._id),
                email: updatedUser.email,
                name: updatedUser.name,
                role: updatedUser.role,
                avatar: updatedUser.avatar,
                language: updatedUser.language,
                currency: updatedUser.currency,
                locations: updatedUser.locations.map((loc: IUserTag) => ({
                    id: loc._id.toString(),
                    name: loc.name,
                    color: loc.color,
                    description: loc.description,
                })),
                tags: updatedUser.tags.map((tag: IUserTag) => ({
                    id: tag._id.toString(),
                    name: tag.name,
                    color: tag.color,
                    description: tag.description,
                })),
                createdAt: updatedUser.createdAt.toISOString(),
                updatedAt: updatedUser.updatedAt.toISOString()
            }
        });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await connectMongoose();
        const deletedUser = await UserModel.findByIdAndDelete(session.user.id);
        
        if (!deletedUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        
        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

