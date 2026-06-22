import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  function handleLogout() { logout(); navigate('/'); setOpen(false); }
  const active = (p) => location.pathname === p;

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-lg" >

            <span ><img src="data:image/svg+xml;utf8,%3Csvg%20width%3D%22400%22%20height%3D%22120%22%20viewBox%3D%220%200%20400%20120%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%20%20%3Cdefs%3E%0A%20%20%20%20%3ClinearGradient%20id%3D%22grad%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23FF2D75%22%3E%3C%2Fstop%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%238A2BE2%22%3E%3C%2Fstop%3E%0A%20%20%20%20%3C%2FlinearGradient%3E%0A%0A%20%20%20%20%3ClinearGradient%20id%3D%22playGrad%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23FF7A18%22%3E%3C%2Fstop%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23FF2D75%22%3E%3C%2Fstop%3E%0A%20%20%20%20%3C%2FlinearGradient%3E%0A%20%20%3C%2Fdefs%3E%0A%0A%20%20%3C!--%20Logo%20Icon%20--%3E%0A%20%20%3Cg%20transform%3D%22translate(20%2C20)%22%3E%0A%20%20%20%20%3C!--%20M%20Shape%20--%3E%0A%20%20%20%20%3Cpath%20d%3D%22M0%2010C0%204.5%204.5%200%2010%200H30L50%2020L70%200H90C95.5%200%20100%204.5%20100%2010V70C100%2075.5%2095.5%2080%2090%2080H10C4.5%2080%200%2075.5%200%2070V10Z%22%20fill%3D%22url(%23grad)%22%3E%3C%2Fpath%3E%0A%0A%20%20%20%20%3C!--%20Ticket%20--%3E%0A%20%20%20%20%3Crect%20x%3D%2220%22%20y%3D%2222%22%20width%3D%2260%22%20height%3D%2236%22%20rx%3D%228%22%20fill%3D%22%23111827%22%3E%3C%2Frect%3E%0A%0A%20%20%20%20%3C!--%20Perforation%20--%3E%0A%20%20%20%20%3Ccircle%20cx%3D%2220%22%20cy%3D%2240%22%20r%3D%225%22%20fill%3D%22url(%23grad)%22%3E%3C%2Fcircle%3E%0A%20%20%20%20%3Ccircle%20cx%3D%2280%22%20cy%3D%2240%22%20r%3D%225%22%20fill%3D%22url(%23grad)%22%3E%3C%2Fcircle%3E%0A%0A%20%20%20%20%3C!--%20Play%20Button%20--%3E%0A%20%20%20%20%3Cpolygon%20points%3D%2242%2C30%2042%2C50%2058%2C40%22%20fill%3D%22url(%23playGrad)%22%3E%3C%2Fpolygon%3E%0A%20%20%3C%2Fg%3E%0A%0A%20%20%3C!--%20Brand%20Text%20--%3E%0A%20%20%3Ctext%20x%3D%22150%22%20y%3D%2260%22%20font-family%3D%22Poppins%2C%20Arial%2C%20sans-serif%22%20font-size%3D%2242%22%20font-weight%3D%22700%22%20fill%3D%22%23111827%22%3E%0A%20%20%20%20MOVIX%0A%20%20%3C%2Ftext%3E%0A%0A%20%20%3Ctext%20x%3D%22152%22%20y%3D%2288%22%20font-family%3D%22Poppins%2C%20Arial%2C%20sans-serif%22%20font-size%3D%2214%22%20letter-spacing%3D%223%22%20fill%3D%22%236B7280%22%3E%0A%20%20%20%20MOVIES%20%E2%80%A2%20YOUR%20WAY%0A%20%20%3C%2Ftext%3E%0A%3C%2Fsvg%3E" alt="Movie Max" style={{ maxWidth: "520%" }}/></span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${active('/') ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>Movies</Link>
            {isLoggedIn && <Link to="/bookings" className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${active('/bookings') ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>My Tickets</Link>}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-xl">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold uppercase" style={{background:'linear-gradient(135deg,#7c3aed,#ec4899)'}}>
                    {user?.username?.[0]}
                  </div>
                  <span className="text-sm font-medium text-gray-200">{user?.username}</span>
                </div>
                <button onClick={handleLogout} className="px-4 py-1.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-all" style={{border:'1px solid rgba(255,255,255,0.10)'}}>Sign out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-1.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-colors">Sign in</Link>
                <Link to="/register" className="btn-primary text-sm px-5 py-2">Get Started</Link>
              </>
            )}
          </div>

          <button className="md:hidden glass p-2 rounded-xl" onClick={() => setOpen(!open)} aria-label="Menu">
            <div className="w-5 space-y-1"><div className="h-0.5 bg-gray-300" /><div className="h-0.5 bg-gray-300" /><div className="h-0.5 bg-gray-300" /></div>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden glass border-t border-white/5 px-4 py-4 space-y-1 animate-fade-up">
          <Link to="/" onClick={() => setOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/5">Movies</Link>
          {isLoggedIn && <Link to="/bookings" onClick={() => setOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/5">My Tickets</Link>}
          {isLoggedIn
            ? <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10">Sign out</button>
            : <div className="flex gap-2 pt-2">
                <Link to="/login" onClick={() => setOpen(false)} className="flex-1 text-center btn-ghost text-sm py-2.5">Sign in</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="flex-1 text-center btn-primary text-sm py-2.5">Register</Link>
              </div>
          }
        </div>
      )}
    </nav>
  );
}
