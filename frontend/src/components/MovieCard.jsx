import { Link } from 'react-router-dom';

export default function MovieCard({ movie, index = 0 }) {
  return (
    <Link to={`/movies/${movie.id}`} className="group block animate-fade-up" style={{ animationDelay: `${index * 80}ms` }}>
      <div className="card overflow-hidden hover:border-violet-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl" style={{boxShadow:'hover:0 20px 40px rgba(124,58,237,0.15)'}}>
        <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
          <img src={movie.posterImage} alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
          <div className="w-full h-full bg-gradient-to-br from-violet-900/60 to-gray-900 items-center justify-center text-5xl hidden absolute inset-0" aria-hidden="true">🎬</div>
          <div className="absolute inset-0" style={{background:'linear-gradient(to top,rgba(0,0,0,0.7) 0%,transparent 50%)'}} />
          <div className="absolute top-3 left-3 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider" style={{background:'linear-gradient(135deg,#7c3aed,#ec4899)'}}>
            {movie.genre?.split(' / ')[0]}
          </div>
          <div className="absolute top-3 right-3 flex items-center gap-1 text-yellow-400 text-xs font-bold px-2.5 py-1 rounded-full" style={{background:'rgba(0,0,0,0.6)'}}>
            ★ {movie.rating}
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-white text-base mb-1 line-clamp-1 group-hover:text-gradient transition-all">{movie.title}</h3>
          <p className="text-gray-500 text-xs mb-3 line-clamp-2 leading-relaxed">{movie.description}</p>
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
            <span>⏱ {movie.duration}</span>
            <span>🌐 {movie.language}</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">from</p>
              <p className="text-violet-400 font-bold text-base">₹{movie.price}</p>
            </div>
            <div className="btn-primary text-xs px-4 py-2">Book Now →</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
