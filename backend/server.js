import express from 'express';
import cors from 'cors';
import authRoutes from './src/routes/auth.routes.js';
import movieRoutes from './src/routes/movie.routes.js';
import bookingRoutes from './src/routes/booking.routes.js';
import paymentRoutes from './src/routes/payment.routes.js';
import { initDb } from './src/config/db.js';

const app = express();
const PORT = process.env.PORT || 8080;

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL,
].filter(Boolean);

// 1. CORS
app.use(cors({
  origin: (origin, cb) => {
    // Allow: no origin (Postman/curl), localhost, configured CLIENT_URL, any Vercel preview
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    if (origin.endsWith('.vercel.app')) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

// 2. Body parser
app.use(express.json());

// 3. DB init
let dbReady = false;
let dbError = null;

const dbInit = initDb()
  .then(() => { dbReady = true; })
  .catch((err) => {
    dbError = err;
    console.error('❌ DB init failed:', err.message);
    if (process.env.NODE_ENV !== 'production') process.exit(1);
  });

// 4. DB gate — every request waits for DB before being handled
app.use(async (_req, res, next) => {
  if (dbReady) return next();
  if (dbError) return res.status(503).json({ message: 'Database unavailable: ' + dbError.message });
  try { await dbInit; next(); }
  catch (err) { res.status(503).json({ message: 'Database unavailable: ' + err.message }); }
});

// 5. Routes
app.get('/', (_req, res) => res.json({ message: 'Movie Tickets API running' }));
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payment', paymentRoutes);

// 6. Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

// Local dev only
if (process.env.NODE_ENV !== 'production') {
  function startServer(retries = 5) {
    const server = app.listen(PORT, () => {
      console.log(`\nBackend: http://localhost:${PORT}`);
      console.log(`Stripe:  ${process.env.STRIPE_SECRET_KEY ? '✅ key loaded' : '❌ MISSING'}`);
      console.log(`JWT:     ${process.env.JWT_SECRET ? '✅ key loaded' : '❌ MISSING'}\n`);
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE' && retries > 0) {
        console.log(`Port ${PORT} in use — retrying in 1s… (${retries} left)`);
        setTimeout(() => startServer(retries - 1), 1000);
      } else {
        console.error('Server error:', err);
        process.exit(1);
      }
    });
  }
  startServer();
}

export default app;
