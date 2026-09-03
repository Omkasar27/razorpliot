import admin from '../auth/firebaseAdmin.js';
import User from '../db/models/User.js';
import Merchant from '../db/models/Merchant.js';

// Exchanges a Firebase ID token for the app's own User record, creating
// one (and a Merchant, if applicable) on first login.
export async function postSession(req, res, next) {
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
    const { role } = req.body; // 'merchant' | 'customer' — only used on first login

    let user = await User.findOne({ firebaseUid: decoded.uid });

    if (!user) {
      if (!role || !['merchant', 'customer'].includes(role)) {
        const err = new Error('Role required for new account');
        err.status = 400;
        err.publicMessage = 'Please specify whether this is a merchant or customer account.';
        throw err;
      }

      let merchantId = null;
      if (role === 'merchant') {
        const merchant = await Merchant.create({ name: decoded.email || 'New Merchant' });
        merchantId = merchant._id;
      }

      user = await User.create({
        firebaseUid: decoded.uid,
        email: decoded.email || '',
        name: decoded.name || '',
        role,
        merchantId,
      });

      if (role === 'merchant') {
        await Merchant.findByIdAndUpdate(merchantId, { ownerUserId: user._id });
      }
    }

    res.json({ user });
  } catch (err) {
    err.status = err.status || 401;
    err.publicMessage = err.publicMessage || 'Sign-in failed. Please try again.';
    next(err);
  }
}