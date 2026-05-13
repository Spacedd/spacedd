const { getDb } = require('./_lib/mongo');

const jsonResponse = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON body' });
  }

  const { email, name } = payload;
  if (typeof email !== 'string' || !email.includes('@')) {
    return jsonResponse(400, { error: 'A valid email is required' });
  }

  try {
    const db = await getDb();
    const users = db.collection('users');

    const result = await users.updateOne(
      { email },
      {
        $set: { name: typeof name === 'string' ? name : null, updatedAt: new Date() },
        $setOnInsert: { email, createdAt: new Date() },
      },
      { upsert: true }
    );

    return jsonResponse(200, {
      ok: true,
      created: result.upsertedCount === 1,
      userId: result.upsertedId ?? null,
    });
  } catch (err) {
    console.error('save-user error:', err);
    return jsonResponse(500, { error: 'Internal server error' });
  }
};
