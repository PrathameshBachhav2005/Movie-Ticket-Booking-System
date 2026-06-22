# 🎬 Movix — Movie Ticket Booking System

A full-stack movie ticket booking application with Stripe payments, JWT authentication, and a dark cinematic UI built with React + Vite on the frontend and Node.js + Express + SQLite on the backend.

---

## 📸 Features

- 🎥 **22 Movies** with search, genre filter, and language filter
- 💺 **Interactive Seat Grid** — 40 seats per show, real-time availability
- 💳 **Stripe Checkout** — Secure hosted payment page (test mode ready)
- 🔐 **JWT Authentication** — Register, login, protected routes (7-day token)
- 🗄️ **SQLite Database** — All data persisted locally via `better-sqlite3`
- 🎨 **Dark Cinematic UI** — Glassmorphism, gradient accents, smooth animations
- 🎟️ **My Tickets** — View all confirmed bookings with payment history
- 🔄 **Auto Movie Sync** — Movie catalog upserted into DB on every server start
- 🛡️ **Duplicate Prevention** — One ticket per user per movie enforced at DB level

---

## 🏗️ Project Structure

```
Movie Ticket Booking System/
├── backend/                          # Express.js API server
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # SQLite init, table creation, movie seeding
│   │   ├── data/
│   │   │   └── movies.js             # Movie seed data (22 movies)
│   │   ├── middleware/
│   │   │   └── auth.js               # JWT Bearer token verification middleware
│   │   └── routes/
│   │       ├── auth.routes.js        # POST /register, POST /login
│   │       ├── movie.routes.js       # GET /movies, GET /movies/:id
│   │       ├── booking.routes.js     # GET /seats, GET /my  (JWT protected)
│   │       └── payment.routes.js     # POST /create-checkout-session, GET /verify/:id
│   ├── server.js                     # Express app entry point
│   ├── database.sqlite               # SQLite database file (auto-created on first run)
│   ├── .env                          # Environment variables (not committed)
│   ├── .env.example                  # Environment variable template
│   ├── vercel.json                   # Vercel deployment config
│   └── package.json
│
├── frontend/                         # React 18 + Vite 4 + Tailwind CSS 3
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js              # Axios instance — auto-attaches JWT from localStorage
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Sticky nav with auth state (login/logout/username)
│   │   │   ├── MovieCard.jsx         # Movie grid card with poster, rating, genre
│   │   │   ├── SeatGrid.jsx          # Interactive 40-seat grid (available / booked / selected)
│   │   │   └── ProtectedRoute.jsx    # Redirects unauthenticated users to /login
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Global auth state — token + user, persisted to localStorage
│   │   ├── pages/
│   │   │   ├── HomePage.jsx          # Movie listing with search + genre + language filters
│   │   │   ├── LoginPage.jsx         # Sign in form
│   │   │   ├── RegisterPage.jsx      # Create account form
│   │   │   ├── MovieDetailPage.jsx   # Movie info + seat picker + book button
│   │   │   ├── PaymentSuccessPage.jsx# Post-payment confirmation (reads ?session_id param)
│   │   │   └── BookingsPage.jsx      # Current user's confirmed tickets
│   │   ├── App.jsx                   # Route definitions (React Router DOM)
│   │   ├── main.jsx                  # React app entry point
│   │   └── index.css                 # Tailwind base + custom utility classes
│   ├── .env                          # Frontend env (not committed)
│   ├── .env.example                  # Frontend env template
│   ├── vite.config.js                # Vite config + /api proxy to backend :8080
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vercel.json                   # Vercel deployment config (SPA rewrites)
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## ⚙️ Setup & Installation

### Prerequisites

- **Node.js v18+** — [nodejs.org](https://nodejs.org)
- **npm** (bundled with Node) for the backend
- **pnpm** for the frontend — install with `npm install -g pnpm`

### 1. Clone the repo

```bash
git clone https://github.com/PrathameshBachhav2005/Movie-Tickets-Platform.git
cd "Movie Ticket Booking System"
```

### 2. Backend setup

```bash
cd backend
npm install
copy .env.example .env
```

Edit `backend/.env` with your values:

```env
PORT=8080
JWT_SECRET=your_strong_random_secret_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
CLIENT_URL=http://localhost:5173
```

### 3. Frontend setup

```bash
cd ../frontend
pnpm install
copy .env.example .env
```

Edit `frontend/.env`:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

---

## 🚀 Running the App

Open **two terminals** side by side:

```bash
# Terminal 1 — Backend (port 8080)
cd backend
npm run dev          # uses node --watch for auto-reload
# or: node server.js (no auto-reload)

