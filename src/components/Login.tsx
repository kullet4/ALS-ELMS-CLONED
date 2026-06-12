import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PortalType, UserAccount } from '../types';
import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, limit, query } from 'firebase/firestore';

interface LoginProps {
  onLoginSuccess: (role: PortalType, email: string, name: string) => void;
  accounts: UserAccount[];
}

export default function Login({ onLoginSuccess, accounts }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all credentials.');
      return;
    }

    setIsLoading(true);
    setError('');

    setTimeout(() => {
      const match = accounts.find(
        (acc) => acc.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (match) {
        onLoginSuccess(match.role, match.email, match.name);
      } else {
        setError('Invalid credentials. Try using one of our verified ALS Portal identities.');
        setIsLoading(false);
      }
    }, 850);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const emailVal = result.user.email;
      if (!emailVal) {
        throw new Error('Google Sign-In did not return an email address.');
      }

      const emailLower = emailVal.toLowerCase();
      const userDocRef = doc(db, 'users', emailLower);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data() as UserAccount;
        onLoginSuccess(data.role, data.email, data.name);
      } else {
        // If the database has no registered users, make the first Google user an Admin
        const usersRef = collection(db, 'users');
        const q = query(usersRef, limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          const displayName = result.user.displayName || 'Superintendent Admin';
          const newAdmin: UserAccount = {
            name: displayName,
            email: emailLower,
            role: 'admin',
            label: `${displayName} (Admin)`,
            desc: 'Regional Operations Director (First Auto-Admin)',
            avatar: '🏢',
            password: 'password'
          };
          await setDoc(userDocRef, newAdmin);
          onLoginSuccess('admin', emailLower, displayName);
        } else {
          setError('This Google Account is not registered in the ALS Portal. Please contact an Administrator to get registered.');
          await auth.signOut();
          setIsLoading(false);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during Google Sign-In.');
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (role: PortalType, accountEmail: string, accountName: string) => {
    setIsLoading(true);
    setError('');
    setTimeout(() => {
      onLoginSuccess(role, accountEmail, accountName);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans antialiased">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
        {/* Brand visual header */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-xl bg-gradient-to-tr from-indigo-600 to-purple-600 mb-2">
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
        </div>
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 leading-none">ALS Burgos</h2>
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1.5">Learning Management System</p>
          <p className="text-sm text-slate-500 mt-2">ALS Group BSIT(602)</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-md rounded-2xl border border-slate-100 sm:px-10">

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">
                ALS Registered Email
              </label>
              <div className="relative rounded-xl shadow-sm">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. alex@als.edu"
                  className="w-full bg-slate-50 hover:bg-slate-100/75 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3 text-sm outline-none transition-all placeholder:text-slate-400 font-semibold"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">
                Credentials Token
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 hover:bg-slate-100/75 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3 text-sm outline-none transition-all placeholder:text-slate-400 font-semibold"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="p-3.5 bg-rose-50 border-l-4 border-rose-500 rounded-xl text-rose-800 text-xs font-semibold leading-relaxed animate-fade-in">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 transition-all cursor-pointer bg-gradient-to-tr from-indigo-600 to-purple-600 justify-center items-center gap-2"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">login</span>
                    Log In to Gateway
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider and Quick Setup options */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-xs font-black uppercase tracking-widest">
                <span className="bg-white px-3 text-slate-400 text-[10px]">Or Select ALS Session role</span>
              </div>
            </div>

            <div className="mt-5 max-h-56 overflow-y-auto space-y-2.5 pr-1">
              {accounts.map((demo) => (
                <button
                  key={demo.email}
                  type="button"
                  onClick={() => handleQuickLogin(demo.role, demo.email, demo.name)}
                  disabled={isLoading}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-indigo-200 bg-slate-50 hover:bg-indigo-50/20 text-left transition-all cursor-pointer group disabled:opacity-60"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{demo.avatar}</span>
                    <div className="min-w-0">
                      <span className="font-extrabold text-xs text-slate-800 block leading-tight group-hover:text-indigo-950">
                        {demo.label}
                      </span>
                      <span className="text-[10px] text-slate-450 block truncate">
                        {demo.desc}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold text-indigo-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform shrink-0">
                    Auto-Login
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
