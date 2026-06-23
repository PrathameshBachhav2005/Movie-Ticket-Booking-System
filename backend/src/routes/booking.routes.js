import { Router } from 'express';
import Seat from '../models/Seat.js';
import Booking from '../models/Booking.js';
import Movie from '../models/Movie.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

router.get('/seats', authMiddleware, async (_req, res) => {
  try {
    const seats = await Seat.find().sort({ seatNumber: 1 }).populate('bookedBy', 'username').lean();
    const result = seats.map(s => ({
      id: s._id,
      seatNumber: s.seatNumber,
      isBooked: s.isBooked,
      bookedBy: s.bookedBy?._id || null,
      username: s.bookedBy?.username || null,
    }));
    res.json({ seats: result });
  } catch (err) {
    console.error('Seats fetch error:', err);
    res.status(500).json({ message: 'Error fetching seats.' });
  }
});

router.get('/my', authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({
      userId: req.user.id,
      paymentStatus: 'paid',
    }).sort({ createdAt: -1 }).lean();

    const result = await Promise.all(bookings.map(async (b) => {
      const movie = await Movie.findOne({ id: b.movieId }).lean();
      const seat = await Seat.findById(b.seatId).lean();
      return {
        id: b._id,
        seatId: b.seatId,
        seatNumber: seat?.seatNumber || '?',
        movieId: b.movieId,
        paymentStatus: b.paymentStatus,
        bookedAt: b.createdAt,
        movieTitle: movie?.title || 'Unknown',
        price: movie?.price || 0,
        moviePoster: movie?.posterImage || null,
        genre: movie?.genre || '',
        duration: movie?.duration || '',
      };
    }));

    res.json({ bookings: result });
  } catch (err) {
    console.error('Bookings fetch error:', err);
    res.status(500).json({ message: 'Error fetching bookings.' });
  }
});

export default router;
