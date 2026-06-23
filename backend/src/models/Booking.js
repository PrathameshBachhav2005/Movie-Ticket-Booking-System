import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  userId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seatId:          { type: mongoose.Schema.Types.ObjectId, ref: 'Seat', required: true },
  movieId:         { type: String, required: true },
  paymentStatus:   { type: String, enum: ['pending', 'paid'], default: 'pending' },
  stripeSessionId: { type: String, unique: true, sparse: true },
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);
