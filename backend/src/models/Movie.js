import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
  id:          { type: String, required: true, unique: true }, // e.g. "m1"
  title:       { type: String, required: true },
  genre:       String,
  duration:    String,
  rating:      Number,
  language:    String,
  releaseDate: String,
  description: String,
  cast:        [String],
  price:       Number,
  posterImage: String,
});

export default mongoose.model('Movie', movieSchema);
