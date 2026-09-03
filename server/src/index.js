import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './db/connect.js';
import catalogRoutes from './routes/catalog.routes.js';
import merchantProductsRoutes from './routes/merchantProducts.routes.js';
import conversationRoutes from './routes/conversation.routes.js';
import recommendationRoutes from './routes/recommendation.routes.js';
import cartRoutes from './routes/cart.routes.js';
import merchantRulesRoutes from './routes/merchantRules.routes.js';
import checkoutRoutes from './routes/checkout.routes.js';
import approvalRoutes from './routes/approval.routes.js';
import auditRoutes from './routes/audit.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import authRoutes from './routes/auth.routes.js';
import orderRoutes from './routes/order.routes.js';



const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.use((req, res, next) => {
  console.log('REQUEST:', req.method, req.originalUrl);
  next();
});

// Health check — used to confirm the server + DB are both up during the demo.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'razorpilot-server', time: new Date().toISOString() });
});


app.use('/api/catalog', catalogRoutes);
app.use('/api/merchant/products', merchantProductsRoutes);
app.use('/api/conversation', conversationRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/merchant/rules', merchantRulesRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

app.use((err, req, res, next) => {
  console.error('[error]', err);
  res.status(err.status || 500).json({
    error: err.publicMessage || 'Something went wrong. Please try again.',
  });
});

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`RazorPilot server listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
