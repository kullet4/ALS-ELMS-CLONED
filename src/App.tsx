import { useState, useEffect } from 'react';
import { PortalType, StudentTab, Lesson, UserAccount, AttendanceRecord, StudentGrade } from './types';
import StudentHome from './components/StudentHome';
import StudentLessons from './components/StudentLessons';
import StudentProgress from './components/StudentProgress';
import StudentProfile from './components/StudentProfile';
import TeacherDashboard from './components/TeacherDashboard';
import AdminDashboard from './components/AdminDashboard';
import ActiveClassroom from './components/ActiveClassroom';
import Login from './components/Login';
import { MOCK_LESSONS } from './data';
import { db } from './firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';

export const DEFAULT_ACCOUNTS: UserAccount[] = [
  { email: 'alex@als.edu', role: 'student', name: 'Alex Johnson', label: 'Alex Johnson (Student)', desc: 'ALS Alternative Secondary Pathway', avatar: '🎓', password: 'password', section: 'Section A', subjects: ['LS3 Mathematics - Problem Solving', 'LS2 Science - Scientific Literacy', 'LS1 English - Communication Skills', 'LS4 Life and Career Skills'] },
  { email: 'marcus@als.edu', role: 'teacher', name: 'Mentor Marcus', label: 'Mentor Marcus (Teacher)', desc: 'Regional Instructor (Region IV-A)', avatar: '🧑‍🏫', password: 'password', section: 'Section A' },
  { email: 'superintendent@als.edu', role: 'admin', name: 'Administrator Superintendent', label: 'Superintendent (Admin)', desc: 'Regional Operations Director', avatar: '🏢', password: 'password' },
  { email: 'robert@als.edu', role: 'student', name: 'Robert Lim', label: 'Robert Lim (Student)', desc: 'ALS Alternative Secondary Pathway', avatar: '🎓', password: 'password', section: 'Section A', subjects: ['LS3 Mathematics - Problem Solving', 'LS2 Science - Scientific Literacy'] },
  { email: 'juan@als.edu', role: 'student', name: 'Juan Dela Cruz', label: 'Juan Dela Cruz (Student)', desc: 'ALS Alternative Secondary Pathway', avatar: '🎓', password: 'password', section: 'Section A', subjects: ['LS3 Mathematics - Problem Solving', 'LS1 English - Communication Skills', 'LS4 Life and Career Skills'] },
  { email: 'maria@als.edu', role: 'student', name: 'Maria Clara', label: 'Maria Clara (Student)', desc: 'ALS Alternative Secondary Pathway', avatar: '🎓', password: 'password', section: 'Section A', subjects: ['LS2 Science - Scientific Literacy', 'LS1 English - Communication Skills', 'LS4 Life and Career Skills'] },
  { email: 'ana@als.edu', role: 'student', name: 'Ana Santos', label: 'Ana Santos (Student)', desc: 'ALS Alternative Secondary Pathway', avatar: '🎓', password: 'password', section: 'Section B', subjects: ['LS3 Mathematics - Problem Solving', 'LS2 Science - Scientific Literacy'] },
  { email: 'cardo@als.edu', role: 'student', name: 'Cardo Dalisay', label: 'Cardo Dalisay (Student)', desc: 'ALS Alternative Secondary Pathway', avatar: '🎓', password: 'password', section: 'Section B', subjects: ['LS3 Mathematics - Problem Solving', 'LS4 Life and Career Skills'] },
  { email: 'jose@als.edu', role: 'student', name: 'Jose Rizal', label: 'Jose Rizal (Student)', desc: 'ALS Alternative Secondary Pathway', avatar: '🎓', password: 'password', section: 'Section B', subjects: ['LS2 Science - Scientific Literacy', 'LS1 English - Communication Skills'] },
  { email: 'andres@als.edu', role: 'student', name: 'Andres Bonifacio', label: 'Andres Bonifacio (Student)', desc: 'ALS Alternative Secondary Pathway', avatar: '🎓', password: 'password', section: 'Section B', subjects: ['LS1 English - Communication Skills', 'LS4 Life and Career Skills'] },
];

interface SessionState {
  role: PortalType;
  email: string;
  name: string;
}