# Terminal 2 — Frontend (port 5173)
cd frontend
pnpm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

On backend startup you'll see:

```
Backend: http://localhost:8080
Stripe:  ✅ key loaded
JWT:     ✅ key loaded
```

> **Note:** The Vite dev server proxies all `/api/*` requests to `http://localhost:8080`, so the frontend never hard-codes the backend URL.

---

## 🔌 API Reference

Base URL: `http://localhost:8080/api`

All protected endpoints require the header:
```
Authorization: Bearer <jwt_token>
```

### Auth — `/api/auth`

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | `{ username, email, password }` | Create account — returns JWT + user object |
| `POST` | `/auth/login` | `{ email, password }` | Sign in — returns JWT + user object |

**Validation rules:**
- `username`, `email`, `password` all required
- `password` minimum 6 characters
- duplicate `email` or `username` returns `409 Conflict`

**Response (both endpoints):**
```json
{
  "success": true,
  "token": "eyJhbGci...",
  "user": { "id": 1, "username": "alice", "email": "alice@example.com" }
}
```

---

### Movies — `/api/movies`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/movies` | No | List all 22 movies, ordered by release date (newest first) |
| `GET` | `/movies/:id` | No | Get a single movie by ID (e.g. `m1`) |

**Movie object shape:**
```json
{
  "id": "m1",
  "title": "Movie Title",
  "genre": "Action / Thriller",
  "duration": "2h 30m",
  "rating": 8.5,
  "language": "Hindi",
  "releaseDate": "2024-01-15",
  "description": "...",
  "cast": ["Actor 1", "Actor 2"],
  "price": 349,
  "posterImage": "https://..."
}
```

---

### Bookings — `/api/bookings` *(JWT required)*

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/bookings/seats` | All 40 seats with booking status and booked-by username |
| `GET` | `/bookings/my` | Current user's confirmed (paid) tickets with movie details |

**Seats response:**
```json
{
  "seats": [
    { "id": 1, "isBooked": 0, "bookedBy": null, "username": null },
    { "id": 2, "isBooked": 1, "bookedBy": 3,    "username": "bob" }
  ]
}
```

**My bookings response:**
```json
{
  "bookings": [
    {
      "id": 5,
      "userId": 1,
      "seatId": 12,
      "movieId": "m4",
      "paymentStatus": "paid",
      "stripeSessionId": "cs_test_...",
      "bookedAt": "2025-06-10 14:32:00",
      "movieTitle": "Kalki 2898-AD",
      "price": 399,
      "moviePoster": "https://...",
      "genre": "Sci-Fi / Action",
      "duration": "3h 1m"
    }
  ]
}
```

---

### Payments — `/api/payment` *(JWT required)*

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/payment/create-checkout-session` | Creates a Stripe Checkout session for a seat + movie |
| `GET` | `/payment/verify/:sessionId` | Verifies payment with Stripe, marks seat booked + booking paid |

**Create session body:**
```json
{ "seatId": 12, "movieId": "m4" }
```

**Create session response:**
```json
{ "url": "https://checkout.stripe.com/...", "sessionId": "cs_test_..." }
```

**Payment flow:**
1. Frontend calls `POST /payment/create-checkout-session` → gets Stripe URL
2. User is redirected to Stripe's hosted payment page
3. On success, Stripe redirects to `http://localhost:5173/payment/success?session_id=cs_test_...`
4. `PaymentSuccessPage` calls `GET /payment/verify/:sessionId`
5. Backend retrieves session from Stripe, marks `bookings.paymentStatus = 'paid'`, marks `seats.isBooked = 1`

