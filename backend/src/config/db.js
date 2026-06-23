import pg from 'pg';
import { movies as seedMovies } from '../data/movies.js';

const { Pool } = pg;

const isRemoteDb = process.env.DATABASE_URL &&
  !process.env.DATABASE_URL.includes('localhost') &&
  !process.env.DATABASE_URL.includes('127.0.0.1');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isRemoteDb ? { rejectUnauthorized: false } : false,
  max: 3,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client:', err.message || err);
});

export async function initDb() {
  // Create tables (safe to run every time — IF NOT EXISTS)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id       SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email    TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS movies (
      id           TEXT PRIMARY KEY,
      title        TEXT NOT NULL,
      genre        TEXT,
      duration     TEXT,
      rating       REAL,
      language     TEXT,
      release_date TEXT,
      description  TEXT,
      "cast"       TEXT,
      price        INTEGER,
      poster_image TEXT
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS seats (
      id        SERIAL PRIMARY KEY,
      is_booked INTEGER DEFAULT 0,
      booked_by INTEGER
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id                SERIAL PRIMARY KEY,
      user_id           INTEGER NOT NULL,
      seat_id           INTEGER NOT NULL,
      movie_id          TEXT NOT NULL,
      payment_status    TEXT DEFAULT 'pending',
      stripe_session_id TEXT,
      booked_at         TEXT DEFAULT to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS')
    )
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_stripe_session
      ON bookings(stripe_session_id)
      WHERE stripe_session_id IS NOT NULL
  `);

  // Check if movies table already has data
  const { rows: movieCount } = await pool.query('SELECT COUNT(*) AS total FROM movies');
  const needsSeed = parseInt(movieCount[0].total) === 0;

  // Only seed on first run — skip on every Vercel cold start after initial deploy
  if (needsSeed) {
    console.log('Seeding movies and seats…');

    await pool.query('BEGIN');
    try {
      for (const m of seedMovies) {
        await pool.query(
          `INSERT INTO movies
             (id, title, genre, duration, rating, language, release_date,
              description, "cast", price, poster_image)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
           ON CONFLICT (id) DO NOTHING`,
          [m.id, m.title, m.genre, m.duration, m.rating, m.language,
           m.releaseDate, m.description, JSON.stringify(m.cast), m.price, m.posterImage]
        );
      }
      await pool.query('COMMIT');
    } catch (err) {
      await pool.query('ROLLBACK');
      throw err;
    }

    // Seed 40 seats in one query
    const values = Array.from({ length: 40 }, (_, i) => `(${i + 1}, 0)`).join(',');
    await pool.query(
      `INSERT INTO seats (id, is_booked) VALUES ${values} ON CONFLICT DO NOTHING`
    );

    console.log('Seed complete.');
  }
}

export default pool;
