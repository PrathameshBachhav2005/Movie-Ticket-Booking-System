import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0] || 'Login failed.');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-scale-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg animate-float" style={{background:'linear-gradient(135deg,#7c3aed,#ec4899)'}}>
            <span ><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXVzZXItcm91bmQta2V5LWljb24gbHVjaWRlLXVzZXItcm91bmQta2V5Ij48cGF0aCBkPSJNMTkgMTF2NiIvPjxwYXRoIGQ9Ik0xOSAxM2gyIi8+PHBhdGggZD0iTTIgMjFhOCA4IDAgMCAxIDEyLjg2OC02LjM0OSIvPjxjaXJjbGUgY3g9IjEwIiBjeT0iOCIgcj0iNSIvPjxjaXJjbGUgY3g9IjE5IiBjeT0iMTkiIHI9IjIiLz48L3N2Zz4=" alt="Login" /></span>

          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-gray-500 text-sm">Sign in to continue booking</p>
        </div>
        <div className="card p-8">
          {error && <div className="text-red-400 text-sm px-4 py-3 rounded-xl mb-6" style={{background:'rgba(239,68,68,0.10)',border:'1px solid rgba(239,68,68,0.20)'}}>{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs text-gray-400 font-medium mb-2 uppercase tracking-wider">Email</label>
              <input name="email" type="email" required value={form.email} onChange={e => setForm(p => ({...p,email:e.target.value}))} placeholder="you@example.com" className="input-field" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 font-medium mb-2 uppercase tracking-wider">Password</label>
              <input name="password" type="password" required value={form.password} onChange={e => setForm(p => ({...p,password:e.target.value}))} placeholder="••••••••" className="input-field" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full text-sm py-3.5 mt-2">
              {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in…</span> : 'Sign In →'}
            </button>
          </form>
          <p className="text-center text-gray-500 text-sm mt-6">No account? <Link to="/register" className="text-violet-400 hover:text-violet-300 font-semibold">Create one</Link></p>
        </div>
      </div>
    </div>
  );
}
