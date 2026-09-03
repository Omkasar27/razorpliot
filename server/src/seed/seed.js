import 'dotenv/config';
import { connectDB } from '../db/connect.js';
import mongoose from 'mongoose';
import Merchant from '../db/models/Merchant.js';
import Product from '../db/models/Product.js';
import Rule from '../db/models/Rule.js';
import { productSeeds } from './products.data.js';

async function seed() {
  await connectDB();

  console.log('Clearing existing demo data...');
  await Promise.all([
    Merchant.deleteMany({ name: 'RazorPilot Demo Store' }),
  ]);

  const merchant = await Merchant.create({
    name: 'RazorPilot Demo Store',
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  });
  console.log('Created demo merchant:', merchant._id.toString());

  await Product.deleteMany({ merchantId: merchant._id });

  // Insert products first (without compatibility), then resolve compatKeys -> ObjectIds.
  const keyToId = {};
  const created = [];
  for (const seedProduct of productSeeds) {
    const { key, compatKeys, ...rest } = seedProduct;
    const doc = await Product.create({ ...rest, merchantId: merchant._id });
    keyToId[key] = doc._id;
    created.push({ doc, compatKeys });
  }

  for (const { doc, compatKeys } of created) {
    doc.compatibility = compatKeys.map((k) => keyToId[k]).filter(Boolean);
    await doc.save();
  }
  console.log(`Seeded ${created.length} products.`);

  await Rule.deleteMany({ merchantId: merchant._id });
  await Rule.create({
    merchantId: merchant._id,
    approvalThreshold: 2000,
    maxDiscountPct: 20,
    lowInventoryThreshold: 3,
    maxRetryAttempts: 1,
  });
  console.log('Seeded default safety rules.');

  console.log('\nDone. Demo merchantId:', merchant._id.toString());
  console.log('(Save this — you will need it for testing customer flows against this merchant.)');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
