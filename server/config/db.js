import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure server/.env is loaded regardless of execution context
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

let connectionPromise = null;
let retryTimeout = null;
let lastDiagnosticMessage = null;

// Safe error categorization: never outputs credentials or raw connection strings
export const categorizeError = (err) => {
  if (!err) return null;
  const msg = String(err.message || err);

  if (/whitelist|SSL alert|not whitelisted|Could not connect to any servers/i.test(msg)) {
    return 'Could not connect to MongoDB Atlas cluster. Verify your IP address is whitelisted in Atlas Network Access (0.0.0.0/0).';
  }
  if (/auth|bad auth|Authentication failed/i.test(msg)) {
    return 'Authentication failed. Verify the database username and password in MONGODB_URI.';
  }
  if (/ENOTFOUND|getaddrinfo|queryTxt/i.test(msg)) {
    return 'Could not resolve cluster hostname. Verify the cluster address in MONGODB_URI.';
  }
  if (/timeout|timed out/i.test(msg)) {
    return 'Connection timed out. Check network connectivity to MongoDB Atlas.';
  }
  return 'Database connection error occurred. Check Atlas cluster status.';
};

export const getMongoUri = () => {
  const uri = process.env.MONGODB_URI || '';
  return uri.trim().replace(/^["']|["']$/g, '');
};

export const connectDB = () => {
  const uri = getMongoUri();

  if (!uri) {
    lastDiagnosticMessage = 'MONGODB_URI environment variable is missing or empty';
    if (process.env.NODE_ENV !== 'test') {
      console.warn('[DB Warning] MONGODB_URI is not set. Database operations will fail.');
    }
    return Promise.resolve(false);
  }

  // 1. If already connected, return immediately
  if (mongoose.connection.readyState === 1) {
    lastDiagnosticMessage = 'Database connected successfully';
    return Promise.resolve(true);
  }

  // 2. Concurrency Guard: Reuse active in-flight connection promise
  if (connectionPromise) {
    return connectionPromise;
  }

  // 3. Initiate single connection attempt
  connectionPromise = (async () => {
    try {
      const conn = await mongoose.connect(uri, {
        dbName: 'studentDB',
        serverSelectionTimeoutMS: 5000,
      });
      lastDiagnosticMessage = 'Database connected successfully';
      if (process.env.NODE_ENV !== 'test') {
        console.log(`[DB Success] MongoDB Connected: ${conn.connection.host} / database: studentDB`);
      }
      return true;
    } catch (error) {
      lastDiagnosticMessage = categorizeError(error);
      if (process.env.NODE_ENV !== 'test') {
        console.error(`[DB Error] Failed to connect to MongoDB: ${lastDiagnosticMessage}`);
      }

      // Schedule single 10-second retry if not in test environment
      if (process.env.NODE_ENV !== 'test' && !retryTimeout) {
        retryTimeout = setTimeout(() => {
          retryTimeout = null;
          if (mongoose.connection.readyState === 0 && !connectionPromise) {
            connectDB().catch(() => {});
          }
        }, 10000);
      }

      return false;
    } finally {
      connectionPromise = null;
    }
  })();

  return connectionPromise;
};

export const getDBStatus = () => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const stateCode = mongoose.connection.readyState;
  return states[stateCode] || 'unknown';
};

export const getDBDiagnostics = () => {
  const uri = getMongoUri();
  const dbStatus = getDBStatus();
  return {
    database: dbStatus,
    hasMongoUri: Boolean(uri),
    diagnostic: lastDiagnosticMessage || (dbStatus === 'connected' ? 'Database connected successfully' : 'Database not connected'),
    dbName: 'studentDB',
  };
};

export const isRetryActive = () => Boolean(retryTimeout);
