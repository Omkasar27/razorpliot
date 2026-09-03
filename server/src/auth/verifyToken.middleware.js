import admin from './firebaseAdmin.js';
import User from '../db/models/User.js';

// Verifies the Firebase ID token in the Authorization header and attaches
// the app's own User record (not just the Firebase token) to req.user.
export async function verifyToken(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      const err = new Error('No token provided');
      err.status = 401;
      err.publicMessage = 'You must be signed in to do that.';
      throw err;
    }

    const decoded = await admin.auth().verifyIdToken(token);
    const user = await User.findOne({ firebaseUid: decoded.uid });
    if (!user) {
      const err = new Error('User not registered');
      err.status = 401;
      err.publicMessage = 'Your account is not set up yet. Please sign in again.';
      throw err;
    }

    req.user = user;
    next();
  } catch (err) {
    err.status = err.status || 401;
    err.publicMessage = err.publicMessage || 'Your session is invalid or has expired. Please sign in again.';
    next(err);
  }
}