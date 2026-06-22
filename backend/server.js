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

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (curl, Postman, same-origin Vercel)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payment', paymentRoutes);

app.get('/', (_req, res) => res.json({ message: 'About Movie Tickets API' }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

// Initialise DB once per cold start — blocks requests until ready
let dbReady = false;
const dbInit = initDb()
  .then(() => {
    dbReady = true;
    console.log('✅ Database ready');
  })
  .catch((err) => {
    console.error('❌ Failed to initialise database:', err.message);
    if (process.env.NODE_ENV !== 'production') process.exit(1);
  });

app.use(async (_req, _res, next) => {
  if (!dbReady) await dbInit;
  next();
});

// Listen locally only — Vercel imports this file and uses the exported app
if (process.env.NODE_ENV !== 'production') {
  function startServer(retries = 5) {
    const server = app.listen(PORT, () => {
      console.log(`\nBackend: http://localhost:${PORT}`);
      console.log(`Stripe:  ${process.env.STRIPE_SECRET_KEY ? '✅ key loaded' : '❌ MISSING'}`);
      console.log(`JWT:     ${process.env.JWT_SECRET ? '✅ key loaded' : '❌ MISSING'}\n`);
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE' && retries > 0) {
        console.log(`Port ${PORT} in use — retrying in 1s… (${retries} attempts left)`);
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
