const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'spacedd';

// Cache the client promise on the global object so warm function invocations
// reuse the same connection pool instead of opening a new one each call.
if (!global._mongoClientPromise) {
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }
  global._mongoClientPromise = new MongoClient(uri).connect();
}

async function getDb() {
  const client = await global._mongoClientPromise;
  return client.db(dbName);
}

module.exports = { getDb };