export default function App() {
  const [lessons, setLessons] = useState<Lesson[]>(MOCK_LESSONS);
  const [accounts, setAccounts] = useState<UserAccount[]>(DEFAULT_ACCOUNTS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [session, setSession] = useState<SessionState | null>(() => {
    const saved = localStorage.getItem('als_session');
    return saved ? JSON.parse(saved) : null;
  });

  // Listen to accounts from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      if (snapshot.empty) {
        DEFAULT_ACCOUNTS.forEach(async (acc) => {
          await setDoc(doc(db, 'users', acc.email.toLowerCase()), acc);
        });
        setAccounts(DEFAULT_ACCOUNTS);
      } else {
        const loadedAccounts: UserAccount[] = [];
        snapshot.forEach((doc) => {
          loadedAccounts.push(doc.data() as UserAccount);
        });
        setAccounts(loadedAccounts);
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen to lessons from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'lessons'), (snapshot) => {
      if (snapshot.empty) {
        MOCK_LESSONS.forEach(async (lesson) => {
          await setDoc(doc(db, 'lessons', lesson.id), lesson);
        });
        setLessons(MOCK_LESSONS);
      } else {
        const loadedLessons: Lesson[] = [];
        snapshot.forEach((doc) => {
          loadedLessons.push(doc.data() as Lesson);
        });
        setLessons(loadedLessons);
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen to attendance from Firestore with 10-day historical data seeder
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'attendance'), async (snapshot) => {
      if (snapshot.empty) {
        const subjects = [
          'LS1 English - Communication Skills',
          'LS1 Filipino - Communication Skills',
          'LS2 Science - Scientific Literacy',
          'LS3 Mathematics - Problem Solving',
          'LS4 Life and Career Skills',
          'LS5 Understanding Culture and Society',
          'LS6 Digital Literacy'
        ];
        const sections = ['Section A', 'Section B'];
        const students = DEFAULT_ACCOUNTS.filter(a => a.role === 'student');
        
        // Generate last 10 school days (excluding weekends)
        const dates: string[] = [];
        let d = new Date();
        while (dates.length < 10) {
          d.setDate(d.getDate() - 1);
          const day = d.getDay();
          if (day !== 0 && day !== 6) { // Not Sat/Sun
            dates.push(d.toISOString().split('T')[0]);
          }
        }

        for (const date of dates) {
          for (const subject of subjects) {
            for (const section of sections) {
              const secStudents = students.filter(s => s.section === section && s.subjects?.includes(subject));
              if (secStudents.length === 0) continue;

              const records: Record<string, 'present' | 'absent' | 'late'> = {};
              secStudents.forEach(s => {
                const rand = Math.random();
                if (s.email === 'robert@als.edu') {
                  records[s.email] = rand < 0.55 ? 'present' : (rand < 0.90 ? 'absent' : 'late');
                } else if (s.email === 'juan@als.edu') {
                  records[s.email] = rand < 0.60 ? 'present' : (rand < 0.92 ? 'absent' : 'late');
                } else {
                  records[s.email] = rand < 0.85 ? 'present' : (rand < 0.95 ? 'late' : 'absent');
                }
              });

              const id = `${subject.replace(/\s+/g, '')}_${section.replace(/\s+/g, '')}_${date}`;
              await setDoc(doc(db, 'attendance', id), {
                id,
                subject,
                section,
                date,
                records,
                lastUpdated: new Date()
              });
            }
          }
        }
      } else {
        const loadedAttendance: AttendanceRecord[] = [];
        snapshot.forEach((doc) => {
          loadedAttendance.push(doc.data() as AttendanceRecord);
        });
        setAttendance(loadedAttendance);
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen to grades from Firestore with seeder
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'grades'), async (snapshot) => {
      if (snapshot.empty) {
        const students = DEFAULT_ACCOUNTS.filter(a => a.role === 'student');
        
        const mockScores: Record<string, Record<string, number>> = {
          'alex@als.edu': {
            'LS3 Mathematics - Problem Solving': 85,
            'LS2 Science - Scientific Literacy': 90,
            'LS1 English - Communication Skills': 88,
            'LS4 Life and Career Skills': 92
          },
          'robert@als.edu': {
            'LS3 Mathematics - Problem Solving': 58,
            'LS2 Science - Scientific Literacy': 62
          },
          'juan@als.edu': {
            'LS3 Mathematics - Problem Solving': 45,
            'LS1 English - Communication Skills': 72,
            'LS4 Life and Career Skills': 75
          },
          'maria@als.edu': {
            'LS2 Science - Scientific Literacy': 95,
            'LS1 English - Communication Skills': 98,
            'LS4 Life and Career Skills': 94
          },
          'ana@als.edu': {
            'LS3 Mathematics - Problem Solving': 82,
            'LS2 Science - Scientific Literacy': 88
          },
          'cardo@als.edu': {
            'LS3 Mathematics - Problem Solving': 72,
            'LS4 Life and Career Skills': 80
          },
          'jose@als.edu': {
            'LS2 Science - Scientific Literacy': 99,
            'LS1 English - Communication Skills': 96
          },
          'andres@als.edu': {
            'LS1 English - Communication Skills': 85,
            'LS4 Life and Career Skills': 89
          }
        };

        for (const s of students) {
          const studentScores = mockScores[s.email];
          if (!studentScores) continue;

          for (const [subject, score] of Object.entries(studentScores)) {
            const id = `${s.email.replace(/[@.]/g, '_')}_${subject.replace(/\s+/g, '')}`;
            await setDoc(doc(db, 'grades', id), {
              id,
              studentEmail: s.email,
              studentName: s.name,
              subject,
              section: s.section,
              score
            });
          }
        }
      } else {
        const loadedGrades: StudentGrade[] = [];
        snapshot.forEach((doc) => {
          loadedGrades.push(doc.data() as StudentGrade);
        });
        setGrades(loadedGrades);
      }
    });
    return () => unsubscribe();
  }, []);

  const [portal, setPortal] = useState<PortalType>(() => {
    const saved = localStorage.getItem('als_session');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.role;
    }
    return 'student';
  });

  const [studentTab, setStudentTab] = useState<StudentTab>('home');
  const [coins, setCoins] = useState<number>(450);
  const [streakDays, setStreakDays] = useState<number>(12);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync session state to portal inside a clean hook
  useEffect(() => {
    if (session) {
      localStorage.setItem('als_session', JSON.stringify(session));
      setPortal(session.role);
    } else {
      localStorage.removeItem('als_session');
    }
  }, [session]);

  const handleLoginSuccess = (role: PortalType, email: string, name: string) => {
    const newSession = { role, email, name };
    setSession(newSession);
    setPortal(role);
    setStudentTab('home');
  };

  const handleLogout = () => {
    setSession(null);
    setMobileMenuOpen(false);
  };

  const handleRewardCoins = (addAmount: number) => {
    setCoins(prev => prev + addAmount);
  };

  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setStudentTab('learning');
  };

  // Firestore DB mutations
  const handleAddLesson = async (newLesson: Lesson) => {
    await setDoc(doc(db, 'lessons', newLesson.id), newLesson);
  };

  const handleRemoveLesson = async (id: string) => {
    await deleteDoc(doc(db, 'lessons', id));
  };

  const handleAddAccount = async (newAcc: UserAccount) => {
    try {
      await setDoc(doc(db, 'users', newAcc.email.toLowerCase()), newAcc);
    } catch (err) {
      console.error('[ALS] Failed to add account to Firestore:', err);
      throw err;
    }
  };

  const handleRemoveAccount = async (email: string): Promise<boolean> => {
    try {
      // 1. Delete from Firestore
      await deleteDoc(doc(db, 'users', email.toLowerCase()));

      // 2. Delete from Firebase Authentication via Admin API
      try {
        const res = await fetch(`/api/auth-user?email=${encodeURIComponent(email.toLowerCase())}`, {
          method: 'DELETE',
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          console.warn('[ALS] Auth delete returned non-OK:', body);
        } else {
          const body = await res.json();
          if (body.skipped) {
            console.info(`[ALS] Auth user not found for ${email} — Firestore-only account, no Auth entry to delete.`);
          } else {
            console.info(`[ALS] Firebase Auth user deleted: ${email}`);
          }
        }
      } catch (authErr) {
        // Auth delete is best-effort — don't block the UI if the API is unreachable
        console.warn('[ALS] Could not reach Admin API to delete Auth user:', authErr);
      }

      return true;
    } catch (err) {
      console.error('[ALS] Failed to remove account from Firestore:', err);
      return false;
    }
  };

  // If there's no active authenticated session, direct to the RBAC Login Gateway
  if (!session) {
    return <Login onLoginSuccess={handleLoginSuccess} accounts={accounts} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">

      {/* Top Header: Brand Title, Context Marker, and Log Out Interface */}
      <header className="bg-white border-b border-slate-100 py-3.5 px-6 shrink-0 relative z-40 sticky top-0 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">

        {/* Brand visual header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md bg-linear-to-tr from-indigo-600 to-purple-600">
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-900 leading-none">ALS Burgos</h1>
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mt-0.5">e-Learning Portal</p>
          </div>
        </div>

        {/* Dynamic Context and Sign-out Panel */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3.5 py-1.5 rounded-xl text-xs">
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${portal === 'admin' ? 'bg-emerald-500 animate-pulse' :
              portal === 'teacher' ? 'bg-indigo-600' :
                'bg-[#FF9800]'
              }`} />
            <span className="text-slate-455 font-bold block">Session:</span>
            <span className="text-slate-800 font-extrabold capitalize block">{session.name}</span>
            <span className="text-slate-300">|</span>
            <span className={`font-black uppercase tracking-wider text-[10px] ${portal === 'admin' ? 'text-emerald-600' :
              portal === 'teacher' ? 'text-indigo-600' :
                'text-[#9c5a00]'
              }`}>
              {portal === 'teacher' ? 'Instructor' : portal}
            </span>
          </div>

          <button
            id="btn_gateway_logout"
            onClick={handleLogout}
            className="w-full sm:w-auto px-4 py-1.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-100/50 rounded-xl text-xs font-black text-slate-600 hover:text-slate-800 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            Exit Session
          </button>
        </div>

      </header>

      {/* Main Core Body Container */}
      <div className="flex-1 flex flex-col md:flex-row relative">

        {/* SECONDARY SIDEBAR - ONLY FOR STUDENT PORTAL */}
        {portal === 'student' && (
          <>
            {/* Desktop Left Sidebar Navigation */}
            <aside className="hidden md:flex flex-col justify-between w-64 bg-white border-r border-slate-100 p-6 shrink-0 z-30 sticky top-[73px] h-[calc(100vh-73px)]">

              <div className="space-y-6">

                {/* Visual Avatar detail of logged-in Student */}
                {(() => {
                  const currentUser = accounts.find(a => a.email.toLowerCase() === session.email.toLowerCase());
                  return (
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="w-10 h-10 rounded-full shrink-0 bg-indigo-100 border border-indigo-300 text-indigo-700 font-black flex items-center justify-center text-sm uppercase">
                        {session.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <span className="font-black text-xs text-slate-800 block truncate">{session.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">
                          {currentUser?.section ? `${currentUser.section} • ` : ''}Learner
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Vertical Links list */}
                <nav className="space-y-1.5">
                  <button
                    onClick={() => setStudentTab('home')}
                    className={`w-full p-3 rounded-xl text-xs font-black flex items-center gap-3 cursor-pointer transition-all ${studentTab === 'home' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">dashboard</span>
                    Home Dashboard
                  </button>

                  <button
                    onClick={() => setStudentTab('lessons')}
                    className={`w-full p-3 rounded-xl text-xs font-black flex items-center gap-3 cursor-pointer transition-all ${studentTab === 'lessons' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">menu_book</span>
                    Lessons Browser
                  </button>

                  <button
                    onClick={() => setStudentTab('progress')}
                    className={`w-full p-3 rounded-xl text-xs font-black flex items-center gap-3 cursor-pointer transition-all ${studentTab === 'progress' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    Progress Tracker
                  </button>

                  <button
                    onClick={() => setStudentTab('profile')}
                    className={`w-full p-3 rounded-xl text-xs font-black flex items-center gap-3 cursor-pointer transition-all ${studentTab === 'profile' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">target</span>
                    Goals & Settings
                  </button>

                  <button
                    onClick={() => setStudentTab('learning')}
                    className={`w-full p-3 rounded-xl text-xs font-black flex items-center gap-3 cursor-pointer transition-all ${studentTab === 'learning' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">school</span>
                    Active Classroom
                  </button>
                </nav>

              </div>

            </aside>

            {/* Mobile Top Navbar Navigation */}
            <div className="md:hidden bg-white border-b border-slate-155 p-3 px-6 select-none shrink-0 sticky top-[73px] z-30 flex items-center justify-between shadow-sm">
              <span className="font-black text-xs text-slate-700 capitalize flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">label</span>
                Student Node: {studentTab === 'learning' ? 'Ecology Classroom' : studentTab}
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 text-xs rounded-xl flex items-center justify-center cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">{mobileMenuOpen ? 'close' : 'menu'}</span>
                </button>
              </div>
            </div>

            {/* Mobile Dropdown Options Drawer */}
            {mobileMenuOpen && (
              <div className="md:hidden bg-white border-b border-slate-155 p-4 space-y-2 absolute top-[125px] left-0 right-0 z-20 shadow-lg animation-slide-in">
                <button onClick={() => { setStudentTab('home'); setMobileMenuOpen(false); }} className={`w-full p-3 font-bold text-left text-xs text-slate-700 rounded-xl ${studentTab === 'home' ? 'bg-indigo-50 text-indigo-700' : ''}`}>Home Dashboard</button>
                <button onClick={() => { setStudentTab('lessons'); setMobileMenuOpen(false); }} className={`w-full p-3 font-bold text-left text-xs text-slate-700 rounded-xl ${studentTab === 'lessons' ? 'bg-indigo-50 text-indigo-700' : ''}`}>Lessons Browser</button>
                <button onClick={() => { setStudentTab('progress'); setMobileMenuOpen(false); }} className={`w-full p-3 font-bold text-left text-xs text-slate-700 rounded-xl ${studentTab === 'progress' ? 'bg-indigo-50 text-indigo-700' : ''}`}>Progress Tracker</button>
                <button onClick={() => { setStudentTab('profile'); setMobileMenuOpen(false); }} className={`w-full p-3 font-bold text-left text-xs text-slate-700 rounded-xl ${studentTab === 'profile' ? 'bg-indigo-50 text-indigo-700' : ''}`}>Goals & Settings</button>
                <button onClick={() => { setStudentTab('learning'); setMobileMenuOpen(false); }} className={`w-full p-3 font-bold text-left text-xs text-slate-700 rounded-xl ${studentTab === 'learning' ? 'bg-indigo-50 text-indigo-700' : ''}`}>Ecology Classroom</button>
              </div>
            )}
          </>
        )}

        {/* Portal Workspace View Router Area */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">

          {portal === 'student' && (() => {
            const currentUser = accounts.find(a => a.email.toLowerCase() === session.email.toLowerCase());
            return (
              <div className="space-y-6">

                {/* Core Student Pages rendering */}
                {studentTab === 'home' && (
                  <StudentHome
                    onTabChange={(tab) => setStudentTab(tab)}
                    coins={coins}
                    streakDays={streakDays}
                    currentUser={currentUser}
                  />
                )}

                {studentTab === 'lessons' && (
                  <StudentLessons
                    onTabChange={(tab) => setStudentTab(tab)}
                    onSelectLesson={handleSelectLesson}
                    lessons={lessons}
                    currentUser={currentUser}
                  />
                )}

                {studentTab === 'progress' && (
                  <StudentProgress
                    onTabChange={(tab) => setStudentTab(tab)}
                    coins={coins}
                  />
                )}

                {studentTab === 'profile' && (
                  <StudentProfile currentUser={currentUser} />
                )}

                {studentTab === 'learning' && (
                  <ActiveClassroom
                    lesson={selectedLesson || lessons[0] || MOCK_LESSONS[0]}
                    onAddCoins={handleRewardCoins}
                    onClose={() => setStudentTab('home')}
                  />
                )}

              </div>
            );
          })()}

          {/* Teacher Portal Dashboard */}
          {portal === 'teacher' && (
            <TeacherDashboard
              lessons={lessons}
              onAddLesson={handleAddLesson}
              onRemoveLesson={handleRemoveLesson}
              accounts={accounts}
              attendance={attendance}
              grades={grades}
              currentUser={accounts.find(a => a.email.toLowerCase() === session.email.toLowerCase())}
            />
          )}

          {/* Administrator Superintendent Portal Dashboard */}
          {portal === 'admin' && (
            <AdminDashboard
              accounts={accounts}
              onAddAccount={handleAddAccount}
              onRemoveAccount={handleRemoveAccount}
            />
          )}

        </main>

      </div>

    </div>
  );
}
