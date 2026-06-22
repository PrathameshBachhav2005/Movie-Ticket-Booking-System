import pg from 'pg';
import { movies as seedMovies } from '../data/movies.js';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id       SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email    TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS movies (
      id          TEXT PRIMARY KEY,
      title       TEXT NOT NULL,
      genre       TEXT,
      duration    TEXT,
      rating      REAL,
      language    TEXT,
      "releaseDate" TEXT,
      description TEXT,
      cast        TEXT,
      price       INTEGER,
      "posterImage" TEXT
    );

    CREATE TABLE IF NOT EXISTS seats (
      id        SERIAL PRIMARY KEY,
      "isBooked" INTEGER DEFAULT 0,
      "bookedBy" INTEGER
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id               SERIAL PRIMARY KEY,
      "userId"         INTEGER NOT NULL,
      "seatId"         INTEGER NOT NULL,
      "movieId"        TEXT NOT NULL,
      "paymentStatus"  TEXT DEFAULT 'pending',
      "stripeSessionId" TEXT,
      "bookedAt"       TEXT DEFAULT (to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS'))
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_stripe_session
      ON bookings("stripeSessionId")
      WHERE "stripeSessionId" IS NOT NULL;
  `);

  // Upsert all movies from seed data
  for (const m of seedMovies) {
    await pool.query(
      `INSERT INTO movies (id, title, genre, duration, rating, language, "releaseDate", description, cast, price, "posterImage")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (id) DO UPDATE SET
         title=$2, genre=$3, duration=$4, rating=$5, language=$6,
         "releaseDate"=$7, description=$8, cast=$9, price=$10, "posterImage"=$11`,
      [m.id, m.title, m.genre, m.duration, m.rating, m.language,
       m.releaseDate, m.description, JSON.stringify(m.cast), m.price, m.posterImage]
    );
  }

  // Seed 40 seats only if table is empty
  const { rows } = await pool.query('SELECT COUNT(*) as total FROM seats');
  if (parseInt(rows[0].total) === 0) {
    for (let i = 0; i < 40; i++) {
      await pool.query('INSERT INTO seats ("isBooked") VALUES (0)');
    }
  }
}

export default pool;