**Guards in place:**
- Seat must not already be booked (`isBooked = 0`)
- User cannot book the same movie twice (returns `409`)
- Stripe key missing → descriptive error message returned

---

## 🔐 Authentication Flow

```
Register/Login
     │
     ▼
Backend signs JWT (payload: id, username, email) — expires in 7 days
     │
     ▼
Frontend stores token in localStorage via AuthContext
     │
     ▼
axios.js interceptor reads token and adds: Authorization: Bearer <token>
     │
     ▼
auth.js middleware verifies token on every protected request
     │
     ├─ Valid  → attaches req.user = { id, username, email } → next()
     ├─ Expired → 401 "Token expired — please sign in again."
     └─ Invalid → 401 "Invalid token."
```

---

## 🗄️ Database Schema

SQLite via `better-sqlite3`. File location: `backend/database.sqlite` (auto-created on first server start).

```sql
-- Registered users
CREATE TABLE users (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  username  TEXT UNIQUE NOT NULL,
  email     TEXT UNIQUE NOT NULL,
  password  TEXT NOT NULL              -- bcrypt hashed (10 rounds)
);

-- Movie catalog (auto-synced from src/data/movies.js on every startup via upsert)
CREATE TABLE movies (
  id          TEXT PRIMARY KEY,        -- e.g. "m1", "m22"
  title       TEXT NOT NULL,
  genre       TEXT,
  duration    TEXT,
  rating      REAL,
  language    TEXT,
  releaseDate TEXT,
  description TEXT,
  cast        TEXT,                    -- JSON array stored as string
  price       INTEGER,                 -- ticket price in INR (paise × 100 sent to Stripe)
  posterImage TEXT
);

-- Cinema seats (40 rows, created once on first run)
CREATE TABLE seats (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  isBooked INTEGER DEFAULT 0,
  bookedBy INTEGER                     -- references users.id
);

-- Ticket bookings
CREATE TABLE bookings (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  userId           INTEGER NOT NULL,
  seatId           INTEGER NOT NULL,
  movieId          TEXT NOT NULL,
  paymentStatus    TEXT DEFAULT 'pending',  -- 'pending' | 'paid'
  stripeSessionId  TEXT,                    -- Stripe Checkout session ID (unique index)
  bookedAt         TEXT DEFAULT (datetime('now'))
);
```

### Database initialization behavior

On every server start `src/config/db.js`:
1. Creates all tables with `CREATE TABLE IF NOT EXISTS`
2. Runs `ALTER TABLE` migrations safely (wrapped in try/catch to skip if column exists)
3. **Upserts all 22 movies** from `src/data/movies.js` — editing that file and restarting updates the catalog automatically
4. Inserts 40 seat rows **only if the seats table is empty**

---

## 👀 How to View the Database

### Option 1 — VS Code Extension (recommended)

