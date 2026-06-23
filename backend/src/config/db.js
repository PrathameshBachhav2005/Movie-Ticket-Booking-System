import pg from 'pg';
import { movies as seedMovies } from '../data/movies.js';

const { Pool } = pg;

const isRemoteDb = process.env.DATABASE_URL &&
  !process.env.DATABASE_URL.includes('localhost') &&
  !process.env.DATABASE_URL.includes('127.0.0.1');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isRemoteDb ? { rejectUnauthorized: false } : false,
});

export async function initDb(retries = 5, delayMs = 2000) {
  // Retry on transient network errors (ETIMEDOUT, ENOTFOUND etc.)
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await _initDb();
      return; // success
    } catch (err) {
      const transient = ['ETIMEDOUT', 'ENOTFOUND', 'ECONNREFUSED', 'ECONNRESET'].includes(err.code);
      if (transient && attempt < retries) {
        console.warn(`⚠️  DB connection attempt ${attempt}/${retries} failed (${err.code}) — retrying in ${delayMs / 1000}s…`);
        await new Promise(r => setTimeout(r, delayMs));
      } else {
        throw err;
      }
    }
  }
}

async function _initDb() {
  // Split into individual statements — pg driver doesn't support multiple
  // statements in a single query() call reliably
  const statements = [
    `CREATE TABLE IF NOT EXISTS users (
      id       SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email    TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS movies (
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
    )`,
    `CREATE TABLE IF NOT EXISTS seats (
      id        SERIAL PRIMARY KEY,
      is_booked INTEGER DEFAULT 0,
      booked_by INTEGER
    )`,
    `CREATE TABLE IF NOT EXISTS bookings (
      id               SERIAL PRIMARY KEY,
      user_id          INTEGER NOT NULL,
      seat_id          INTEGER NOT NULL,
      movie_id         TEXT NOT NULL,
      payment_status   TEXT DEFAULT 'pending',
      stripe_session_id TEXT,
      booked_at        TEXT DEFAULT to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS')
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_stripe_session
      ON bookings(stripe_session_id)
      WHERE stripe_session_id IS NOT NULL`,
  ];

  for (const sql of statements) {
    await pool.query(sql);
  }

  // Upsert all movies from seed data
  for (const m of seedMovies) {
    await pool.query(
      `INSERT INTO movies (id, title, genre, duration, rating, language, release_date, description, "cast", price, poster_image)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (id) DO UPDATE SET
         title=$2, genre=$3, duration=$4, rating=$5, language=$6,
         release_date=$7, description=$8, "cast"=$9, price=$10, poster_image=$11`,
      [m.id, m.title, m.genre, m.duration, m.rating, m.language,
       m.releaseDate, m.description, JSON.stringify(m.cast), m.price, m.posterImage]
    );
  }

  // Seed 40 seats only if table is empty
  const { rows } = await pool.query('SELECT COUNT(*) AS total FROM seats');
  if (parseInt(rows[0].total) === 0) {
    for (let i = 0; i < 40; i++) {
      await pool.query('INSERT INTO seats (is_booked) VALUES (0)');
    }
  }
}

export default pool;
