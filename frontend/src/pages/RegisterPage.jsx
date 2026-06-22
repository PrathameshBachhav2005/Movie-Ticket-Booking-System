import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import * as Icons from "lucide-react";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault(); setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0] || 'Registration failed.');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-scale-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg animate-float" style={{background:'linear-gradient(135deg,#ec4899,#7c3aed)'}}>
                <span ><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXVzZXItbG9jay1pY29uIGx1Y2lkZS11c2VyLWxvY2siPjxwYXRoIGQ9Ik0xOSAxNnYtMmEyIDIgMCAwIDAtNCAwdjIiLz48cGF0aCBkPSJNOS41IDE1SDdhNCA0IDAgMCAwLTQgNHYyIi8+PGNpcmNsZSBjeD0iMTAiIGN5PSI3IiByPSI0Ii8+PHJlY3QgeD0iMTMiIHk9IjE2IiB3aWR0aD0iOCIgaGVpZ2h0PSI1IiByeD0iLjg5OSIvPjwvc3ZnPg==" alt="New User" /></span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
          <p className="text-gray-500 text-sm">Join CineBook and start booking</p>
        </div>
        <div className="card p-8">
          {error && <div className="text-red-400 text-sm px-4 py-3 rounded-xl mb-6" style={{background:'rgba(239,68,68,0.10)',border:'1px solid rgba(239,68,68,0.20)'}}>{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            {[{name:'username',type:'text',label:'Username',ph:'cinephile99'},{name:'email',type:'email',label:'Email',ph:'you@example.com'},{name:'password',type:'password',label:'Password',ph:'Min. 6 characters'}].map(({name,type,label,ph}) => (
              <div key={name}>
                <label className="block text-xs text-gray-400 font-medium mb-2 uppercase tracking-wider">{label}</label>
                <input name={name} type={type} required value={form[name]} onChange={e => setForm(p => ({...p,[name]:e.target.value}))} placeholder={ph} className="input-field" />
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary w-full text-sm py-3.5 mt-2">
              {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating…</span> : 'Create Account →'}
            </button>
          </form>
          <p className="text-center text-gray-500 text-sm mt-6">Already a member? <Link to="/login" className="text-violet-400 hover:text-violet-300 font-semibold">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