1. Install **[SQLite Viewer](https://marketplace.visualstudio.com/items?itemName=qwtel.sqlite-viewer)** by Florian Klampfer
2. Click `backend/database.sqlite` in the VS Code Explorer
3. Browse all tables visually — no CLI needed

### Option 2 — DB Browser for SQLite (desktop GUI)

1. Download from **[sqlitebrowser.org](https://sqlitebrowser.org/dl/)**
2. File → Open Database → select `backend/database.sqlite`
3. Click **Browse Data** tab → pick a table from the dropdown

### Option 3 — Command Line

```bash
sqlite3 backend/database.sqlite

.tables
.headers on
.mode column

SELECT * FROM users;
SELECT * FROM movies ORDER BY rating DESC;
SELECT * FROM seats WHERE isBooked = 1;

-- Full booking summary
SELECT b.id, u.username, m.title, b.seatId, b.paymentStatus, b.bookedAt
  FROM bookings b
  JOIN users u ON b.userId = u.id
  JOIN movies m ON b.movieId = m.id
  WHERE b.paymentStatus = 'paid';

.quit
```

---

## 💳 Stripe Test Cards

Use these on the Stripe hosted checkout page:

| Result | Card Number | Expiry | CVC |
|--------|-------------|--------|-----|
| ✅ Success | `4242 4242 4242 4242` | Any future date | Any 3 digits |
| ❌ Declined | `4000 0000 0000 0002` | Any future date | Any 3 digits |
| 🔐 3D Secure | `4000 0025 0000 3155` | Any future date | Any 3 digits |

---

## 💡 Adding New Movies

1. Open `backend/src/data/movies.js`
2. Add a new object following the existing format:

```js
{
  id: "m23",
  title: "Your Movie Title",
  genre: "Action / Drama",
  duration: "2h 15m",
  rating: 8.5,
  language: "Hindi",
  releaseDate: "2026-06-01",
  description: "Your description here.",
  cast: ["Actor 1", "Actor 2", "Actor 3"],
  price: 349,           // INR — converted to paise for Stripe automatically
  posterImage: "https://your-image-url.jpg",
}
```

3. Restart the backend — the movie is automatically upserted into the database.

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend framework | React | 18.3 |
| Frontend build tool | Vite | 4.5 |
| CSS framework | Tailwind CSS | 3.4 |
| Client-side routing | React Router DOM | 6.26 |
| HTTP client | Axios | 1.7 |
| Payments (frontend) | @stripe/react-stripe-js | 6.6 |
| Backend framework | Express | 5.2 |
| Runtime | Node.js | 18+ |
| Database driver | better-sqlite3 | 12.9 |
| Password hashing | bcryptjs | 3.0 |
| Auth tokens | jsonwebtoken | 9.0 |
| Payments (backend) | Stripe Node SDK | (via `stripe` package) |
| Package manager (FE) | pnpm | latest |
| Package manager (BE) | npm | latest |

---

## 🌐 Frontend Routes

| Path | Component | Auth Required |
|------|-----------|---------------|
| `/` | `HomePage` | No |
| `/login` | `LoginPage` | No |
| `/register` | `RegisterPage` | No |
| `/movies/:id` | `MovieDetailPage` | No |
| `/payment/success` | `PaymentSuccessPage` | ✅ Yes |
| `/bookings` | `BookingsPage` | ✅ Yes |
| `*` | Redirect to `/` | — |

Protected routes use `ProtectedRoute.jsx` which reads auth state from `AuthContext` and redirects to `/login` if no token is present.

---

## 🔧 Environment Variables Reference

### `backend/.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: `8080`) |
| `JWT_SECRET` | ✅ Yes | Secret key for signing/verifying JWTs — use a long random string |
| `STRIPE_SECRET_KEY` | ✅ Yes | Stripe secret key — starts with `sk_test_` (test) or `sk_live_` (prod) |
| `STRIPE_WEBHOOK_SECRET` | No | For webhook verification (not used in current polling-based flow) |
| `CLIENT_URL` | ✅ Yes | Frontend origin used in Stripe success/cancel redirect URLs |

### `frontend/.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_STRIPE_PUBLISHABLE_KEY` | ✅ Yes | Stripe publishable key — starts with `pk_test_` or `pk_live_` |

---

## 🐛 Common Issues

**`STRIPE_SECRET_KEY missing from .env`**
→ Make sure `backend/.env` exists and has a valid `STRIPE_SECRET_KEY` value.

**`Port 8080 in use`**
→ Another process is using port 8080. Change `PORT` in `backend/.env` or kill the other process.

**Seat shows as available but booking fails with `409`**
→ You already have a confirmed ticket for that movie. Each user can book one seat per movie.

**Frontend shows network error / API calls fail**
→ Make sure the backend is running on port 8080. The Vite proxy forwards `/api` traffic automatically.

**`Token expired — please sign in again`**
→ JWT tokens expire after 7 days. Log out and log back in to get a fresh token.

---

## 📦 Deployment

Both frontend and backend include `vercel.json` configs for Vercel deployment.

- **Backend** (`backend/vercel.json`) — deploy as a serverless Express function
- **Frontend** (`frontend/vercel.json`) — SPA rewrites so all routes resolve to `index.html`

Update `CLIENT_URL` in backend env vars and `VITE_STRIPE_PUBLISHABLE_KEY` / `STRIPE_SECRET_KEY` in their respective Vercel project settings before deploying to production.

---
