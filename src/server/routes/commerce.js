import express from 'express';
import Stripe from 'stripe';

const router = express.Router();
const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

router.post('/checkout', async (req, res) => {
  const { productName, priceCents, currency } = req.body;
  if (!productName || !priceCents) return res.status(400).json({ error: 'Missing product details' });
  
  try {
    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: currency || 'usd',
          product_data: { name: productName },
          unit_amount: priceCents,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/cancel`,
    });
    
    res.json({ success: true, url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('[Commerce] Stripe Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
