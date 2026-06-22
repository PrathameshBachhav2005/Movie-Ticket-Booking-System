# 🎬 Movix — Movie Ticket Booking System

Full-stack movie ticket booking app with Stripe payments, JWT auth, and a dark cinematic UI.
**Stack:** React + Vite + Tailwind CSS · Node.js + Express · PostgreSQL

---

## ✨ Features

- 22+ movies with search and language filter
- Interactive 40-seat grid with real-time availability
- Stripe hosted checkout (test mode ready)
- JWT authentication — register, login, 7-day token
- Auto movie sync — catalog upserted from `movies.js` on every server start
- One ticket per user per movie enforced at DB level

---

## 🚀 Running Locally

### Prerequisites
- Node.js v18+, npm, pnpm (`npm i -g pnpm`)
- A free PostgreSQL DB — [Neon](https://neon.tech), [Aiven](https://aiven.io), or [Supabase](https://supabase.com)

### 1. Clone
```bash
git clone https://github.com/PrathameshBachhav2005/Movie-Tickets-Platform.git
cd "Movie Ticket Booking System"
```

### 2. Backend
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
NODE_ENV=development
PORT=8080
JWT_SECRET=any_long_random_string
STRIPE_SECRET_KEY=sk_test_your_key
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgres://user:pass@host:port/dbname
```
> Do **not** add `?sslmode=require` to the URL — SSL is handled automatically.

### 3. Frontend
```bash
cd ../frontend
pnpm install
```

Create `frontend/.env`:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
VITE_API_BASE_URL=
```

### 4. Start
```bash
# Terminal 1 — backend (port 8080)
cd backend && npm run dev

# Terminal 2 — frontend (port 5173)
cd frontend && pnpm run dev
```

Open **http://localhost:5173**

Successful backend output:
```
Backend: http://localhost:8080
Stripe:  ✅ key loaded
JWT:     ✅ key loaded
✅ Database ready
```

---

## 🔌 API Reference

Base URL: `http://localhost:8080/api` · Protected routes require `Authorization: Bearer <token>`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register — returns JWT + user |
| POST | `/auth/login` | No | Login — returns JWT + user |
| GET | `/movies` | No | All movies |
| GET | `/movies/:id` | No | Single movie |
| GET | `/bookings/seats` | ✅ | All 40 seats with status |
| GET | `/bookings/my` | ✅ | Current user's paid bookings |
| POST | `/payment/create-checkout-session` | ✅ | Create Stripe session → returns `{ url }` |
| GET | `/payment/verify/:sessionId` | ✅ | Confirm payment, mark seat booked |

---

## 🗄️ Database Schema

Tables are created automatically on first server start.

```sql
users    — id, username, email, password (bcrypt)
movies   — id, title, genre, duration, rating, language, release_date,
           description, "cast", price, poster_image
seats    — id, is_booked, booked_by
bookings — id, user_id, seat_id, movie_id, payment_status, stripe_session_id, booked_at
```

---

## 🏗️ Project Structure

```
├── vercel.json              # Root multi-service Vercel config
├── backend/
│   ├── load-env.js          # Loads .env first (ES module hoisting fix)
│   ├── server.js            # Express app + Vercel serverless export
│   ├── src/
│   │   ├── config/db.js     # pg Pool + initDb() — tables, seed, 40 seats
│   │   ├── data/movies.js   # Movie seed data
│   │   ├── middleware/auth.js
│   │   └── routes/          # auth · movie · booking · payment
│   └── .env
└── frontend/
    ├── vite.config.js       # /api proxy → :8080
    ├── src/
    │   ├── api/axios.js     # Axios + JWT interceptor
    │   ├── context/AuthContext.jsx
    │   ├── components/      # Navbar · MovieCard · SeatGrid · ProtectedRoute
    │   └── pages/           # Home · Login · Register · MovieDetail
    │                        # PaymentSuccess · Bookings
    └── .env
```

---

## 🛠️ Tech Stack

| | Technology |
|-|-----------|
| Frontend | React 18, Vite 4, Tailwind CSS 3, React Router 6, Axios |
| Backend | Node.js 18+, Express 5, pg 8, bcryptjs, jsonwebtoken |
| Payments | Stripe Node SDK 22, @stripe/stripe-js |
| Database | PostgreSQL (Aiven / Neon / Supabase) |

---

## � Stripe Test Cards

| Card | Number |
|------|--------|
| ✅ Success | `4242 4242 4242 4242` |
| ❌ Declined | `4000 0000 0000 0002` |
| 🔐 3D Secure | `4000 0025 0000 3155` |

Any future expiry · any 3-digit CVC

---

## 🚀 Deploy to Vercel

1. Push to GitHub
2. Import repo in Vercel — root `vercel.json` sets up both services automatically
3. Add env vars in **Vercel → Settings → Environment Variables**:
   - Backend: `NODE_ENV=production`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `CLIENT_URL`, `DATABASE_URL`
   - Frontend: `VITE_STRIPE_PUBLISHABLE_KEY`

---

## 🐛 Common Issues

| Error | Fix |
|-------|-----|
| `Cannot find package 'stripe'` | Run `npm install` in `backend/` |
| `ECONNREFUSED` on startup | `DATABASE_URL` is missing or wrong in `backend/.env` |
| `SELF_SIGNED_CERT_IN_CHAIN` | Remove `?sslmode=require` from your `DATABASE_URL` |
| `Port 8080 in use` | Kill the old process and restart |
| `401 No token provided` | Token expired — log out and sign back in |
| `409` on booking | You already have a paid ticket for that movie |
