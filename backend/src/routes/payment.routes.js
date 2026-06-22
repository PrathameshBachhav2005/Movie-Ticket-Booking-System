import { Router } from 'express';
import Stripe from 'stripe';
import db from '../config/db.js';
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

function getMovie(movieId) {
  const row = db.prepare('SELECT * FROM movies WHERE id = ?').get(movieId);
  if (!row) return null;
  return { ...row, cast: JSON.parse(row.cast || '[]') };
}

router.post('/create-checkout-session', authMiddleware, async (req, res) => {
  const { seatId, movieId } = req.body;
  const userId = req.user.id;

  if (!seatId || !movieId) return res.status(400).json({ message: 'seatId and movieId required.' });

  const movie = getMovie(movieId);
  if (!movie) return res.status(404).json({ message: 'Movie not found.' });

  const alreadyPaid = db.prepare(
    "SELECT id FROM bookings WHERE userId=? AND movieId=? AND paymentStatus='paid'"
  ).get(userId, movieId);
  if (alreadyPaid) return res.status(409).json({ message: 'You already have a confirmed ticket for this movie.' });

  const seat = db.prepare('SELECT * FROM seats WHERE id=? AND isBooked=0').get(seatId);
  if (!seat) return res.status(409).json({ message: 'This seat is no longer available.' });

  try {
    const stripe = getStripe();
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    const payload = {
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'inr',
          product_data: {
            name: `${movie.title} — Seat #${seatId}`,
            description: `${movie.genre} · ${movie.duration} · ${movie.language}`,
          },
          unit_amount: Math.round(movie.price * 100),
        },
        quantity: 1,
      }],
      metadata: { userId: String(userId), seatId: String(seatId), movieId: String(movieId) },
      success_url: `${clientUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/movies/${movieId}?cancelled=1`,
    };

    if (movie.posterImage?.startsWith('https://')) {
      payload.line_items[0].price_data.product_data.images = [movie.posterImage];
    }

    const session = await stripe.checkout.sessions.create(payload);

    const pending = db.prepare(
      "SELECT id FROM bookings WHERE userId=? AND movieId=? AND paymentStatus='pending'"
    ).get(userId, movieId);

    if (pending) {
      db.prepare('UPDATE bookings SET seatId=?, stripeSessionId=? WHERE id=?').run(seatId, session.id, pending.id);
    } else {
      db.prepare('INSERT INTO bookings (userId,seatId,movieId,paymentStatus,stripeSessionId) VALUES (?,?,?,?,?)').run(userId, seatId, movieId, 'pending', session.id);
    }

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('Stripe error:', err.message);
    const msg = err.type === 'StripeAuthenticationError'
      ? 'Invalid Stripe API key — update STRIPE_SECRET_KEY in backend/.env'
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
    let booking = db.prepare('SELECT * FROM bookings WHERE stripeSessionId=?').get(session.id);

    if (!booking) {
      booking = db.prepare(
        "SELECT * FROM bookings WHERE userId=? AND movieId=? AND paymentStatus='pending'"
      ).get(Number(userId), movieId);
      if (!booking) return res.status(404).json({ success: false, message: 'Booking record not found.' });
    }

    if (booking.paymentStatus !== 'paid') {
      db.prepare('UPDATE bookings SET paymentStatus=?, seatId=? WHERE id=?').run('paid', Number(seatId), booking.id);
      db.prepare('UPDATE seats SET isBooked=1, bookedBy=? WHERE id=?').run(Number(userId), Number(seatId));
      booking = db.prepare('SELECT * FROM bookings WHERE id=?').get(booking.id);
    }

    const movie = getMovie(movieId);
    res.json({
      success: true,
      booking: {
        ...booking,
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
