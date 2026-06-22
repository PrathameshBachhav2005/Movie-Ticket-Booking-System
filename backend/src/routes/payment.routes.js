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

async function getMovie(movieId) {
  const { rows } = await db.query('SELECT * FROM movies WHERE id = $1', [movieId]);
  const row = rows[0];
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    genre: row.genre,
    duration: row.duration,
    language: row.language,
    price: row.price,
    posterImage: row.poster_image,
    cast: typeof row.cast === 'string' ? JSON.parse(row.cast || '[]') : (row.cast || []),
  };
}

router.post('/create-checkout-session', authMiddleware, async (req, res) => {
  const { seatId, movieId } = req.body;
  const userId = req.user.id;

  if (!seatId || !movieId) {
    return res.status(400).json({ message: 'seatId and movieId required.' });
  }

  try {
    const movie = await getMovie(movieId);
    if (!movie) return res.status(404).json({ message: 'Movie not found.' });

    const alreadyPaid = await db.query(
      `SELECT id FROM bookings WHERE user_id=$1 AND movie_id=$2 AND payment_status='paid'`,
      [userId, movieId]
    );
    if (alreadyPaid.rows.length > 0) {
      return res.status(409).json({ message: 'You already have a confirmed ticket for this movie.' });
    }

    const seatResult = await db.query(
      `SELECT * FROM seats WHERE id=$1 AND is_booked=0`,
      [seatId]
    );
    if (seatResult.rows.length === 0) {
      return res.status(409).json({ message: 'This seat is no longer available.' });
    }

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
      metadata: {
        userId: String(userId),
        seatId: String(seatId),
        movieId: String(movieId),
      },
      success_url: `${clientUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/movies/${movieId}?cancelled=1`,
    };

    if (movie.posterImage?.startsWith('https://')) {
      payload.line_items[0].price_data.product_data.images = [movie.posterImage];
    }

    const session = await stripe.checkout.sessions.create(payload);

    // Update existing pending booking or create new one
    const pending = await db.query(
      `SELECT id FROM bookings WHERE user_id=$1 AND movie_id=$2 AND payment_status='pending'`,
      [userId, movieId]
    );

    if (pending.rows.length > 0) {
      await db.query(
        `UPDATE bookings SET seat_id=$1, stripe_session_id=$2 WHERE id=$3`,
        [seatId, session.id, pending.rows[0].id]
      );
    } else {
      await db.query(
        `INSERT INTO bookings (user_id, seat_id, movie_id, payment_status, stripe_session_id)
         VALUES ($1,$2,$3,'pending',$4)`,
        [userId, seatId, movieId, session.id]
      );
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

    // Find booking by stripe session id first, fall back to pending
    let bookingResult = await db.query(
      `SELECT * FROM bookings WHERE stripe_session_id=$1`,
      [session.id]
    );

    if (bookingResult.rows.length === 0) {
      bookingResult = await db.query(
        `SELECT * FROM bookings WHERE user_id=$1 AND movie_id=$2 AND payment_status='pending'`,
        [Number(userId), movieId]
      );
      if (bookingResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Booking record not found.' });
      }
    }

    let booking = bookingResult.rows[0];

    if (booking.payment_status !== 'paid') {
      await db.query(
        `UPDATE bookings SET payment_status='paid', seat_id=$1 WHERE id=$2`,
        [Number(seatId), booking.id]
      );
      await db.query(
        `UPDATE seats SET is_booked=1, booked_by=$1 WHERE id=$2`,
        [Number(userId), Number(seatId)]
      );
      const updated = await db.query('SELECT * FROM bookings WHERE id=$1', [booking.id]);
      booking = updated.rows[0];
    }

    const movie = await getMovie(movieId);
    res.json({
      success: true,
      booking: {
        id: booking.id,
        userId: booking.user_id,
        seatId: booking.seat_id,
        movieId: booking.movie_id,
        paymentStatus: booking.payment_status,
        bookedAt: booking.booked_at,
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
