import clientPromise from "./mongodb";
import { ObjectId } from 'mongodb';
import type { ITransaction } from '@/types/transaction';


export async function getDB() {
    const client = await clientPromise;
    const dbName = process.env.MONGODB_DB;
    if (!dbName) {
        throw new Error('请设置 MONGODB_DB 环境变量');
    }
    // 连接到数据库
    const db = client.db(dbName);
    return db;
}

export async function getUserCollection() {
    const db = await getDB();
    return db.collection('users');
}

export async function getTransactionCollection() {
    const db = await getDB();
    return db.collection<ITransaction>('transactions');
}
