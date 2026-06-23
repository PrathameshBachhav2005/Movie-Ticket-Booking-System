import mongoose from 'mongoose';
import { movies as seedMovies } from '../data/movies.js';
import Movie from '../models/Movie.js';
import Seat from '../models/Seat.js';

export async function initDb() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connected');

  // Seed movies only if collection is empty
  const movieCount = await Movie.countDocuments();
  if (movieCount === 0) {
    await Movie.insertMany(seedMovies);
    console.log(`Seeded ${seedMovies.length} movies`);
  }

  // Seed 40 seats only if collection is empty
  const seatCount = await Seat.countDocuments();
  if (seatCount === 0) {
    await Seat.insertMany(
      Array.from({ length: 40 }, (_, i) => ({ seatNumber: i + 1 }))
    );
    console.log('Seeded 40 seats');
  }
}

export default mongoose;
