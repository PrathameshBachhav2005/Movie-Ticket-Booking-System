import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function BookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/bookings/my')
      .then(r => setBookings(r.data.bookings || []))
      .catch(() => setError('Failed to load bookings.'))
      .finally(() => setLoading(false));
  }, []);

  const total = bookings.reduce((s, b) => s + (b.price || 0), 0);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8 animate-fade-up">
        <div>
          <h1 className="text-2xl font-black text-white">My Tickets</h1>
          <p className="text-gray-500 text-sm mt-1">{user?.username && <span className="text-violet-400 font-medium">{user.username}</span>}'s confirmed bookings</p>
        </div>
        {bookings.length > 0 && (
          <div className="text-right">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total spent</p>
            <p className="text-2xl font-black text-gradient">₹{total}</p>
          </div>
        )}
      </div>

      {error && <div className="text-red-400 text-sm px-4 py-3 rounded-xl mb-6" style={{background:'rgba(239,68,68,0.10)',border:'1px solid rgba(239,68,68,0.20)'}}>{error}</div>}

      {bookings.length === 0 ? (
        <div className="card text-center py-20 animate-fade-up">
          <div className="text-6xl mb-4 animate-float">🎟️</div>
          <h2 className="text-white font-bold text-lg mb-2">No tickets yet</h2>
          <p className="text-gray-500 text-sm mb-6">Find a movie and book your first seat.</p>
          <Link to="/" className="btn-primary text-sm px-8 py-3">Browse Movies</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b, i) => (
            <div key={b.id} className="card p-4 sm:p-5 group animate-fade-up" style={{animationDelay:`${i*60}ms`}}>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0" style={{background:'rgba(255,255,255,0.05)'}}>
                  {b.moviePoster && <img src={b.moviePoster} alt={b.movieTitle} className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-sm sm:text-base truncate">{b.movieTitle}</h3>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    <span className="text-gray-400 text-[10px] px-2 py-0.5 rounded-full" style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.10)'}}>Seat #{b.seatNumber ?? b.seatId}</span>
                    {b.genre && <span className="text-violet-400 text-[10px] px-2 py-0.5 rounded-full" style={{background:'rgba(124,58,237,0.10)',border:'1px solid rgba(124,58,237,0.20)'}}>{b.genre.split(' / ')[0]}</span>}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xl font-black text-gradient">₹{b.price}</p>
                  <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px] px-2.5 py-1 rounded-full font-semibold mt-1" style={{background:'rgba(16,185,129,0.10)',border:'1px solid rgba(16,185,129,0.20)'}}>
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> Confirmed
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-3 text-[10px] text-gray-600 flex items-center gap-2" style={{borderTop:'1px solid rgba(255,255,255,0.05)'}}>
                🔒 Booking #{b.id} · Paid via Stripe
                {b.bookedAt && <span className="ml-auto">{new Date(b.bookedAt).toLocaleDateString()}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
