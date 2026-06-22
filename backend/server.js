import { createRequire } from 'module';
const require = createRequire(import.meta.url);
require('dotenv').config();

import express from 'express';
import cors from 'cors';
import authRoutes from './src/routes/auth.routes.js';
import movieRoutes from './src/routes/movie.routes.js';
import bookingRoutes from './src/routes/booking.routes.js';
import paymentRoutes from './src/routes/payment.routes.js';
import './src/config/db.js';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payment', paymentRoutes);

app.get('/', (_req, res) => res.json({ message: 'Movie Tickets API running' }));

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const server = app.listen(PORT, () => {
  console.log(`\nBackend: http://localhost:${PORT}`);
  console.log(`Stripe:  ${process.env.STRIPE_SECRET_KEY ? '✅ key loaded' : '❌ MISSING — set STRIPE_SECRET_KEY in .env'}`);
  console.log(`JWT:     ${process.env.JWT_SECRET ? '✅ key loaded' : '❌ MISSING'}\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') { console.error(`Port ${PORT} in use.`); process.exit(1); }
  else console.error('Server error:', err);
});
