import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import SeatGrid from '../components/SeatGrid.jsx';

export default function MovieDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null); // full seat object { id, seatNumber }
  const [loadingMovie, setLoadingMovie] = useState(true);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const cancelled = searchParams.get('cancelled') === '1';

  useEffect(() => {
    api.get(`/movies/${id}`)
      .then(r => setMovie(r.data.movie))
      .catch(() => setError('Movie not found.'))
      .finally(() => setLoadingMovie(false));
  }, [id]);

  useEffect(() => {
    if (!isLoggedIn) return;
    setLoadingSeats(true);
    api.get('/bookings/seats')
      .then(r => setSeats(r.data.seats || []))
      .catch(() => setError('Failed to load seats.'))
      .finally(() => setLoadingSeats(false));
  }, [isLoggedIn]);

  async function handleCheckout() {
    if (!selectedSeat) return;
    setPaying(true); setError('');
    try {
      const res = await api.post('/payment/create-checkout-session', { seatId: selectedSeat.id, movieId: id });
      window.location.href = res.data.url;
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start payment. Check your Stripe key.');
      setPaying(false);
    }
  }

  if (loadingMovie) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!movie) return <div className="text-center py-24 text-gray-500">{error || 'Movie not found.'}</div>;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white text-sm mb-8 transition-colors group">
        <span className="group-hover:-translate-x-1 transition-transform">←</span> All movies
      </Link>

      {cancelled && (
        <div className="text-yellow-400 text-sm px-5 py-4 rounded-2xl mb-6 flex items-center gap-3" style={{background:'rgba(234,179,8,0.08)',border:'1px solid rgba(234,179,8,0.20)'}}>
          ⚠️ Payment cancelled — your seat is still available.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 mb-12">
        <div className="lg:col-span-2 rounded-2xl overflow-hidden" style={{aspectRatio:'16/9',border:'1px solid rgba(255,255,255,0.07)'}}>
          <img src={movie.posterImage} alt={movie.title} className="w-full h-full object-cover"
            onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
          <div className="w-full h-full bg-gradient-to-br from-violet-900/60 to-gray-900 items-center justify-center text-7xl hidden">🎬</div>
        </div>

        <div className="lg:col-span-3 flex flex-col justify-center">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-violet-400 text-xs px-3 py-1 rounded-full font-semibold" style={{background:'rgba(124,58,237,0.15)',border:'1px solid rgba(124,58,237,0.30)'}}>{movie.genre}</span>
            <span className="text-gray-400 text-xs px-3 py-1 rounded-full" style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.10)'}}>{movie.language}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-4">{movie.title}</h1>
          <div className="flex flex-wrap gap-5 text-sm text-gray-400 mb-5">
            <span>★ <span className="text-yellow-400 font-bold">{movie.rating}</span>/10</span>
            <span>⏱ {movie.duration}</span>
            <span>📅 {new Date(movie.releaseDate).getFullYear()}</span>
          </div>
          <p className="text-gray-400 leading-relaxed mb-6 text-sm">{movie.description}</p>
          <div className="mb-6">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-3">Cast</p>
            <div className="flex flex-wrap gap-2">
              {movie.cast?.map(a => <span key={a} className="text-gray-300 text-xs px-3 py-1.5 rounded-full" style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.10)'}}>{a}</span>)}
            </div>
          </div>
          <div className="flex items-center justify-between rounded-2xl p-4" style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)'}}>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Ticket price</p>
              <p className="text-3xl font-black text-gradient">₹{movie.price}</p>
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1"><span className="text-violet-400">🔒</span> Secured by Stripe</p>
          </div>
        </div>
      </div>

      <div className="card p-6 sm:p-8">
        <h2 className="text-xl font-bold text-white mb-2">Choose your seat</h2>
        <p className="text-gray-500 text-sm mb-8">Select an available seat then pay securely via Stripe.</p>

        {!isLoggedIn ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔐</div>
            <p className="text-gray-400 mb-5 text-sm">Sign in to select a seat and book your ticket.</p>
            <Link to="/login" className="btn-primary text-sm px-8 py-3">Sign in to Book</Link>
          </div>
        ) : (
          <>
            {error && <div className="text-red-400 text-sm px-4 py-3 rounded-xl mb-6" style={{background:'rgba(239,68,68,0.10)',border:'1px solid rgba(239,68,68,0.20)'}}>{error}</div>}
            {loadingSeats
              ? <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>
              : <SeatGrid seats={seats} selectedSeat={selectedSeat?.id} onSelect={(seatId) => {
                  const seat = seats.find(s => s.id === seatId);
                  setSelectedSeat(seat || null);
                }} currentUserId={user?.id} />
            }
            {selectedSeat && (
              <div className="mt-8 p-5 rounded-2xl animate-fade-up" style={{background:'rgba(124,58,237,0.08)',border:'1px solid rgba(124,58,237,0.25)',boxShadow:'0 0 30px rgba(124,58,237,0.15)'}}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shadow-lg" style={{background:'linear-gradient(135deg,#7c3aed,#ec4899)'}}>
                      {selectedSeat.seatNumber}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{movie.title}</p>
                      <p className="text-gray-400 text-xs">Seat #{selectedSeat.seatNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500 uppercase">Total</p>
                      <p className="text-2xl font-black text-gradient">₹{movie.price}</p>
                    </div>
                    <button onClick={handleCheckout} disabled={paying} className="btn-primary text-sm px-6 py-3 whitespace-nowrap">
                      {paying ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Redirecting…</span> : '💳 Pay with Stripe'}
                    </button>
                  </div>
                </div>
                <div className="mt-4 pt-4 text-xs text-gray-600 flex items-center gap-2" style={{borderTop:'1px solid rgba(255,255,255,0.05)'}}>
                  <span className="text-green-400">🔒</span> 256-bit SSL · Powered by Stripe · No card data stored on our servers
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
