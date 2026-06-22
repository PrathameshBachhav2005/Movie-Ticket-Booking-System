export default function SeatGrid({ seats, selectedSeat, onSelect, currentUserId }) {
  if (!seats || seats.length === 0) return <p className="text-gray-500 text-center py-8">No seats available.</p>;

  const available = seats.filter(s => !s.isBooked).length;

  return (
    <div className="animate-fade-up">
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        {[
          { style:'background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15)', label:'Available' },
          { style:'background:linear-gradient(135deg,#7c3aed,#ec4899);border:none', label:'Selected' },
          { style:'background:rgba(239,68,68,0.20);border:1px solid rgba(239,68,68,0.30)', label:'Booked' },
          { style:'background:rgba(16,185,129,0.20);border:1px solid rgba(16,185,129,0.30)', label:'Yours' },
        ].map(({ style, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md" style={{ [style.includes(';') ? 'cssText' : 'background']: style }} />
            <span className="text-xs text-gray-400">{label}</span>
          </div>
        ))}
        <span className="ml-auto text-xs text-gray-500">
          <span className="text-emerald-400 font-semibold">{available}</span> / {seats.length} free
        </span>
      </div>

      <div className="mb-6 text-center">
        <div className="h-1.5 rounded-full mx-auto max-w-xs mb-1" style={{background:'linear-gradient(90deg,transparent,#7c3aed,transparent)',boxShadow:'0 0 20px rgba(124,58,237,0.4)'}} />
        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Screen</p>
      </div>

      <div className="grid grid-cols-5 gap-2.5 max-w-xs mx-auto">
        {seats.map((seat) => {
          const mine = seat.isBooked && seat.bookedBy === currentUserId;
          const booked = seat.isBooked && !mine;
          const selected = selectedSeat === seat.id;

          let style = {};
          let cls = 'w-full aspect-square rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center ';

          if (mine) {
            style = { background:'rgba(16,185,129,0.30)', border:'1px solid rgba(16,185,129,0.50)', color:'#6ee7b7', cursor:'default' };
          } else if (booked) {
            style = { background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.25)', color:'rgba(239,68,68,0.5)', cursor:'not-allowed' };
          } else if (selected) {
            style = { background:'linear-gradient(135deg,#7c3aed,#ec4899)', border:'1px solid #a78bfa', color:'#fff', transform:'scale(1.12)', boxShadow:'0 0 20px rgba(124,58,237,0.5)' };
          } else {
            style = { background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.10)', color:'#9ca3af', cursor:'pointer' };
          }

          return (
            <button key={seat.id} style={style} className={cls}
              onClick={() => !booked && !mine && onSelect(seat.id)}
              onMouseEnter={(e) => { if (!booked && !mine && !selected) { e.currentTarget.style.background='rgba(124,58,237,0.20)'; e.currentTarget.style.borderColor='rgba(124,58,237,0.50)'; e.currentTarget.style.color='#fff'; } }}
              onMouseLeave={(e) => { if (!booked && !mine && !selected) { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.10)'; e.currentTarget.style.color='#9ca3af'; } }}
              disabled={booked || mine}
              aria-label={`Seat ${seat.id}`}>
              {mine ? '✓' : seat.id}
            </button>
          );
        })}
      </div>
    </div>
  );
}
