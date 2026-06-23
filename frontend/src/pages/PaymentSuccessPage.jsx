import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios.js';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState('loading');
  const [booking, setBooking] = useState(null);
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    if (!sessionId) { setStatus('error'); setErrMsg('No session ID in URL.'); return; }
    api.get(`/payment/verify/${sessionId}`)
      .then(r => { setBooking(r.data.booking); setStatus('success'); })
      .catch(e => { setStatus('error'); setErrMsg(e.response?.data?.message || 'Verification failed.'); });
  }, [sessionId]);

  if (status === 'loading') return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
      <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">Confirming your payment…</p>
    </div>
  );

  if (status === 'error') return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="text-5xl mb-4">❌</div>
      <h2 className="text-xl font-bold text-white mb-2">Verification failed</h2>
      <p className="text-gray-400 text-sm mb-6">{errMsg}</p>
      <Link to="/" className="btn-primary text-sm px-6 py-3">Back to Movies</Link>
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 py-12">
      <div className="w-full max-w-md animate-scale-in">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 shadow-xl animate-float" style={{background:'linear-gradient(135deg,#10b981,#059669)',boxShadow:'0 0 40px rgba(16,185,129,0.30)'}}>✓</div>
          <h1 className="text-2xl font-black text-white mb-2">Payment successful!</h1>
          <p className="text-gray-500 text-sm">Your ticket is confirmed. Enjoy the show! 🍿</p>
        </div>

        <div className="card p-6 relative overflow-hidden" style={{border:'1px solid rgba(16,185,129,0.20)'}}>
          <div className="absolute inset-0 pointer-events-none" style={{background:'linear-gradient(135deg,rgba(16,185,129,0.05),transparent)'}} />
          <div className="flex items-center gap-3 mb-5 pb-5" style={{borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0" style={{background:'rgba(255,255,255,0.05)'}}>
              {booking?.moviePoster && <img src={booking.moviePoster} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />}
            </div>
            <div>
              <p className="font-bold text-white">{booking?.movieTitle}</p>
              <p className="text-gray-400 text-xs mt-0.5">Seat #{booking?.seatNumber ?? booking?.seatId}</p>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            {[
              { label:'Booking ID', value:`#${booking?.id}` },
              { label:'Seat', value:`Seat ${booking?.seatId}` },
              { label:'Amount Paid', value:`₹${booking?.price}`, cls:'text-gradient text-base font-black' },
              { label:'Status', value:'✓ Confirmed', cls:'text-emerald-400 font-semibold' },
            ].map(({ label, value, cls }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-gray-500">{label}</span>
                <span className={cls || 'text-white font-semibold'}>{value}</span>
              </div>
            ))}
          </div>
          <p className="mt-5 pt-5 text-center text-xs text-gray-600" style={{borderTop:'1px solid rgba(255,255,255,0.05)'}}>
            Powered by Stripe · Session: {sessionId?.slice(0,28)}…
          </p>
        </div>

        <div className="flex gap-3 mt-6">
          <Link to="/bookings" className="flex-1 text-center btn-ghost text-sm py-3">View All Tickets</Link>
          <Link to="/" className="flex-1 text-center btn-primary text-sm py-3">Book Another</Link>
        </div>
      </div>
    </div>
  );
}
