import { Router } from 'express';
import Movie from '../models/Movie.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const movies = await Movie.find().sort({ releaseDate: -1 }).lean();
    res.json({ success: true, count: movies.length, movies });
  } catch (err) {
    console.error('Movies fetch error:', err);
    res.status(500).json({ success: false, message: 'Error fetching movies.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findOne({ id: req.params.id }).lean();
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found.' });
    res.json({ success: true, movie });
  } catch (err) {
    console.error('Movie fetch error:', err);
    res.status(500).json({ success: false, message: 'Error fetching movie.' });
  }
});

export default router;
