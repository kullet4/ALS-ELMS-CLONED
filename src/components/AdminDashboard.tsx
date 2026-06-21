import React, { useState } from 'react';
import { UserAccount, PortalType } from '../types';

interface AdminDashboardProps {
  accounts: UserAccount[];
  onAddAccount: (account: UserAccount) => void;
  onRemoveAccount: (email: string) => Promise<boolean>;
}

export default function AdminDashboard({
  accounts,
  onAddAccount,
  onRemoveAccount
}: AdminDashboardProps) {
  const [logMessages, setLogMessages] = useState<string[]>([
    "System check: All 14 remote learning databases synchronized successfully.",
    "Database backup completed. Next automated checkpoint scheduled in 12 hours."
  ]);
  const [notification, setNotification] = useState<string | null>(null);

  // Dynamic user account creation states
  const [newAccName, setNewAccName] = useState('');
  const [newAccEmail, setNewAccEmail] = useState('');
  const [newAccPassword, setNewAccPassword] = useState('password');
  const [newAccRole, setNewAccRole] = useState<PortalType>('student');
  const [newAccDesc, setNewAccDesc] = useState('');
  const [newAccSection, setNewAccSection] = useState('');
  const [newAccGrade, setNewAccGrade] = useState<number | ''>('');
  const [newAccSubjects, setNewAccSubjects] = useState<string[]>([]);

  const ALS_SUBJECTS = [
    { value: 'LS1 English - Communication Skills', label: '🗣️ LS1 English - Communication Skills' },
    { value: 'LS1 Filipino - Communication Skills', label: '📖 LS1 Filipino - Communication Skills' },
    { value: 'LS2 Science - Scientific Literacy', label: '🧪 LS2 Science - Scientific Literacy' },
    { value: 'LS3 Mathematics - Problem Solving', label: '🔢 LS3 Mathematics - Problem Solving' },
    { value: 'LS4 Life and Career Skills', label: '🛠️ LS4 Life and Career Skills' },
    { value: 'LS5 Understanding Culture and Society', label: '🌏 LS5 Understanding Culture and Society' },
    { value: 'LS6 Digital Literacy', label: '💻 LS6 Digital Literacy' },
  ];

  const toggleSubject = (value: string) => {
    setNewAccSubjects(prev =>
      prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value]
    );
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName.trim() || !newAccEmail.trim()) {
      setNotification('Please enter a valid name and email address. ⚠️');
      return;
    }

    if (accounts.some(acc => acc.email.toLowerCase() === newAccEmail.trim().toLowerCase())) {
      setNotification('An identity with that email address is already registered. ⚠️');
      return;
    }

    const defaultAvatars: Record<PortalType, string> = {
      student: '🎓',
      teacher: '🧑‍🏫',
      admin: '🏢'
    };

    const defaultDescs: Record<PortalType, string> = {
      student: 'ALS Alternative Secondary Learner',
      teacher: 'Regional Instructor (Region IV-A)',
      admin: 'Regional Operations Director'
    };

    const newAccount: UserAccount = {
      name: newAccName.trim(),
      email: newAccEmail.trim().toLowerCase(),
      role: newAccRole,
      label: `${newAccName.trim()} (${newAccRole.charAt(0).toUpperCase() + newAccRole.slice(1)})`,
      desc: newAccDesc.trim() || defaultDescs[newAccRole],
      avatar: defaultAvatars[newAccRole],
      password: newAccPassword || 'password',
      ...(newAccSection.trim() && { section: newAccSection.trim() }),
      ...(newAccGrade !== '' && { gradeLevel: Number(newAccGrade) }),
      ...(newAccSubjects.length > 0 && { subjects: newAccSubjects }),
    };

    onAddAccount(newAccount);
    setNewAccName('');
    setNewAccEmail('');
    setNewAccPassword('password');
    setNewAccDesc('');
    setNewAccSection('');
    setNewAccGrade('');
    setNewAccSubjects([]);

    setNotification(`Successfully registered new ${newAccRole} account for ${newAccount.name}! 🔐`);
    setLogMessages(prev => [`Created dynamic Portal RBAC identity: ${newAccount.name} (${newAccount.email}) [${newAccRole.toUpperCase()}]`, ...prev]);
  };

  return (
    <div className="space-y-6">

      {/* Welcome & Global Metadata header */}
      <div className="bg-[#1e293b] text-white p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF9800]">System Administration</span>
          <h2 className="text-2xl font-black tracking-tight leading-none mt-1">Superintendent Portal</h2>
          <p className="text-xs text-slate-400 mt-1">Regional Administrator • Alternative Learning Center Operations</p>
        </div>

        <div className="flex gap-4">
          <div className="bg-white/10 px-4 py-2 rounded-xl text-center">
            <span className="text-lg font-black block">{2548 + accounts.length}</span>
            <span className="text-[10px] font-bold text-slate-300 uppercase">Active Users</span>
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-xl text-center">
            <span className="text-lg font-black block text-indigo-400">{accounts.length}</span>
            <span className="text-[10px] font-bold text-slate-300 uppercase">Gateways</span>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center gap-3 shadow-md animate-in fade-in slide-in-from-top duration-300">
          <span className="material-symbols-outlined text-[#FF9800]">verified</span>
          <span className="text-xs font-semibold">{notification}</span>
        </div>
      )}

      {/* System Console activity logs & Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* System Console activity logs */}
        <div className="lg:col-span-2 bg-[#0f172a] text-slate-300 p-5 rounded-2xl font-mono text-[11px] shadow-sm space-y-3 border border-slate-800 h-44 overflow-y-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-1">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block"></span>
              Live Operations Terminal
            </h4>
            <span className="text-[9px] text-slate-500 uppercase font-bold">Connected</span>
          </div>
          <div className="space-y-2">
            {logMessages.map((msg, i) => (
              <p key={i} className="leading-relaxed">
                <span className="text-[#FF9800] mr-1">&gt;</span> {msg}
              </p>
            ))}
          </div>
        </div>

        {/* System Integrity / Diagnostics */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-black text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
            🔧 Operations Diagnostics
          </h3>
          <div className="space-y-3 text-[11px] font-semibold text-slate-600">
            <div className="flex items-center justify-between">
              <span>Database Sync Status</span>
              <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-black text-[9px] uppercase tracking-wider">
                Synchronized
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Gateways Guard Protocols</span>
              <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-black text-[9px] uppercase tracking-wider">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Next Checkpoint</span>
              <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-black text-[9px] font-mono">
                12h 00m
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* User Accounts & Portal Role Manager */}
      <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block bg-emerald-50 px-2 rounded-md w-fit">Authentication Guard</span>
            <h3 className="text-xl font-black text-slate-800 tracking-tight mt-1">👥 Dynamic Role-Based Account Creator</h3>
            <p className="text-xs text-slate-500 mt-1">
              Add new live identities representing students, instructors, or admins. Accounts are immediately validated across the portal gateways.
            </p>
          </div>
          <span className="text-xs font-black text-slate-600 bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200">
            {accounts.length} Active Node Gateways
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Create Account Form */}
          <div className="lg:col-span-2 bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
            <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600">person_add</span>
              Register New Profile Information
            </h4>

            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <label className="text-[11px] font-black text-slate-500 uppercase block mb-1">Full Name</label>
                <input
                  type="text"
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  placeholder="e.g. Principal Beatrice"
                  className="w-full bg-white border border-slate-200 focus:border-[#526069] rounded-xl p-3 text-xs outline-none font-semibold transition-all shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-slate-500 uppercase block mb-1">Portal Sign-in Email</label>
                <input
                  type="email"
                  value={newAccEmail}
                  onChange={(e) => setNewAccEmail(e.target.value)}
                  placeholder="e.g. beatrice@als.edu"
                  className="w-full bg-white border border-slate-200 focus:border-[#526069] rounded-xl p-3 text-xs outline-none font-semibold transition-all shadow-sm font-mono text-indigo-950"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-black text-slate-500 uppercase block mb-1">Gateway Token / Password</label>
                  <input
                    type="password"
                    value={newAccPassword}
                    onChange={(e) => setNewAccPassword(e.target.value)}
                    placeholder="password"
                    className="w-full bg-white border border-slate-200 focus:border-[#526069] rounded-xl p-3 text-xs outline-none font-semibold transition-all shadow-sm font-mono text-indigo-950"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-500 uppercase block mb-1">Designated Role</label>
                  <select
                    value={newAccRole}
                    onChange={(e) => setNewAccRole(e.target.value as PortalType)}
                    className="w-full bg-white border border-slate-200 focus:border-[#526069] rounded-xl p-3 text-xs outline-none font-bold transition-all shadow-sm"
                  >
                    <option value="student">🎓 Student / Learner</option>
                    <option value="teacher">🧑‍🏫 Instructor / Teacher</option>
                    <option value="admin">🏢 Administrator Superintendent</option>
                  </select>
                </div>
              </div>

              {/* Section, Grade Level & Subjects — shown for student & teacher */}
              {(newAccRole === 'student' || newAccRole === 'teacher') && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-black text-slate-500 uppercase block mb-1">
                        {newAccRole === 'teacher' ? 'Assigned Section' : 'Section'}
                      </label>
                      <select
                        value={newAccSection}
                        onChange={(e) => setNewAccSection(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-[#526069] rounded-xl p-3 text-xs outline-none font-bold transition-all shadow-sm"
                      >
                        <option value="">
                          {newAccRole === 'teacher' ? '— Select Assigned Section —' : '— Select Section —'}
                        </option>
                        <option value="Sampaguita">Sampaguita</option>
                        <option value="Narra">Narra</option>
                        <option value="Jasmine">Jasmine</option>
                        <option value="Rizal">Rizal</option>
                        <option value="Agila">Agila</option>
                        <option value="Mayon">Mayon</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-black text-slate-500 uppercase block mb-1">
                        {newAccRole === 'teacher' ? 'Handled Grade Level' : 'Grade Level'}
                      </label>
                      <select
                        value={newAccGrade}
                        onChange={(e) => setNewAccGrade(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 focus:border-[#526069] rounded-xl p-3 text-xs outline-none font-bold transition-all shadow-sm"
                      >
                        <option value="">
                          {newAccRole === 'teacher' ? '— Select Handled Grade —' : '— Select Grade —'}
                        </option>
                        <option value="1">Grade 1</option>
                        <option value="2">Grade 2</option>
                        <option value="3">Grade 3</option>
                        <option value="4">Grade 4</option>
                        <option value="5">Grade 5</option>
                        <option value="6">Grade 6</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-slate-500 uppercase block mb-2">
                      {newAccRole === 'teacher' ? 'Authorized Strands to Instruct/Manage' : 'Enrolled Subject Areas'}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {ALS_SUBJECTS.map((subj) => (
                        <button
                          key={subj.value}
                          type="button"
                          onClick={() => toggleSubject(subj.value)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer text-left ${
                            newAccSubjects.includes(subj.value)
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center shrink-0 ${
                            newAccSubjects.includes(subj.value) ? 'bg-white border-white' : 'border-slate-300'
                          }`}>
                            {newAccSubjects.includes(subj.value) && (
                              <span className="text-indigo-600 text-[9px] font-black leading-none">✓</span>
                            )}
                          </span>
                          {subj.label}
                        </button>
                      ))}
                    </div>
                    {newAccSubjects.length === 0 && (
                      <p className="text-[10px] text-slate-400 mt-1.5">
                        {newAccRole === 'teacher'
                          ? 'Select specific learning strands this teacher is authorized to instruct/manage.'
                          : 'Select learning strands this student is enrolled in.'}
                      </p>
                    )}
                  </div>
                </>
              )}

              <div>
                <label className="text-[11px] font-black text-slate-500 uppercase block mb-1">Official Description / Organization</label>
                <input
                  type="text"
                  value={newAccDesc}
                  onChange={(e) => setNewAccDesc(e.target.value)}
                  placeholder="Leave empty for regional defaults..."
                  className="w-full bg-white border border-slate-200 focus:border-[#526069] rounded-xl p-3 text-xs outline-none font-semibold transition-all shadow-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 font-black text-white py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">how_to_reg</span>
                Finalize Registration
              </button>
            </form>
          </div>

          {/* Active Accounts Browser */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider block">Live Gateway Accounts Index</h4>

            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
              {accounts.map((acc) => {
                const isSystemDefault = acc.email === 'alex@als.edu' || acc.email === 'marcus@als.edu' || acc.email === 'superintendent@als.edu';
                return (
                  <div key={acc.email} className="p-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-150 rounded-xl flex items-center justify-between gap-4 transition-colors">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl shadow-xs border border-slate-200 shrink-0 select-none">
                        {acc.avatar}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className="font-black text-xs text-slate-800 leading-tight truncate">
                            {acc.name}
                          </h5>
                          <span className={`px-2 py-0.5 rounded-md text-[8.5px] font-black uppercase tracking-wider ${
                            acc.role === 'admin' ? 'bg-emerald-50 text-emerald-700' :
                            acc.role === 'teacher' ? 'bg-indigo-50 text-indigo-700' :
                            'bg-amber-50 text-amber-700'
                          }`}>
                            {acc.role === 'teacher' ? 'Instructor' : acc.role}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-450 block leading-normal mt-0.5 font-semibold truncate select-all">
                          {acc.email}
                        </span>
                        <span className="text-[10px] text-slate-400 block break-words mt-0.5">
                          {acc.desc}
                        </span>
                        {/* Grade, Section & Subject badges */}
                        {(acc.gradeLevel || acc.section || (acc.subjects && acc.subjects.length > 0)) && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {acc.gradeLevel && (
                              acc.role === 'teacher' ? (
                                <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md">
                                  Handled Grade {acc.gradeLevel}
                                </span>
                              ) : (
                                <span className="bg-sky-50 text-sky-700 border border-sky-100 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md">
                                  Grade {acc.gradeLevel}
                                </span>
                              )
                            )}
                            {acc.section && (
                              acc.role === 'teacher' ? (
                                <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md">
                                  Assigned Section: {acc.section}
                                </span>
                              ) : (
                                <span className="bg-violet-50 text-violet-700 border border-violet-100 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md">
                                  {acc.section}
                                </span>
                              )
                            )}
                            {acc.subjects?.map(s => (
                              acc.role === 'teacher' ? (
                                <span key={s} className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                                  Authorized Strand: {s}
                                </span>
                              ) : (
                                <span key={s} className="bg-amber-50 text-amber-700 border border-amber-100 text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                                  {s}
                                </span>
                              )
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {!isSystemDefault ? (
                       <button
                        type="button"
                        onClick={async () => {
                          if (confirm(`Are you sure you want to remove the gateway access for ${acc.name}?`)) {
                            const success = await onRemoveAccount(acc.email);
                            if (success) {
                              setNotification(`Gateway access revoked for ${acc.name}. ✅`);
                              setLogMessages(prev => [`Revoked Portal RBAC identity: ${acc.name} (${acc.email})`, ...prev]);
                            } else {
                              setNotification(`Failed to remove ${acc.name}. Check Firestore permissions or console. ❌`);
                            }
                          }
                        }}
                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 p-2 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Revoke Credentials"
                      >
                        <span className="material-symbols-outlined text-[18px]">person_remove</span>
                      </button>
                    ) : (
                      <span className="text-[9px] font-bold text-slate-400 bg-slate-200/50 px-2 py-1 rounded select-none shrink-0 cursor-not-allowed">
                        Core System Profile
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Hint panel */}
            <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 text-[#0c5a80]">
              <div className="flex items-center gap-2 text-sky-950 font-black text-[10px] uppercase tracking-wider">
                <span className="material-symbols-outlined text-[14px]">info</span>
                <span>Active Synchronization Notice</span>
              </div>
              <p className="text-[10px] leading-relaxed text-sky-800 mt-1">
                Any registered accounts created here will run entirely in live sandboxed sessions. Users can sign out and log directly in with the newly created credential strings (or click their dynamic cards inside the gateway's Quick list).
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
