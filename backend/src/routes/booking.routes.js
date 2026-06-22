import { Router } from 'express';
import db from '../config/db.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

function getMovie(movieId) {
  const row = db.prepare('SELECT * FROM movies WHERE id = ?').get(movieId);
  if (!row) return null;
  return { ...row, cast: JSON.parse(row.cast || '[]') };
}

router.get('/seats', authMiddleware, (_req, res) => {
  try {
    const seats = db.prepare(
      `SELECT s.id, s.isBooked, s.bookedBy, u.username
       FROM seats s LEFT JOIN users u ON s.bookedBy = u.id ORDER BY s.id`
    ).all();
    res.json({ seats });
  } catch { res.status(500).json({ message: 'Error fetching seats.' }); }
});

router.get('/my', authMiddleware, (req, res) => {
  try {
    const rows = db.prepare(
      "SELECT * FROM bookings WHERE userId = ? AND paymentStatus = 'paid' ORDER BY id DESC"
    ).all(req.user.id);

    const bookings = rows.map(b => {
      const movie = getMovie(b.movieId);
      return {
        ...b,
        movieTitle: movie?.title || 'Unknown',
        price: movie?.price || 0,
        moviePoster: movie?.posterImage || null,
        genre: movie?.genre || '',
        duration: movie?.duration || '',
      };
    });
    res.json({ bookings });
  } catch { res.status(500).json({ message: 'Error fetching bookings.' }); }
});

export default router;
