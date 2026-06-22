import Database from 'better-sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { movies as seedMovies } from '../data/movies.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, '../../database.sqlite'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS movies (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    genre TEXT,
    duration TEXT,
    rating REAL,
    language TEXT,
    releaseDate TEXT,
    description TEXT,
    cast TEXT,
    price INTEGER,
    posterImage TEXT
  );

  CREATE TABLE IF NOT EXISTS seats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    isBooked INTEGER DEFAULT 0,
    bookedBy INTEGER
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    seatId INTEGER NOT NULL,
    movieId TEXT NOT NULL,
    paymentStatus TEXT DEFAULT 'pending',
    stripeSessionId TEXT,
    bookedAt TEXT DEFAULT (datetime('now'))
  );
`);

try { db.exec(`ALTER TABLE bookings ADD COLUMN paymentStatus TEXT DEFAULT 'pending'`); } catch {}
try { db.exec(`ALTER TABLE bookings ADD COLUMN stripeSessionId TEXT`); } catch {}
try { db.exec(`ALTER TABLE bookings ADD COLUMN bookedAt TEXT DEFAULT (datetime('now'))`); } catch {}
try { db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_stripe_session ON bookings(stripeSessionId) WHERE stripeSessionId IS NOT NULL`); } catch {}

const upsertMovie = db.prepare(`
  INSERT INTO movies (id, title, genre, duration, rating, language, releaseDate, description, cast, price, posterImage)
  VALUES (@id, @title, @genre, @duration, @rating, @language, @releaseDate, @description, @cast, @price, @posterImage)
  ON CONFLICT(id) DO UPDATE SET
    title=excluded.title, genre=excluded.genre, duration=excluded.duration,
    rating=excluded.rating, language=excluded.language, releaseDate=excluded.releaseDate,
    description=excluded.description, cast=excluded.cast, price=excluded.price,
    posterImage=excluded.posterImage
`);

const syncMovies = db.transaction(() => {
  for (const m of seedMovies) {
    upsertMovie.run({ ...m, cast: JSON.stringify(m.cast) });
  }
});
syncMovies();

const count = db.prepare('SELECT COUNT(*) as total FROM seats').get();
if (count.total === 0) {
  const ins = db.prepare('INSERT INTO seats (isBooked) VALUES (0)');
  for (let i = 0; i < 40; i++) ins.run();
}

export default db;
