const crypto = require('crypto');
const { ObjectId } = require('mongodb');
const { getDb } = require('./_lib/mongo');

const COOKIE_NAME = 'spacedd_session';

const jsonResponse = (statusCode, body, extraHeaders = {}) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', ...extraHeaders },
  body: JSON.stringify(body),
});

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}$${derivedKey.toString('hex')}`;
}

function verifyPassword(password, storedHash) {
  if (typeof storedHash !== 'string' || !storedHash.includes('$')) return false;
  const [salt, storedKeyHex] = storedHash.split('$');
  const storedKey = Buffer.from(storedKeyHex, 'hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return storedKey.length === derivedKey.length && crypto.timingSafeEqual(storedKey, derivedKey);
}

function sign(value, secret) {
  return crypto.createHmac('sha256', secret).update(value).digest('base64url');
}

function createSessionCookie(userId, event) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET environment variable is not set');

  const payload = Buffer.from(JSON.stringify({
    userId: userId.toString(),
    expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000),
  })).toString('base64url');
  const token = `${payload}.${sign(payload, secret)}`;
  const headers = event.headers || {};
  const isHttps = headers['x-forwarded-proto'] === 'https' || headers['X-Forwarded-Proto'] === 'https';
  const secure = isHttps ? '; Secure' : '';

  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly${secure}; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`;
}

function readCookie(event, name) {
  const headers = event.headers || {};
  const cookieHeader = headers.cookie || headers.Cookie;
  if (!cookieHeader) return null;

  const match = cookieHeader
    .split(';')
    .map(part => part.trim())
    .find(part => part.startsWith(`${name}=`));

  return match ? match.slice(name.length + 1) : null;
}

function readSession(event) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;

  const token = readCookie(event, COOKIE_NAME);
  if (!token) return null;

  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra) return null;
  const expected = sign(payload, secret);

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length) return null;
  if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!session.userId || session.expiresAt < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

async function publicUser(db, userId) {
  let objectId;
  try {
    objectId = new ObjectId(userId);
  } catch {
    return null;
  }

  const user = await db.collection('users').findOne(
    { _id: objectId },
    { projection: { email: 1, name: 1 } }
  );

  if (!user) return null;
  return { id: user._id.toString(), email: user.email, name: user.name || '' };
}

exports.handler = async (event) => {
  const method = event.httpMethod;

  if (method === 'GET') {
    try {
      const session = readSession(event);
      if (!session) return jsonResponse(200, { user: null });

      const db = await getDb();
      const user = await publicUser(db, session.userId);
      return jsonResponse(200, { user });
    } catch (err) {
      console.error('auth session error:', err);
      return jsonResponse(500, { error: 'Internal server error' });
    }
  }

  if (method !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON body' });
  }

  const action = payload.action;
  const email = normalizeEmail(payload.email);

  if (!email.includes('@')) {
    return jsonResponse(400, { error: 'A valid email is required' });
  }

  if (action === 'logout') {
    const headers = event.headers || {};
    const isHttps = headers['x-forwarded-proto'] === 'https' || headers['X-Forwarded-Proto'] === 'https';
    const secure = isHttps ? '; Secure' : '';
    return jsonResponse(200, { ok: true }, {
      'Set-Cookie': `${COOKIE_NAME}=; Path=/; HttpOnly${secure}; SameSite=Lax; Max-Age=0`,
    });
  }

  if (!payload.password || typeof payload.password !== 'string' || payload.password.length < 8) {
    return jsonResponse(400, { error: 'Password must be at least 8 characters' });
  }

  try {
    const db = await getDb();
    const users = db.collection('users');

    if (action === 'register') {
      const name = typeof payload.name === 'string' ? payload.name.trim() : '';
      if (!name) return jsonResponse(400, { error: 'Name is required' });

      const existing = await users.findOne({ email });
      if (existing) return jsonResponse(409, { error: 'An account with that email already exists' });

      const now = new Date();
      const result = await users.insertOne({
        email,
        name,
        passwordHash: hashPassword(payload.password),
        createdAt: now,
        updatedAt: now,
      });

      const user = { id: result.insertedId.toString(), email, name };
      return jsonResponse(201, { ok: true, user }, {
        'Set-Cookie': createSessionCookie(result.insertedId, event),
      });
    }

    if (action === 'login') {
      const existing = await users.findOne({ email });
      if (!existing || !verifyPassword(payload.password, existing.passwordHash)) {
        return jsonResponse(401, { error: 'Incorrect email or password' });
      }

      await users.updateOne({ _id: existing._id }, { $set: { updatedAt: new Date() } });

      const user = {
        id: existing._id.toString(),
        email: existing.email,
        name: existing.name || '',
      };

      return jsonResponse(200, { ok: true, user }, {
        'Set-Cookie': createSessionCookie(existing._id, event),
      });
    }

    return jsonResponse(400, { error: 'Invalid action' });
  } catch (err) {
    console.error('auth error:', err);
    return jsonResponse(500, { error: 'Internal server error' });
  }
};
