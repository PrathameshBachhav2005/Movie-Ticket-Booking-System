import { Router } from 'express';
import db from '../config/db.js';

const router = Router();

function parseMovie(row) {
  if (!row) return null;
  return { ...row, cast: JSON.parse(row.cast || '[]') };
}

router.get('/', (_req, res) => {
  const movies = db.prepare('SELECT * FROM movies ORDER BY releaseDate DESC').all().map(parseMovie);
  res.json({ success: true, count: movies.length, movies });
});

router.get('/:id', (req, res) => {
  const movie = parseMovie(db.prepare('SELECT * FROM movies WHERE id = ?').get(req.params.id));
  if (!movie) return res.status(404).json({ success: false, message: 'Movie not found.' });
  res.json({ success: true, movie });
});

export default router;
