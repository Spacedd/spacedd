const { MongoClient } = require('mongodb');

async function getDb() {
  if (!global._mongoClientPromise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    global._mongoClientPromise = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
    }).connect();
  }

  const clientPromise = global._mongoClientPromise;
  try {
    const client = await clientPromise;
    return client.db(process.env.MONGODB_DB || 'spacedd');
  } catch (error) {
    if (global._mongoClientPromise === clientPromise) {
      global._mongoClientPromise = null;
    }
    throw error;
  }
}

module.exports = { getDb };
