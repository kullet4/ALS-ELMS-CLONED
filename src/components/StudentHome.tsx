import { AVATAR_URLS } from '../data';
import { StudentTab, UserAccount } from '../types';

interface StudentHomeProps {
  onTabChange: (tab: StudentTab) => void;
  coins: number;
  streakDays: number;
  currentUser?: UserAccount;
}

export default function StudentHome({ onTabChange, coins, streakDays, currentUser }: StudentHomeProps) {
  // Let's compute coin Milestone info dynamically
  const coinMilestoneGoal = 1050; // A milestone to unlock bonus material
  const progressPercent = Math.min(100, Math.round((coins / coinMilestoneGoal) * 100));
  const remainingCoins = Math.max(0, coinMilestoneGoal - coins);

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <section className="bg-slate-50 py-2">
        <h1 className="text-3xl font-extrabold text-[#526069] tracking-tight">
          Hi, {currentUser ? currentUser.name.split(' ')[0] : 'Learner'}!
        </h1>
        <p className="text-base text-slate-500 mt-1">Ready to learn today? You&apos;re doing a great job!</p>
        {(currentUser?.section || (currentUser?.subjects && currentUser.subjects.length > 0)) && (
          <div className="flex flex-wrap gap-2 mt-2">
            {currentUser?.section && (
              <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-indigo-100">
                <span className="material-symbols-outlined text-xs">group</span>
                {currentUser.section}
              </span>
            )}
            {currentUser?.subjects?.map(sub => (
              <span key={sub} className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-200">
                {sub}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Continue Learning Card */}
        <div className="lg:col-span-8">
          <div className="bg-sky-50 dark:bg-[#e3f2fd] rounded-2xl p-6 border border-sky-100 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden h-full">
            <div className="flex-1 relative z-10">
              <span className="text-xs font-bold text-sky-700 uppercase tracking-widest block mb-1">Continue Learning</span>
              <h2 className="text-2xl font-black text-slate-800 mb-1 leading-tight">Basic Addition</h2>
              <p className="text-sm text-slate-500 mb-6">Module 2 • Lesson 4 of 12</p>
              
              <button 
                onClick={() => onTabChange('learning')}
                className="bg-[#FF9800] hover:bg-[#E68A00] text-white px-6 py-3 rounded-xl flex items-center gap-3 font-semibold text-sm transition-all shadow-md active:scale-95"
              >
                <span className="material-symbols-outlined fill-icon" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                Keep Going
              </button>
            </div>

            <div className="w-full md:w-44 aspect-square rounded-2xl bg-white flex items-center justify-center p-3 shrink-0 shadow-sm relative z-10 transition-transform duration-300 hover:scale-105">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKQy5qx5_oRfgyzUOTKK65y9XdbTd7Vc2OCIKt3g4AgQy1ZTnipl94_t9zebGGyX20ShgLexm2gPfjDk6qtyzL7rBwozVuGJF8-OOTMo_sHDXqlF02VSIDkkRO6pnS63uK9jHZS4CdPINz8sPIDxtuN-etkl0w08YiooCwbzHhg0ZUu-vyMtYNn7jP1rcUSdHyDmv8NXzYt8c_kuPvcOoUoIX6cO9C-IkVYFGMwxI_kIyKnbKsWRNd6TDJG2H5URHy6ZoTg20oGIU" 
                alt="Basic Addition visual" 
                className="max-h-full object-contain"
              />
            </div>

            {/* Backdrop Blur Ring */}
            <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-sky-200/40 rounded-full blur-3xl"></div>
          </div>
        </div>

        {/* Progress Summary Card */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 flex flex-col justify-between h-full shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 tracking-wider">YOUR BALANCE</span>
              <span className="material-symbols-outlined text-amber-500 font-bold">savings</span>
            </div>

            <div className="flex flex-col items-center text-center mb-4">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-2 shadow-inner border border-amber-200">
                <span className="text-3xl select-none">🪙</span>
              </div>
              <h3 className="text-xl font-black text-slate-800">{coins} Coins</h3>
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">WALLET BALANCE</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>Milestone Goal Progress</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <p className="text-[11px] font-medium text-slate-400 mt-1">
                {remainingCoins} Coins to next Milestone ({coins} / {coinMilestoneGoal} 🪙)
              </p>
            </div>
          </div>
        </div>

        {/* Learning Tips / Daily Goal */}
        <div className="lg:col-span-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Daily Tip card */}
            <div className="bg-[#ffeddf]/65 rounded-2xl p-5 border border-amber-100 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-white rounded-full flex-shrink-0 flex items-center justify-center text-[#8b5000] shadow-sm">
                <span className="material-symbols-outlined text-lg">lightbulb</span>
              </div>
              <div>
                <h4 className="font-bold text-xs text-[#8b5000] uppercase tracking-wider mb-1">Daily Tip</h4>
                <p className="text-xs text-[#8b5000]/90 leading-relaxed">
                  Taking a 5-minute break helps your brain remember more of what you&apos;ve learned! ✨
                </p>
              </div>
            </div>

            {/* Daily Goal card */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#526069] rounded-full flex-shrink-0 flex items-center justify-center text-white shadow-sm">
                  <span className="material-symbols-outlined text-lg">target</span>
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-0.5">Daily Goal</h4>
                  <p className="text-sm font-semibold text-slate-700">25 / 30 Minutes Study</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#526069] scale-125" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
