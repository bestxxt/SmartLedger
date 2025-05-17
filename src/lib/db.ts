import clientPromise from "./mongodb";
import type { ITransaction } from '@/models/transaction';
import mongoose, { Mongoose } from 'mongoose';
import { URL } from 'url'; // Added: Import URL module for robust URI manipulation


export async function getDB() {
    const client = await clientPromise;
    const dbName = process.env.MONGODB_DB;
    if (!dbName) {
        throw new Error('Please set the MONGODB_DB environment variable');
    }
    // Connect to the database
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

// Mongoose connection logic
const BASE_MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB;

if (!BASE_MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable in .env.local (e.g., mongodb://localhost:27017 or mongodb+srv://user:pass@cluster)');
}

if (!MONGODB_DB_NAME) {
    throw new Error('Please define the MONGODB_DB environment variable in .env.local (this is the name of your database, e.g., smart-ledger)');
}

// Construct the full URI for Mongoose, ensuring the DB name from MONGODB_DB is used.
let MONGODB_URI_FOR_MONGOOSE: string;
try {
    const parsedBaseUri = new URL(BASE_MONGODB_URI);
    // Ensure the pathname starts with a slash and sets the database name.
    // This will replace any existing database name in the MONGODB_URI with MONGODB_DB_NAME.
    parsedBaseUri.pathname = '/' + MONGODB_DB_NAME;
    MONGODB_URI_FOR_MONGOOSE = parsedBaseUri.toString();
} catch (error) {
    console.error("Error parsing MONGODB_URI:", error);
    // Fallback or alternative construction if URL parsing fails for some reason,
    // though process.env.MONGODB_URI should be a valid URI string.
    // This basic concatenation assumes MONGODB_URI does not end with a slash and has no query params.
    // The URL object method is more robust.
    MONGODB_URI_FOR_MONGOOSE = `${BASE_MONGODB_URI.endsWith('/') ? BASE_MONGODB_URI.slice(0, -1) : BASE_MONGODB_URI}/${MONGODB_DB_NAME}`;
    console.warn(`Constructed Mongoose URI with fallback: ${MONGODB_URI_FOR_MONGOOSE}`);
}


interface MongooseCache {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
}

// Extend the global type to include mongoose cache for development hot-reloading
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cachedMongoose: MongooseCache;

if (process.env.NODE_ENV === 'development') {
    if (!global.mongooseCache) {
        global.mongooseCache = { conn: null, promise: null };
    }
    cachedMongoose = global.mongooseCache;
} else {
    cachedMongoose = { conn: null, promise: null };
}

export async function connectMongoose() {
    if (cachedMongoose.conn) {
        // console.log("Using cached Mongoose connection");
        return cachedMongoose.conn;
    }

    if (!cachedMongoose.promise) {
        // console.log(`Creating new Mongoose connection promise to: ${MONGODB_URI_FOR_MONGOOSE}`); // Log the URI
        const opts = {
            bufferCommands: false, // Disable Mongoose's buffering. Fail fast if not connected.
        };
        // Use the correctly constructed URI
        cachedMongoose.promise = mongoose.connect(MONGODB_URI_FOR_MONGOOSE, opts).then((mongooseInstance) => {
            // console.log(`Mongoose connected successfully to database specified in MONGODB_DB: ${mongooseInstance.connection.name}!`);
            return mongooseInstance;
        }).catch(err => {
            // console.error("Mongoose connection error:", err);
            cachedMongoose.promise = null; // Reset promise on error to allow retry
            throw err;
        });
    }

    try {
        // console.log("Awaiting Mongoose connection promise");
        cachedMongoose.conn = await cachedMongoose.promise;
    } catch (e) {
        // If connection fails, nullify the promise to allow retrying the connection.
        cachedMongoose.promise = null;
        throw e;
    }
    
    return cachedMongoose.conn;
}
