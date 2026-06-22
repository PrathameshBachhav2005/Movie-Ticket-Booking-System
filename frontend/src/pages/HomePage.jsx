import { useEffect, useState, useMemo } from 'react';
import api from '../api/axios.js';
import MovieCard from '../components/MovieCard.jsx';

function Skeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton h-48 w-full" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-5 w-3/4 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="flex justify-between pt-2">
          <div className="skeleton h-6 w-16 rounded" />
          <div className="skeleton h-8 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [lang, setLang] = useState('All');

  useEffect(() => {
    api.get('/movies')
      .then(r => setMovies(r.data.movies || []))
      .catch(() => setError('Failed to load movies. Make sure the backend is running on port 8080.'))
      .finally(() => setLoading(false));
  }, []);

  const languages = useMemo(() => {
    const set = new Set(movies.map(m => m.language));
    return ['All', ...Array.from(set).sort()];
  }, [movies]);

  const filtered = useMemo(() => {
    return movies.filter(m => {
      const matchSearch = m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.genre.toLowerCase().includes(search.toLowerCase());
      const matchLang = lang === 'All' || m.language === lang;
      return matchSearch && matchLang;
    });
  }, [movies, search, lang]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
      <div className="text-center mb-10 animate-fade-up">
        <div className="inline-flex items-center gap-2 text-violet-400 text-xs font-semibold px-4 py-2 rounded-full mb-6 uppercase tracking-wider"
          style={{background:'rgba(124,58,237,0.10)',border:'1px solid rgba(124,58,237,0.20)'}}>
          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
          Now Showing · {movies.length} Movies
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
          <span className="text-white">Your next </span>
          <span className="text-gradient">cinematic</span>
          <span className="text-white"> experience</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          Pick a movie, choose your seat, and pay securely in seconds.
        </p>
      </div>

      {!loading && movies.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-8 animate-fade-up">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search movies "
              className="input-field pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {languages.map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={lang === l
                  ? {background:'linear-gradient(135deg,#7c3aed,#ec4899)',color:'#fff'}
                  : {background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.10)',color:'#9ca3af'}}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-md mx-auto mb-8 text-red-400 text-sm px-5 py-4 rounded-2xl text-center"
          style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.20)'}}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-gray-400 font-medium">No movies match your search.</p>
          <button onClick={() => { setSearch(''); setLang('All'); }} className="mt-4 btn-ghost text-sm px-6 py-2.5">Clear filters</button>
        </div>
      ) : (
        <>
          <p className="text-gray-500 text-sm mb-5">
            Showing <span className="text-white font-semibold">{filtered.length}</span> of {movies.length} movies
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((m, i) => <MovieCard key={m.id} movie={m} index={i} />)}
          </div>
        </>
      )}
    </main>
  );
}
