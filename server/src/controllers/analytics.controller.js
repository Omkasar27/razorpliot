import Order from '../db/models/Order.js';
import PaymentAttempt from '../db/models/PaymentAttempt.js';
import Recommendation from '../db/models/Recommendation.js';
import Conversation from '../db/models/Conversation.js';

function round1(n) {
  return Math.round(n * 10) / 10;
}

export async function getAnalytics(req, res, next) {
  try {
    const { merchantId } = req.query;
    if (!merchantId) {
      const err = new Error('merchantId required');
      err.status = 400;
      err.publicMessage = 'merchantId is required.';
      throw err;
    }

    const [paidOrders, failedOrders, conversations] = await Promise.all([
      Order.find({ merchantId, status: 'paid' }).lean(),
      Order.find({ merchantId, status: 'failed' }).lean(),
      Conversation.find({ merchantId }).select('_id').lean(),
    ]);

    const conversationIds = conversations.map((c) => c._id);
    const recommendations = await Recommendation.find({ conversationId: { $in: conversationIds } }).lean();

    // Revenue + order metrics
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.amount, 0);
    const aiAssistedOrders = paidOrders.length;
    const averageOrderValue = aiAssistedOrders ? totalRevenue / aiAssistedOrders : 0;

    // Upsell conversion — share of paid orders where the customer accepted an upsell
    const upsellAcceptedPaidOrders = paidOrders.filter((o) => o.upsellAccepted).length;
    const upsellConversionRate = aiAssistedOrders ? (upsellAcceptedPaidOrders / aiAssistedOrders) * 100 : 0;

    // Recommendation acceptance / cross-sell conversion — from decided recommendations only
    const decidedRecommendations = recommendations.filter((r) => r.accepted !== null);
    const acceptedRecommendations = recommendations.filter((r) => r.accepted === true);
    const recommendationAcceptanceRate = decidedRecommendations.length
      ? (acceptedRecommendations.length / decidedRecommendations.length) * 100
      : 0;

    const crossSellDecided = decidedRecommendations.filter((r) => r.type === 'cross-sell');
    const crossSellAccepted = acceptedRecommendations.filter((r) => r.type === 'cross-sell');
    const crossSellConversionRate = crossSellDecided.length
      ? (crossSellAccepted.length / crossSellDecided.length) * 100
      : 0;

    // Payment success rate — paid vs. all orders that reached a payment outcome (paid or failed)
    const totalPaymentOutcomeOrders = paidOrders.length + failedOrders.length;
    const paymentSuccessRate = totalPaymentOutcomeOrders
      ? (paidOrders.length / totalPaymentOutcomeOrders) * 100
      : 0;

    // Payment recovery rate — of orders that had at least one failed attempt, how many eventually paid
    const ordersWithFailureIds = await PaymentAttempt.distinct('orderId', { status: 'failed' });
    const ordersWithFailureSet = new Set(ordersWithFailureIds.map((id) => id.toString()));
    const recoveredOrders = paidOrders.filter((o) => ordersWithFailureSet.has(o._id.toString()));
    const paymentRecoveryRate = ordersWithFailureSet.size
      ? (recoveredOrders.length / ordersWithFailureSet.size) * 100
      : 0;

    res.json({
      totalRevenue,
      aiAssistedOrders,
      averageOrderValue: round1(averageOrderValue),
      upsellConversionRate: round1(upsellConversionRate),
      crossSellConversionRate: round1(crossSellConversionRate),
      recommendationAcceptanceRate: round1(recommendationAcceptanceRate),
      paymentSuccessRate: round1(paymentSuccessRate),
      paymentRecoveryRate: round1(paymentRecoveryRate),
      sampleSize: {
        paidOrders: paidOrders.length,
        failedOrders: failedOrders.length,
        totalRecommendations: recommendations.length,
        decidedRecommendations: decidedRecommendations.length,
        ordersWithAtLeastOneFailure: ordersWithFailureSet.size,
      },
    });
  } catch (err) {
    next(err);
  }
}