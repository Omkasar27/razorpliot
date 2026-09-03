import Rule from '../db/models/Rule.js';

export async function getRules(req, res, next) {
  try {
    const { merchantId } = req.query;
    if (!merchantId) {
      const err = new Error('merchantId required');
      err.status = 400;
      err.publicMessage = 'merchantId is required.';
      throw err;
    }
    let rule = await Rule.findOne({ merchantId });
    if (!rule) rule = await Rule.create({ merchantId });
    res.json({ rule });
  } catch (err) {
    next(err);
  }
}

export async function updateRules(req, res, next) {
  try {
    const { merchantId, ...updates } = req.body;
    if (!merchantId) {
      const err = new Error('merchantId required');
      err.status = 400;
      err.publicMessage = 'merchantId is required.';
      throw err;
    }
    const rule = await Rule.findOneAndUpdate({ merchantId }, updates, {
      new: true,
      upsert: true,
      runValidators: true,
    });
    res.json({ rule });
  } catch (err) {
    next(err);
  }
}