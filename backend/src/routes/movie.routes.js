import { Router } from 'express';
import db from '../config/db.js';

const router = Router();

function parseMovie(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    genre: row.genre,
    duration: row.duration,
    rating: row.rating,
    language: row.language,
    releaseDate: row.release_date,
    description: row.description,
    cast: typeof row.cast === 'string' ? JSON.parse(row.cast || '[]') : (row.cast || []),
    price: row.price,
    posterImage: row.poster_image,
  };
}

router.get('/', async (_req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM movies ORDER BY release_date DESC');
    const movies = rows.map(parseMovie);
    res.json({ success: true, count: movies.length, movies });
  } catch (err) {
    console.error('Movies fetch error:', err);
    res.status(500).json({ success: false, message: 'Error fetching movies.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM movies WHERE id = $1', [req.params.id]);
    const movie = parseMovie(rows[0]);
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found.' });
    res.json({ success: true, movie });
  } catch (err) {
    console.error('Movie fetch error:', err);
    res.status(500).json({ success: false, message: 'Error fetching movie.' });
  }
});

export default router;
