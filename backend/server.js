// load-env.js MUST be the first import — ES module imports are hoisted,
// so dotenv must run before any other module reads process.env
import './load-env.js';

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

// CORS must be registered before any routes
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json());

// Routes
app.get('/', (_req, res) => res.json({ message: 'Movie Tickets API running' }));
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payment', paymentRoutes);

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

// ─── DB initialisation ────────────────────────────────────────────────────────
// Run once per cold start. On Vercel this happens inside the first request
// because top-level await isn't used (keeps startup fast).
let dbReady = false;
let dbError = null;

const dbInit = initDb()
  .then(() => {
    dbReady = true;
    console.log('✅ Database ready');
  })
  .catch((err) => {
    dbError = err;
    console.error('❌ DB init failed:', err.message);
    // In local dev crash immediately so you see the error
    if (process.env.NODE_ENV !== 'production') process.exit(1);
  });

// Middleware that waits for DB before processing any request
app.use(async (_req, res, next) => {
  if (!dbReady) {
    if (dbError) return res.status(503).json({ message: 'Database unavailable: ' + dbError.message });
    await dbInit;
  }
  next();
});

// ─── Local dev server ─────────────────────────────────────────────────────────
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

// Exported for Vercel serverless
export default app;
