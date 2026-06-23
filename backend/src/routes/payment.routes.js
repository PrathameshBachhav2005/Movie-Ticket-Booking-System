import { Router } from 'express';
import Stripe from 'stripe';
import Movie from '../models/Movie.js';
import Seat from '../models/Seat.js';
import Booking from '../models/Booking.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();
let _stripe = null;

function getStripe() {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY missing from .env');
    _stripe = new Stripe(key, { apiVersion: '2024-06-20' });
  }
  return _stripe;
}

router.post('/create-checkout-session', authMiddleware, async (req, res) => {
  const { seatId, movieId } = req.body;
  const userId = req.user.id;

  if (!seatId || !movieId) return res.status(400).json({ message: 'seatId and movieId required.' });

  try {
    const movie = await Movie.findOne({ id: movieId }).lean();
    if (!movie) return res.status(404).json({ message: 'Movie not found.' });

    const alreadyPaid = await Booking.findOne({ userId, movieId, paymentStatus: 'paid' });
    if (alreadyPaid) return res.status(409).json({ message: 'You already have a confirmed ticket for this movie.' });

    const seat = await Seat.findById(seatId);
    if (!seat || seat.isBooked) return res.status(409).json({ message: 'This seat is no longer available.' });

    const stripe = getStripe();
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    const payload = {
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'inr',
          product_data: {
            name: `${movie.title} — Seat #${seat.seatNumber}`,
            description: `${movie.genre} · ${movie.duration} · ${movie.language}`,
            ...(movie.posterImage?.startsWith('https://') && { images: [movie.posterImage] }),
          },
          unit_amount: Math.round(movie.price * 100),
        },
        quantity: 1,
      }],
      metadata: { userId: String(userId), seatId: String(seatId), movieId: String(movieId) },
      success_url: `${clientUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/movies/${movieId}?cancelled=1`,
    };

    const session = await stripe.checkout.sessions.create(payload);

    // Upsert pending booking
    await Booking.findOneAndUpdate(
      { userId, movieId, paymentStatus: 'pending' },
      { seatId, stripeSessionId: session.id },
      { upsert: true, new: true }
    );

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('Stripe error:', err.message);
    const msg = err.type === 'StripeAuthenticationError'
      ? 'Invalid Stripe API key — update STRIPE_SECRET_KEY in .env'
      : err.message || 'Payment session creation failed.';
    res.status(500).json({ message: msg });
  }
});

router.get('/verify/:sessionId', authMiddleware, async (req, res) => {
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ success: false, message: 'Payment not completed yet.' });
    }

    const { userId, seatId, movieId } = session.metadata;

    let booking = await Booking.findOne({ stripeSessionId: session.id });
    if (!booking) {
      booking = await Booking.findOne({ userId, movieId, paymentStatus: 'pending' });
      if (!booking) return res.status(404).json({ success: false, message: 'Booking record not found.' });
    }

    if (booking.paymentStatus !== 'paid') {
      booking.paymentStatus = 'paid';
      booking.seatId = seatId;
      booking.stripeSessionId = session.id;
      await booking.save();

      await Seat.findByIdAndUpdate(seatId, { isBooked: true, bookedBy: userId });
    }

    const movie = await Movie.findOne({ id: movieId }).lean();
    const seatDoc = await Seat.findById(booking.seatId).lean();
    res.json({
      success: true,
      booking: {
        id: booking._id,
        seatId: booking.seatId,
        seatNumber: seatDoc?.seatNumber || '?',
        movieId: booking.movieId,
        paymentStatus: booking.paymentStatus,
        bookedAt: booking.createdAt,
        movieTitle: movie?.title || 'Unknown',
        price: movie?.price || 0,
        moviePoster: movie?.posterImage || null,
      },
    });
  } catch (err) {
    console.error('Verify error:', err.message);
    res.status(500).json({ success: false, message: err.message || 'Verification failed.' });
  }
});

export default router;
