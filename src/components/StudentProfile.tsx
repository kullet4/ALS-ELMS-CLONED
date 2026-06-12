import React, { useState } from 'react';
import { UserAccount } from '../types';

interface StudentProfileProps {
  currentUser?: UserAccount;
}

export default function StudentProfile({ currentUser }: StudentProfileProps) {
  const [goals, setGoals] = useState([
    { id: 'g1', text: 'Finish Math Module 1 by Friday', completed: true },
    { id: 'g2', text: 'Complete 2 Science Quizzes', completed: false },
    { id: 'g3', text: 'Review 3 math study exercises with colleagues', completed: false }
  ]);
  const [newGoalText, setNewGoalText] = useState('');
  const [language, setLanguage] = useState<'english' | 'philippines'>('english');
  const [receiveAlerts, setReceiveAlerts] = useState(true);

  const toggleGoal = (id: string) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  };

  const addGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    setGoals(prev => [
      ...prev,
      { id: Date.now().toString(), text: newGoalText.trim(), completed: false }
    ]);
    setNewGoalText('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header card representing Profile */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex-shrink-0 flex items-center justify-center text-indigo-700 relative shadow-sm">
          <span className="text-2xl font-black">
            {currentUser ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2) : '?'}
          </span>
          <div className="absolute right-0 bottom-0 bg-emerald-500 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center animate-pulse"></div>
        </div>
        <div className="text-center sm:text-left flex-1">
          <h3 className="text-2xl font-black text-slate-800 leading-none">{currentUser?.name ?? 'Student Learner'}</h3>
          <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider mt-1.5">{currentUser?.desc ?? 'ALS Alternative Secondary Pathway'}</p>
          <p className="text-xs text-slate-400 mt-1">Student Learner • Joined April 2026</p>
          {(currentUser?.section || currentUser?.gradeLevel || (currentUser?.subjects && currentUser.subjects.length > 0)) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {currentUser?.section && (
                <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-indigo-100">
                  <span className="material-symbols-outlined text-xs">group</span>
                  {currentUser.section}
                </span>
              )}
              {currentUser?.gradeLevel && (
                <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-purple-100">
                  <span className="material-symbols-outlined text-xs">school</span>
                  Grade Level {currentUser.gradeLevel}
                </span>
              )}
              {currentUser?.subjects?.map(sub => (
                <span key={sub} className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-200">
                  {sub}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Goal management card */}
      <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-800">Your Learning Goals</h3>
          <span className="text-xs font-bold text-[#8b5000] bg-[#ffeddf] px-2.5 py-1 rounded-full pb-1 text-center shrink-0">
            {goals.filter(g => g.completed).length} of {goals.length} Finished
          </span>
        </div>

        <div className="space-y-2">
          {goals.map((g) => (
            <div 
              key={g.id}
              onClick={() => toggleGoal(g.id)}
              className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100/75 cursor-pointer transition-colors"
            >
              <span className={`material-symbols-outlined text-xl transition-all ${g.completed ? 'text-emerald-500 scale-110 fill-icon' : 'text-slate-400'}`}>
                {g.completed ? 'check_box' : 'check_box_outline_blank'}
              </span>
              <span className={`text-sm font-semibold transition-all ${g.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                {g.text}
              </span>
            </div>
          ))}
        </div>

        {/* Goal input form */}
        <form onSubmit={addGoal} className="flex gap-2">
          <input 
            type="text"
            value={newGoalText}
            onChange={(e) => setNewGoalText(e.target.value)}
            placeholder="Type a new goal (e.g. 'Read 3 plant lessons')"
            className="flex-1 bg-slate-100 hover:bg-slate-150 border-0 focus:ring-2 focus:ring-indigo-500 rounded-xl p-3 text-sm outline-none transition-all placeholder:text-slate-400"
          />
          <button 
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 rounded-xl transition-all shadow-sm shrink-0 active:scale-95"
          >
            Add Goal
          </button>
        </form>
      </section>

      {/* Language, Preferences & Utilities */}
      <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Language setting option */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-sm text-slate-800">Portal Language</h4>
          <p className="text-xs text-slate-400">Select language for notifications, prompts, and menus.</p>
          
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => setLanguage('english')}
              className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                language === 'english' 
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 ring-2 ring-indigo-500' 
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-55'
              }`}
            >
              🇺🇸 English
            </button>
            <button 
              onClick={() => setLanguage('philippines')}
              className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                language === 'philippines' 
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 ring-2 ring-indigo-500' 
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-55'
              }`}
            >
              🇵🇭 Tagalog
            </button>
          </div>
        </div>

        {/* Access Preferences */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-sm text-slate-800">Privacy & Reports</h4>
          <p className="text-xs text-slate-400">Configure notifications of milestones accomplished.</p>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <div>
                <span className="text-xs font-extrabold text-slate-700 block">Weekly Email Summary</span>
                <span className="text-[10px] text-slate-400">Instructors receive weekly progress report</span>
              </div>
              <button 
                onClick={() => setReceiveAlerts(!receiveAlerts)}
                className={`w-11 h-6 rounded-full flex items-center transition-colors p-1 ${receiveAlerts ? 'bg-emerald-500 justify-end' : 'bg-slate-300 justify-start'}`}
              >
                <div className="w-4 h-4 bg-white rounded-full shadow-md"></div>
              </button>
            </div>
          </div>
        </div>

      </section>

    </div>
  );
}
