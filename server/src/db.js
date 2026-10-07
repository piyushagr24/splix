import mongoose from "mongoose";

// Use global cache for serverless environments to reuse connection across warm lambda invocations
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDb(mongodbUri, options = {}) {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    mongoose.set("strictQuery", true);

    const poolSize = Number(process.env.MONGODB_MAX_POOL_SIZE || 10);
    const connectionOptions = {
      maxPoolSize: poolSize,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      family: 4,
      ...options
    };

    cached.promise = mongoose.connect(mongodbUri, connectionOptions)
      .then((m) => {
        return m.connection;
      })
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    throw error;
  }
}

export async function disconnectDb() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  cached.conn = null;
  cached.promise = null;
}

