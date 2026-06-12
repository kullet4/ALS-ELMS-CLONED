import { StudentTab } from '../types';

interface StudentProgressProps {
  onTabChange: (tab: StudentTab) => void;
  coins: number;
}

export default function StudentProgress({ onTabChange, coins }: StudentProgressProps) {
  const weeklyData = [
    { day: 'M', label: 'Mon', completion: 40, active: false },
    { day: 'T', label: 'Tue', completion: 65, active: false },
    { day: 'W', label: 'Wed', completion: 55, active: false },
    { day: 'T', label: 'Today', completion: 90, active: true },
    { day: 'F', label: 'Fri', completion: 15, active: false },
    { day: 'S', label: 'Sat', completion: 0, active: false },
    { day: 'S', label: 'Sun', completion: 0, active: false }
  ];

  return (
    <div className="space-y-6">
      
      {/* Encouragement Banner */}
      <section className="animate-in fade-in slide-in-from-bottom duration-300">
        <div className="bg-[#ffeddf] text-[#8b5000] p-6 rounded-2xl border border-amber-250 flex flex-col md:flex-row items-center gap-6 shadow-sm">
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-md animate-bounce shrink-0 text-[#FF9800]">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>celebration</span>
          </div>
          <div className="text-center md:text-left flex-1">
            <h2 className="text-xl font-extrabold mb-0.5">You&apos;re doing great!</h2>
            <p className="text-xs font-medium text-[#8b5000]/90">
              Your wallet is growing! Keep completing lessons to earn more <span className="font-bold">Coins</span> and unlock new modules.
            </p>
          </div>
          <button 
            onClick={() => onTabChange('lessons')}
            className="bg-[#FF9800] hover:bg-[#E68A00] text-white px-5 py-2.5 rounded-full font-bold text-xs transition-transform active:scale-95 shadow-sm"
          >
            Browse Lessons
          </button>
        </div>
      </section>

      {/* Progress Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Experience & Level Journey bar-chart container */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-[#526069] flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500 font-bold">payments</span>
              Weekly Coins Earned
            </h3>
            <div className="bg-amber-50 text-amber-800 border border-amber-100 text-xs font-extrabold px-3.5 py-1 rounded-full shrink-0 shadow-sm">
              {coins} Coins Total
            </div>
          </div>

          <div className="relative h-44 w-full flex items-end justify-between gap-3 px-2">
            {weeklyData.map((data) => (
              <div key={data.label} className="w-full bg-slate-100 rounded-t-full h-full relative group flex flex-col justify-end">
                {/* Visual bar container */}
                <div 
                  className={`relative w-full rounded-t-full transition-all duration-700 ease-out cursor-pointer ${
                    data.active 
                      ? 'bg-gradient-to-t from-amber-500 to-yellow-400 shadow-sm' 
                      : 'bg-amber-200 hover:bg-amber-300'
                  }`} 
                  style={{ height: `${data.completion}%` }}
                >
                  {/* Tooltip on Hover */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white font-bold text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow z-10 whitespace-nowrap">
                    {Math.round(data.completion * 1.5)} Coins gained
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-between text-xs font-bold text-slate-400 px-1">
            <span>M</span><span>T</span><span>W</span><span className="text-amber-600 font-black underline decoration-2">T</span><span>F</span><span>S</span><span>S</span>
          </div>
        </div>

        {/* Stats Summary Card */}
        <div className="bg-amber-50/50 rounded-2xl p-6 border border-amber-100 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-4">Coin Ledger & Activity</h3>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#FF9800] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                <div className="flex flex-col">
                  <span className="text-xl font-extrabold leading-none">12</span>
                  <span className="text-[11px] font-bold text-slate-500 mt-0.5">Day Streak</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-3xl select-none">🪙</span>
                <div className="flex flex-col">
                  <span className="text-xl font-extrabold leading-none">{coins}</span>
                  <span className="text-[11px] font-bold text-slate-500 mt-0.5">Coins Earned</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white/80 rounded-xl border border-amber-100 shrink-0">
            <p className="text-xs italic text-slate-500 leading-relaxed">
              &quot;The beautiful thing about learning is that no one can take it away from you.&quot;
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
