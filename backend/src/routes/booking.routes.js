import { Router } from 'express';
import db from '../config/db.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

async function getMovie(movieId) {
  const { rows } = await db.query('SELECT * FROM movies WHERE id = $1', [movieId]);
  const row = rows[0];
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    genre: row.genre,
    duration: row.duration,
    price: row.price,
    posterImage: row.poster_image,
    cast: typeof row.cast === 'string' ? JSON.parse(row.cast || '[]') : (row.cast || []),
  };
}

router.get('/seats', authMiddleware, async (_req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT s.id, s.is_booked AS "isBooked", s.booked_by AS "bookedBy", u.username
       FROM seats s
       LEFT JOIN users u ON s.booked_by = u.id
       ORDER BY s.id`
    );
    res.json({ seats: rows });
  } catch (err) {
    console.error('Seats fetch error:', err);
    res.status(500).json({ message: 'Error fetching seats.' });
  }
});

router.get('/my', authMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM bookings WHERE user_id = $1 AND payment_status = 'paid' ORDER BY id DESC`,
      [req.user.id]
    );

    const bookings = await Promise.all(rows.map(async (b) => {
      const movie = await getMovie(b.movie_id);
      return {
        id: b.id,
        userId: b.user_id,
        seatId: b.seat_id,
        movieId: b.movie_id,
        paymentStatus: b.payment_status,
        stripeSessionId: b.stripe_session_id,
        bookedAt: b.booked_at,
        movieTitle: movie?.title || 'Unknown',
        price: movie?.price || 0,
        moviePoster: movie?.posterImage || null,
        genre: movie?.genre || '',
        duration: movie?.duration || '',
      };
    }));

    res.json({ bookings });
  } catch (err) {
    console.error('Bookings fetch error:', err);
    res.status(500).json({ message: 'Error fetching bookings.' });
  }
});

export default router;
