import React, { useState } from 'react';

import { Lesson, UserAccount, AttendanceRecord, StudentGrade } from '../types';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

interface TeacherDashboardProps {
  lessons: Lesson[];
  onAddLesson: (lesson: Lesson) => void;
  onRemoveLesson: (id: string) => void;
  accounts: UserAccount[];
  attendance: AttendanceRecord[];
  grades: StudentGrade[];
  currentUser?: UserAccount;
}

interface BuilderSlideInput {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
}

interface BuilderQuizInput {
  id: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

const ALL_ALS_SUBJECTS = ['Science', 'Math', 'English', 'Life Skills'] as const;

type LessonCategory = 'Math' | 'Science' | 'English' | 'Life Skills';

const isSubjectMatch = (recordSubject: string | undefined, filterSubject: string): boolean => {
  if (!recordSubject) return false;
  if (recordSubject === filterSubject) return true;
  
  const legacyMap: Record<string, string[]> = {
    'LS3 Mathematics - Problem Solving': ['Mathematics', 'Math'],
    'LS2 Science - Scientific Literacy': ['Science'],
    'LS1 English - Communication Skills': ['English'],
    'LS4 Life and Career Skills': ['Life Skills']
  };
  
  const fallbacks = legacyMap[filterSubject];
  if (fallbacks && fallbacks.includes(recordSubject)) {
    return true;
  }
  return false;
};

const isStudentEnrolledInSubject = (studentSubjects: string[] | undefined, filterSubject: string): boolean => {
  if (!studentSubjects) return false;
  return studentSubjects.some(subj => isSubjectMatch(subj, filterSubject));
};

const ASSET_URLS: Record<LessonCategory, string> = {
  Math: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMG5BPSp6RF1_qWoB091w0NCI-dfBgRJ48uICFHwNMdJF7HvO-oLb6he03CyyHUZgbhbLYo-CVTS58lgV4TvcpLeqPE0Krh7CEfrt6LXJJqjuYPQPmbSi_jZkRh8AvDwa1zQk0NZYFmJW8HxX4SxWK5txhS4Inqn3H_eT8MIxxVzAew3iCB7tqD9d1G_otijNVkoVpcUnptR2BQoChQYHchioHEPzHQoejGGyAWAQCMRTNWVPHrPG52QTxGZGu3KWipkTE8pA-KRE',
  Science: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJyvH30uHe26QqhBfpDQuAHjwoyAs1BdvCupuu9Snf3yjhNLq2y3vT35OvoYoFyCU5aVXhCmVGSJ8rmHepnIAcFRkcXOURqyxc0ItCZRWS31xbLTwTRR4amXaHdh1l0mu6m_rNmI21EZ5SX11eafxQ4x9j79WVXaRBhtHf2amoGNcuw0r0EIL90HGJhzCzyC7ivJcYUHSVVgBlUmxEgECDMXhocbOjuErgQdmoJhW0mOVBc0xDGyEODHmMnUoPM_bjUaJzOvuTrqw',
  English: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDE-BXqQ6EFQrGv_0bveAFQxNdS7gHxRL7lylGFTiHeFky1sDUWHx0mb6Z9IpFzxuGDSveJ2x4eLQBwBg3ch-P_K18lhkMyIBxNXlp3I_3pb-n8ZPAkh_XWALD4UsgPS35R1RT10wyhjc9yViAD5lI_9JwPyRTtupqqNFJfsxJ1ayFfOnZDNLJplGBJup0DgUbtXIcwjhBtoFewNEG5vLlUjcgO40xuTbvlWZMXbQcZrAHUkOmNm-HHFzWzeHNTrNyu1ni54fAfbzI',
  'Life Skills': 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8Ihbn1lS_HTUSu-zs16FbWWUuduAHmNw9n8gduDhzNFkUWtQA3cKPDILlwaImvQFiobuGr92qXQoSdAEIeS5Ve3KpljYn7ZCHdl0ICIEoSGSg-yVtHs7AX9f7xw-cpuGTIydGuDURzJUbLFMyJ74tvRK3GReLLbMcRCckUdlcggoeheOmEvarwotbxEq2G-JRjcy_Btc2_KFovY1Drp6ot6x4VdBy8mKeLc0s0IIjYdx74lQkjFpAI5sms9oGh4lwABE0wjWMJx0',
};

export default function TeacherDashboard({ 
  lessons, 
  onAddLesson, 
  onRemoveLesson,
  accounts,
  attendance,
  grades,
  currentUser
}: TeacherDashboardProps) {

  const [notification, setNotification] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'analytics' | 'content'>('overview');
  const [filterSubject, setFilterSubject] = useState('LS1 English - Communication Skills');
  const [filterSection, setFilterSection] = useState('Section A');
  const [filterDate, setFilterDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  
  const [localRecords, setLocalRecords] = useState<Record<string, 'present' | 'absent' | 'late'>>({});

  const teacherSubjects: LessonCategory[] = (() => {
    const assigned = (currentUser?.subjects ?? []).filter(
      (s): s is LessonCategory => ALL_ALS_SUBJECTS.includes(s as LessonCategory)
    );
    return assigned.length > 0 ? assigned : [...ALL_ALS_SUBJECTS];
  })();

  const [creationMethod, setCreationMethod] = useState<'link' | 'interactive'>('link');
  const [supTitle, setSupTitle] = useState('');
  const [supCategory, setSupCategory] = useState<LessonCategory>(teacherSubjects[0]);
  const [supLevel, setSupLevel] = useState(2);
  const [supDuration, setSupDuration] = useState('15 mins');
  const [supBucketUrl, setSupBucketUrl] = useState('');
  const [supDescription, setSupDescription] = useState('');

  const [builderSlides, setBuilderSlides] = useState<BuilderSlideInput[]>([
    { id: 'slide-1', title: 'Chapter 1: Foundations', content: '', imageUrl: '' },
    { id: 'slide-2', title: 'Chapter 2: Deep Dive Practice', content: '', imageUrl: '' }
  ]);

  const [builderQuizzes, setBuilderQuizzes] = useState<BuilderQuizInput[]>([
    {
      id: 'quiz-1',
      question: '',
      options: { A: '', B: '', C: '', D: '' },
      correctAnswer: 'A',
      explanation: ''
    }
  ]);

  const handleAddSlide = () => {
    const nextIdx = builderSlides.length + 1;
    setBuilderSlides(prev => [
      ...prev,
      { id: `slide-${Date.now()}-${nextIdx}`, title: `Slide Heading #${nextIdx}`, content: '', imageUrl: '' }
    ]);
    setNotification(`Added Slide #${nextIdx}! 📝 Use the layout controls to reorder.`);
  };

  const handleRemoveSlide = (id: string) => {
    if (builderSlides.length <= 1) {
      setNotification('A manual textbook must contain at least 1 slide! ⚠️');
      return;
    }
    setBuilderSlides(prev => prev.filter(s => s.id !== id));
    setNotification('Removed textbook slide.');
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === builderSlides.length - 1) return;
    const newSlides = [...builderSlides];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = newSlides[index];
    newSlides[index] = newSlides[targetIdx];
    newSlides[targetIdx] = temp;
    setBuilderSlides(newSlides);
    setNotification('Reordered textbook slides.');
  };

  const handleAddQuiz = () => {
    const nextIdx = builderQuizzes.length + 1;
    setBuilderQuizzes(prev => [
      ...prev,
      {
        id: `quiz-${Date.now()}-${nextIdx}`,
        question: '',
        options: { A: '', B: '', C: '', D: '' },
        correctAnswer: 'A',
        explanation: ''
      }
    ]);
    setNotification(`Added Quiz Question #${nextIdx}! 🧠 Define option variables A-D.`);
  };

  const handleRemoveQuiz = (id: string) => {
    if (builderQuizzes.length <= 1) {
      setNotification('Interactive lessons must have at least 1 quiz question! ⚠️');
      return;
    }
    setBuilderQuizzes(prev => prev.filter(q => q.id !== id));
    setNotification('Removed quiz question.');
  };

  const handleMoveQuiz = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === builderQuizzes.length - 1) return;
    const newQuizzes = [...builderQuizzes];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = newQuizzes[index];
    newQuizzes[index] = newQuizzes[targetIdx];
    newQuizzes[targetIdx] = temp;
    setBuilderQuizzes(newQuizzes);
    setNotification('Reordered quiz question hierarchy.');
  };

  const handlePublishLesson = (e: React.FormEvent) => {
    e.preventDefault();
    const uploadedBy = currentUser?.name ?? 'Teacher';

    let newLesson: Lesson;

    if (creationMethod === 'interactive') {
      const invalidSlide = builderSlides.find(s => !s.title.trim() || !s.content.trim());
      if (invalidSlide) {
        setNotification('Please fill in a Title and Body Text for all textbook slides. ⚠️');
        return;
      }
      const invalidQuiz = builderQuizzes.find(q => !q.question.trim() || !q.options.A.trim() || !q.options.B.trim());
      if (invalidQuiz) {
        setNotification('Every quiz question must define at least a Question statement and options A and B! ⚠️');
        return;
      }
      if (!supTitle.trim()) {
        setNotification('Please enter a Lesson Module Title.');
        return;
      }

      const lessonParts = builderSlides.map((slide, idx) => ({
        title: slide.title.trim(),
        content: slide.content.trim(),
        imageUrl: slide.imageUrl.trim() || undefined,
        icon: idx === 0 ? 'auto_stories' : idx % 2 === 1 ? 'school' : 'psychology'
      }));

      const lessonQuizzes = builderQuizzes.map(q => {
        const optionList: string[] = [];
        if (q.options.A.trim()) optionList.push(q.options.A.trim());
        if (q.options.B.trim()) optionList.push(q.options.B.trim());
        if (q.options.C.trim()) optionList.push(q.options.C.trim());
        if (q.options.D.trim()) optionList.push(q.options.D.trim());
        return {
          question: q.question.trim(),
          options: optionList,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation.trim() || `Correct answer! Excellent progress. (+100 Coins reward)`
        };
      });

      newLesson = {
        id: `tchr-${Date.now()}`,
        title: supTitle.trim(),
        category: supCategory,
        level: supLevel,
        duration: supDuration,
        description: supDescription || lessonParts[0].content.substring(0, 100) + '...',
        progress: 0,
        assetUrl: ASSET_URLS[supCategory],
        rewardText: `Textbook Complete: Level ${supLevel}`,
        assignedTo: 'Student Alex',
        uploadedBy,
        parts: lessonParts,
        quiz: lessonQuizzes[0],
        quizzes: lessonQuizzes
      };
    } else {
      if (!supTitle.trim() || !supBucketUrl.trim()) {
        setNotification('Please fill in module title and bucket link. ⚠️');
        return;
      }
      newLesson = {
        id: `tchr-${Date.now()}`,
        title: supTitle.trim(),
        category: supCategory,
        level: supLevel,
        duration: supDuration,
        description: supDescription || 'No description supplied.',
        progress: 0,
        assetUrl: ASSET_URLS[supCategory],
        rewardText: `Supabase Bucket: Level ${supLevel}`,
        bucketUrl: supBucketUrl.trim(),
        assignedTo: 'Student Alex',
        uploadedBy
      };
    }

    onAddLesson(newLesson);
    setSupTitle('');
    setSupDescription('');
    setSupBucketUrl('');
    setBuilderSlides([
      { id: 'slide-1', title: 'Chapter 1: Foundations', content: '', imageUrl: '' },
      { id: 'slide-2', title: 'Chapter 2: Deep Dive Practice', content: '', imageUrl: '' }
    ]);
    setBuilderQuizzes([
      { id: 'quiz-1', question: '', options: { A: '', B: '', C: '', D: '' }, correctAnswer: 'A', explanation: '' }
    ]);

    setNotification(`Successfully published "${newLesson.title}" to student lessons! 🚀`);
    setTimeout(() => setNotification(null), 4500);
  };

  React.useEffect(() => {
    const existing = attendance.find(
      a => isSubjectMatch(a.subject, filterSubject) && a.section === filterSection && a.date === filterDate
    );
    const enrolled = accounts.filter(
      a => a.role === 'student' && a.section === filterSection && isStudentEnrolledInSubject(a.subjects, filterSubject)
    );
    if (existing) {
      setLocalRecords(existing.records);
    } else {
      const initial: Record<string, 'present' | 'absent' | 'late'> = {};
      enrolled.forEach(s => {
        initial[s.email] = 'present';
      });
      setLocalRecords(initial);
    }
  }, [filterSubject, filterSection, filterDate, attendance, accounts]);

  const handleSendHelp = (studentName: string, subject: string) => {
    setNotification(`Successfully dispatched a custom Lesson Plan to ${studentName} covering ${subject}. 🚀`);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };


  const handleSaveAttendance = async () => {
    const id = `${filterSubject.replace(/\s+/g, '')}_${filterSection.replace(/\s+/g, '')}_${filterDate}`;
    try {
      await setDoc(doc(db, 'attendance', id), {
        id,
        subject: filterSubject,
        section: filterSection,
        date: filterDate,
        records: localRecords,
        lastUpdated: new Date()
      });
      setNotification('Attendance checklist synchronized to database! 💾');
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      console.error(err);
      setNotification('Error saving attendance. Please try again. ⚠️');
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleExportCSV = (scope: 'day' | 'all') => {
    let csvRows = [['Date', 'Student Name', 'Email', 'Subject', 'Section', 'Status']];

    if (scope === 'day') {
      const enrolled = accounts.filter(
        s => s.role === 'student' && s.section === filterSection && isStudentEnrolledInSubject(s.subjects, filterSubject)
      );
      enrolled.forEach(student => {
        const status = localRecords[student.email] || 'present';
        csvRows.push([
          filterDate,
          student.name,
          student.email,
          filterSubject,
          filterSection,
          status.toUpperCase()
        ]);
      });
    } else {
      const history = attendance.filter(
        a => isSubjectMatch(a.subject, filterSubject) && a.section === filterSection
      ).sort((a, b) => b.date.localeCompare(a.date));

      const enrolled = accounts.filter(
        s => s.role === 'student' && s.section === filterSection && isStudentEnrolledInSubject(s.subjects, filterSubject)
      );

      history.forEach(record => {
        enrolled.forEach(student => {
          const status = record.records[student.email] || 'present';
          csvRows.push([
            record.date,
            student.name,
            student.email,
            filterSubject,
            filterSection,
            status.toUpperCase()
          ]);
        });
      });
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + csvRows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendance_${filterSubject.replace(/\s+/g, '')}_${filterSection.replace(/\s+/g, '')}_${scope === 'day' ? filterDate : 'FullHistory'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setNotification(`Successfully compiled and exported CSV data! 📊`);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const myLessons = lessons.filter(l => l.uploadedBy === (currentUser?.name ?? 'Teacher'));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Welcome Banner */}
      <div className="bg-[#526069] text-white p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF9800]">Teacher Hub</span>
          <h2 className="text-2xl font-black tracking-tight leading-none mt-1">{currentUser?.name ?? 'Instructor'}</h2>
          <p className="text-xs text-slate-300 mt-1">{currentUser?.desc ?? 'Instructor • Alternative Secondary Pathway'}</p>
        </div>

        <div className="flex gap-4">
          <div className="bg-white/10 px-4 py-2 rounded-xl text-center">
            <span className="text-lg font-black block">128</span>
            <span className="text-[10px] font-bold text-slate-300 uppercase">Enrolled</span>
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-xl text-center">
            <span className="text-lg font-black block text-emerald-400">18</span>
            <span className="text-[10px] font-bold text-slate-300 uppercase">Active Now</span>
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-xl text-center">
            <span className="text-lg font-black block text-indigo-300">{myLessons.length}</span>
            <span className="text-[10px] font-bold text-slate-300 uppercase">Published</span>
          </div>
        </div>
      </div>

      {/* Notification Alert */}
      {notification && (
        <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center gap-3 shadow-md animate-in fade-in slide-in-from-top duration-300">
          <span className="material-symbols-outlined text-[#FF9800]">verified</span>
          <span className="text-xs font-semibold">{notification}</span>
        </div>
      )}

      {/* ── Tab Bar (FIXED) ── */}
      <div className="flex border-b border-slate-200 gap-1 pb-px overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-2.5 font-black text-xs uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">dashboard</span>
          Overview
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-5 py-2.5 font-black text-xs uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'attendance'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">co_present</span>
          Attendance Checker
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-5 py-2.5 font-black text-xs uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'analytics'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">analytics</span>
          Student Analytics
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={`px-5 py-2.5 font-black text-xs uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'content'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">edit_note</span>
          Content Builder
        </button>
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === 'overview' && (
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center space-y-3 animate-in fade-in duration-200">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-650 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[24px]">dashboard</span>
          </div>
          <div>
            <h3 className="text-base font-black text-slate-800">Welcome to your Dashboard</h3>
            <p className="text-xs text-slate-450 mt-1 max-w-sm mx-auto">
              Select any of the tabs above to manage attendance logs, analyze student academic performances, or author lessons in the content builder.
            </p>
          </div>
        </div>
      )}

      {/* ── Attendance Checker Tab ── */}
      {activeTab === 'attendance' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-800">Attendance Checker</h3>
              <p className="text-xs text-slate-450 mt-0.5">Record and view attendance parameters by date, subject and student sections.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleExportCSV('day')}
                className="px-3.5 py-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all active:scale-97"
              >
                <span className="material-symbols-outlined text-sm text-slate-500">download</span>
                Export Daily CSV
              </button>
              <button
                onClick={() => handleExportCSV('all')}
                className="px-3.5 py-2 border border-slate-200 hover:bg-indigo-50/20 text-indigo-700 bg-indigo-50/50 font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all active:scale-97"
              >
                <span className="material-symbols-outlined text-sm">download_for_offline</span>
                Export History CSV
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-150 shadow-2xs">
            <div>
              <label className="text-[10px] font-black text-slate-555 uppercase block mb-1">Select Subject</label>
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-[#526069] rounded-xl p-2.5 text-xs outline-none font-bold shadow-sm"
              >
                <option value="LS1 English - Communication Skills">LS1 English - Communication Skills</option>
                <option value="LS1 Filipino - Communication Skills">LS1 Filipino - Communication Skills</option>
                <option value="LS2 Science - Scientific Literacy">LS2 Science - Scientific Literacy</option>
                <option value="LS3 Mathematics - Problem Solving">LS3 Mathematics - Problem Solving</option>
                <option value="LS4 Life and Career Skills">LS4 Life and Career Skills</option>
                <option value="LS5 Understanding Culture and Society">LS5 Understanding Culture and Society</option>
                <option value="LS6 Digital Literacy">LS6 Digital Literacy</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-550 uppercase block mb-1">Select Section</label>
              <select
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-[#526069] rounded-xl p-2.5 text-xs outline-none font-bold shadow-sm"
              >
                <option value="Section A">Section A</option>
                <option value="Section B">Section B</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-550 uppercase block mb-1">Date</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-[#526069] rounded-xl p-2.5 text-xs outline-none font-semibold shadow-sm text-slate-700"
              />
            </div>
          </div>

          {/* Students List */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-black text-slate-455 uppercase tracking-wider">
                Students Enrolled ({accounts.filter(s => s.role === 'student' && s.section === filterSection && isStudentEnrolledInSubject(s.subjects, filterSubject)).length})
              </span>
              <span className="text-[10px] text-slate-400 font-semibold italic">
                *Changes are stored locally until synced.
              </span>
            </div>

            {accounts.filter(s => s.role === 'student' && s.section === filterSection && isStudentEnrolledInSubject(s.subjects, filterSubject)).length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <span className="material-symbols-outlined text-3xl text-slate-350">group_off</span>
                <p className="text-xs font-bold text-slate-500 mt-2">No students enrolled in {filterSection} for {filterSubject}.</p>
              </div>
            ) : (
              <div className="border border-slate-100 rounded-xl overflow-hidden shadow-2xs bg-white">
                <div className="divide-y divide-slate-100">
                  {accounts.filter(s => s.role === 'student' && s.section === filterSection && isStudentEnrolledInSubject(s.subjects, filterSubject)).map(student => {
                    const status = localRecords[student.email] || 'present';
                    return (
                      <div key={student.email} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold flex items-center justify-center text-sm uppercase shrink-0 shadow-2xs">
                            {student.name.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-xs text-slate-800 leading-none">{student.name}</h4>
                            <p className="text-[10.5px] text-slate-450 mt-1 font-mono">{student.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 self-start sm:self-center">
                          <button
                            type="button"
                            onClick={() => setLocalRecords(prev => ({ ...prev, [student.email]: 'present' }))}
                            className={`px-3.5 py-1.5 rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all border cursor-pointer ${
                              status === 'present' ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-650'
                            }`}
                          >Present</button>
                          <button
                            type="button"
                            onClick={() => setLocalRecords(prev => ({ ...prev, [student.email]: 'late' }))}
                            className={`px-3.5 py-1.5 rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all border cursor-pointer ${
                              status === 'late' ? 'bg-amber-500 border-amber-500 text-white shadow-xs' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-655'
                            }`}
                          >Late</button>
                          <button
                            type="button"
                            onClick={() => setLocalRecords(prev => ({ ...prev, [student.email]: 'absent' }))}
                            className={`px-3.5 py-1.5 rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all border cursor-pointer ${
                              status === 'absent' ? 'bg-rose-600 border-rose-600 text-white shadow-xs' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-650'
                            }`}
                          >Absent</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {accounts.filter(s => s.role === 'student' && s.section === filterSection && isStudentEnrolledInSubject(s.subjects, filterSubject)).length > 0 && (
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={handleSaveAttendance}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl transition-all shadow-sm active:scale-97 cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">cloud_done</span>
                Sync Daily Attendance
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Student Analytics Tab ── */}
      {activeTab === 'analytics' && (() => {
        const enrolled = accounts.filter(
          s => s.role === 'student' && s.section === filterSection && isStudentEnrolledInSubject(s.subjects, filterSubject)
        );
        const subAttendance = attendance.filter(
          a => isSubjectMatch(a.subject, filterSubject) && a.section === filterSection
        );
        const subGrades = grades.filter(
          g => isSubjectMatch(g.subject, filterSubject) && g.section === filterSection
        );

        let totalLogsExpected = 0;
        let totalAttended = 0;
        const absencesRecord: Record<string, number> = {};
        enrolled.forEach(s => {
          absencesRecord[s.email] = 0;
          subAttendance.forEach(log => {
            const status = log.records[s.email];
            if (status) {
              totalLogsExpected++;
              if (status === 'present' || status === 'late') totalAttended++;
              if (status === 'absent') absencesRecord[s.email]++;
            }
          });
        });

        const attendanceRate = totalLogsExpected > 0 ? (totalAttended / totalLogsExpected) * 100 : 100;
        const gradeAverage = subGrades.length > 0 ? subGrades.reduce((sum, g) => sum + g.score, 0) / subGrades.length : 0;

        const distribution = { excellent: 0, good: 0, satisfactory: 0, struggling: 0 };
        subGrades.forEach(g => {
          if (g.score >= 90) distribution.excellent++;
          else if (g.score >= 80) distribution.good++;
          else if (g.score >= 70) distribution.satisfactory++;
          else distribution.struggling++;
        });

        const atRiskStudents = enrolled.map(student => {
          const absenceCount = absencesRecord[student.email] || 0;
          const gradeRec = subGrades.find(g => g.studentEmail === student.email);
          const score = gradeRec ? gradeRec.score : null;
          return { ...student, absences: absenceCount, score };
        }).filter(s => s.absences > 3 || (s.score !== null && s.score < 70));

        let presentCount = 0, lateCount = 0, absentCount = 0;
        subAttendance.forEach(log => {
          enrolled.forEach(s => {
            const status = log.records[s.email];
            if (status === 'present') presentCount++;
            else if (status === 'late') lateCount++;
            else if (status === 'absent') absentCount++;
          });
        });
        const totalStatCount = presentCount + lateCount + absentCount;
        const presentPercent = totalStatCount > 0 ? (presentCount / totalStatCount) * 100 : 100;
        const latePercent = totalStatCount > 0 ? (lateCount / totalStatCount) * 100 : 0;
        const absentPercent = totalStatCount > 0 ? (absentCount / totalStatCount) * 100 : 0;

        return (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div>
                <h3 className="text-lg font-black text-slate-800">Student Analytics Dashboard</h3>
                <p className="text-xs text-slate-450 mt-0.5">Explore comparative visualizations, academic distributions and risk markers.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-150">
                <div>
                  <label className="text-[10px] font-black text-slate-550 uppercase block mb-1">Filter Subject</label>
                  <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)} className="w-full bg-white border border-slate-200 focus:border-[#526069] rounded-xl p-2.5 text-xs outline-none font-bold shadow-sm">
                    <option value="LS1 English - Communication Skills">LS1 English - Communication Skills</option>
                    <option value="LS1 Filipino - Communication Skills">LS1 Filipino - Communication Skills</option>
                    <option value="LS2 Science - Scientific Literacy">LS2 Science - Scientific Literacy</option>
                    <option value="LS3 Mathematics - Problem Solving">LS3 Mathematics - Problem Solving</option>
                    <option value="LS4 Life and Career Skills">LS4 Life and Career Skills</option>
                    <option value="LS5 Understanding Culture and Society">LS5 Understanding Culture and Society</option>
                    <option value="LS6 Digital Literacy">LS6 Digital Literacy</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-550 uppercase block mb-1">Filter Section</label>
                  <select value={filterSection} onChange={(e) => setFilterSection(e.target.value)} className="w-full bg-white border border-slate-200 focus:border-[#526069] rounded-xl p-2.5 text-xs outline-none font-bold shadow-sm">
                    <option value="Section A">Section A</option>
                    <option value="Section B">Section B</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl font-bold">co_present</span>
                </div>
                <div>
                  <span className="text-[10.5px] font-bold text-slate-405 block uppercase leading-none">Average Attendance</span>
                  <span className="text-2xl font-black text-slate-800 mt-1.5 block leading-none">{attendanceRate.toFixed(1)}%</span>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl font-bold">school</span>
                </div>
                <div>
                  <span className="text-[10.5px] font-bold text-slate-405 block uppercase leading-none">Average Class Score</span>
                  <span className="text-2xl font-black text-slate-800 mt-1.5 block leading-none">{gradeAverage > 0 ? `${gradeAverage.toFixed(1)}%` : 'N/A'}</span>
                </div>
              </div>
              <div className={`p-5 rounded-2xl border shadow-sm flex items-center gap-4 transition-colors ${atRiskStudents.length > 0 ? 'bg-rose-50 border-rose-100 animate-pulse' : 'bg-white border-slate-100'}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${atRiskStudents.length > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'}`}>
                  <span className="material-symbols-outlined text-2xl font-bold">warning</span>
                </div>
                <div>
                  <span className="text-[10.5px] font-bold text-slate-405 block uppercase leading-none">At-Risk Students</span>
                  <span className={`text-2xl font-black mt-1.5 block leading-none ${atRiskStudents.length > 0 ? 'text-rose-700' : 'text-slate-800'}`}>
                    {atRiskStudents.length} Active {atRiskStudents.length === 1 ? 'Case' : 'Cases'}
                  </span>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800">Grade Distribution</h4>
                  <p className="text-[10.5px] text-slate-400 mt-0.5">Academic performance groupings for enrolled students.</p>
                </div>
                {subGrades.length === 0 ? (
                  <div className="h-48 flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                    <span className="text-xs font-semibold text-slate-405">No academic scores recorded.</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[
                      { label: 'Excellent (90 - 100%)', count: distribution.excellent, color: 'from-indigo-500 to-purple-500', textColor: 'text-indigo-650' },
                      { label: 'Good (80 - 89%)', count: distribution.good, color: 'from-blue-500 to-cyan-500', textColor: 'text-blue-650' },
                      { label: 'Satisfactory (70 - 79%)', count: distribution.satisfactory, color: 'from-amber-500 to-orange-500', textColor: 'text-amber-650' },
                      { label: 'Needs Improvement (< 70%)', count: distribution.struggling, color: 'from-rose-500 to-red-500', textColor: 'text-rose-700' },
                    ].map(row => (
                      <div key={row.label}>
                        <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                          <span>{row.label}</span>
                          <span className={`${row.textColor} font-extrabold`}>{row.count} Students</span>
                        </div>
                        <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full bg-gradient-to-r ${row.color} rounded-full transition-all duration-1000`} style={{ width: `${subGrades.length > 0 ? (row.count / subGrades.length) * 100 : 0}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800">Attendance Status Breakdown</h4>
                  <p className="text-[10.5px] text-slate-400 mt-0.5">Aggregated status allocations for recorded logs.</p>
                </div>
                {subAttendance.length === 0 ? (
                  <div className="h-48 flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                    <span className="text-xs font-semibold text-slate-405">No attendance history logs recorded.</span>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="w-full h-7 rounded-xl overflow-hidden flex shadow-2xs border border-slate-200/50">
                      <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${presentPercent}%` }}></div>
                      <div className="h-full bg-amber-400 transition-all duration-700" style={{ width: `${latePercent}%` }}></div>
                      <div className="h-full bg-rose-500 transition-all duration-700" style={{ width: `${absentPercent}%` }}></div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 pt-1 text-center text-xs font-bold">
                      <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-100/50">
                        <span className="block text-base font-extrabold text-emerald-600 leading-none">{presentPercent.toFixed(1)}%</span>
                        <span className="text-[9.5px] text-emerald-800/85 uppercase tracking-wider mt-1.5 block">Present</span>
                      </div>
                      <div className="p-3.5 bg-amber-50 text-amber-800 rounded-2xl border border-amber-100/50">
                        <span className="block text-base font-extrabold text-amber-600 leading-none">{latePercent.toFixed(1)}%</span>
                        <span className="text-[9.5px] text-amber-800/85 uppercase tracking-wider mt-1.5 block">Late</span>
                      </div>
                      <div className="p-3.5 bg-rose-50 text-rose-800 rounded-2xl border border-rose-100/50">
                        <span className="block text-base font-extrabold text-rose-600 leading-none">{absentPercent.toFixed(1)}%</span>
                        <span className="text-[9.5px] text-rose-800/85 uppercase tracking-wider mt-1.5 block">Absent</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* At-Risk Registry */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div>
                <h4 className="font-extrabold text-sm text-slate-800">At-Risk Student Registry</h4>
                <p className="text-[10.5px] text-slate-400 mt-0.5">Students flagged due to high absences (&gt;3) or grades below 70%.</p>
              </div>
              {atRiskStudents.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-150">
                  <span className="material-symbols-outlined text-emerald-650 text-3xl font-bold">verified_user</span>
                  <p className="text-xs font-extrabold text-emerald-700 mt-2">Zero cases! Student performance logs are fully healthy.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {atRiskStudents.map(student => {
                    const isAbsenceRisk = student.absences > 3;
                    const isGradeRisk = student.score !== null && student.score < 70;
                    return (
                      <div key={student.email} className="p-4 bg-slate-50 border border-slate-150 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:border-slate-350">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-250 text-rose-700 font-bold flex items-center justify-center text-sm uppercase shrink-0 shadow-2xs">
                            {student.name.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <div>
                            <h5 className="font-extrabold text-xs text-slate-800 leading-none">{student.name}</h5>
                            <p className="text-[10.5px] text-slate-450 mt-1 font-mono">{student.email}</p>
                            <div className="flex gap-1.5 mt-2">
                              {isAbsenceRisk && (
                                <span className="text-[9px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md font-bold uppercase border border-rose-200">
                                  ⚠️ Absences: {student.absences}
                                </span>
                              )}
                              {isGradeRisk && (
                                <span className="text-[9px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md font-bold uppercase border border-rose-200">
                                  ⚠️ Grade: {student.score}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSendHelp(student.name, filterSubject)}
                          className="bg-[#9C27B0] hover:bg-[#8e24aa] text-white font-extrabold text-[10.5px] px-3.5 py-2 rounded-lg transition-all active:scale-95 shadow-sm inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <span className="material-symbols-outlined text-[13px]">send</span>
                          Dispatch Assist Block
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ── Lesson Builder Tab ── */}
      {activeTab === 'content' && (
        <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block bg-indigo-50 px-2 rounded-md w-fit">Content Authoring</span>
            <h3 className="text-xl font-black text-slate-800 tracking-tight mt-1">✏️ Lesson & Quiz Builder</h3>
            <p className="text-xs text-slate-500 mt-1">
              Create rich interactive lessons or link Supabase bucket files directly for your students.
              {teacherSubjects.length < 4 && (
                <span className="ml-1 text-indigo-600 font-bold">
                  Your publishing is scoped to: {teacherSubjects.join(', ')}.
                </span>
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Builder Form */}
            <div className="lg:col-span-3 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h4 className="font-extrabold text-sm text-slate-800 mb-3 block">Configure Lesson Module</h4>

              {/* Mode Toggle */}
              <div className="flex gap-2 p-1 bg-slate-200/50 rounded-xl mb-5 border border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreationMethod('link')}
                  className={`flex-1 py-2 text-center text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                    creationMethod === 'link' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  📁 Direct Bucket File Link
                </button>
                <button
                  type="button"
                  onClick={() => setCreationMethod('interactive')}
                  className={`flex-1 py-2 text-center text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                    creationMethod === 'interactive' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  ✨ Interactive Slide Builder
                </button>
              </div>

              <form onSubmit={handlePublishLesson} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-black text-slate-500 uppercase block mb-1">Module / Lesson Title</label>
                    <input
                      type="text"
                      value={supTitle}
                      onChange={(e) => setSupTitle(e.target.value)}
                      placeholder="e.g. Philippine Agro-Forestry Handout"
                      className="w-full bg-white border border-slate-200 focus:border-[#526069] rounded-xl p-3 text-xs outline-none font-semibold transition-all shadow-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-slate-500 uppercase block mb-1">
                      Subject Area
                      {teacherSubjects.length < 4 && (
                        <span className="ml-1 text-indigo-500 normal-case font-semibold">(your subjects)</span>
                      )}
                    </label>
                    <select
                      value={supCategory}
                      onChange={(e) => setSupCategory(e.target.value as LessonCategory)}
                      className="w-full bg-white border border-slate-200 focus:border-[#526069] rounded-xl p-3 text-xs outline-none font-bold transition-all shadow-sm"
                    >
                      {teacherSubjects.map(subject => (
                        <option key={subject} value={subject}>
                          {subject === 'Science' ? '🧪 Science & Ecosystems' :
                           subject === 'Math' ? '🔢 Mathematics (ALS Path)' :
                           subject === 'English' ? '🗣️ English Communication' :
                           '🛠️ Life Skills & Civics'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-black text-slate-500 uppercase block mb-1">Module Level</label>
                    <select
                      value={supLevel}
                      onChange={(e) => setSupLevel(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 focus:border-[#526069] rounded-xl p-3 text-xs outline-none font-bold transition-all shadow-sm"
                    >
                      <option value="1">Level 1 (Elementary)</option>
                      <option value="2">Level 2 (Secondary Lower)</option>
                      <option value="3">Level 3 (Secondary Advanced)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-slate-500 uppercase block mb-1">Expected Study Duration</label>
                    <input
                      type="text"
                      value={supDuration}
                      onChange={(e) => setSupDuration(e.target.value)}
                      placeholder="e.g. 15 mins"
                      className="w-full bg-white border border-slate-200 focus:border-[#526069] rounded-xl p-3 text-xs outline-none font-semibold transition-all shadow-sm"
                      required
                    />
                  </div>
                </div>

                {creationMethod === 'link' ? (
                  <>
                    <div>
                      <label className="text-[11px] font-black text-slate-500 uppercase block mb-1">🔗 Supabase Bucket Link (PDF, Doc, or Asset URL)</label>
                      <div className="relative rounded-xl shadow-sm">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-indigo-700 text-sm">cloud_sync</span>
                        <input
                          type="url"
                          value={supBucketUrl}
                          onChange={(e) => setSupBucketUrl(e.target.value)}
                          placeholder="https://supabase.co/storage/v1/object/public/buckets/document.pdf"
                          className="w-full bg-white border border-slate-200 focus:border-[#526069] rounded-xl p-3 pl-9 text-xs outline-none font-mono text-indigo-900 transition-all font-semibold"
                          required={creationMethod === 'link'}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">Copy-paste any bucket object reference link directly from your Supabase panel.</span>
                    </div>
                    <div>
                      <label className="text-[11px] font-black text-slate-500 uppercase block mb-1">Summary Description</label>
                      <textarea
                        value={supDescription}
                        onChange={(e) => setSupDescription(e.target.value)}
                        placeholder="Summarize the core topics in this module..."
                        rows={2}
                        className="w-full bg-white border border-slate-200 focus:border-[#526069] rounded-xl p-3 text-xs outline-none font-semibold transition-all shadow-sm"
                      />
                    </div>
                  </>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4 shadow-xs animate-in slide-in-from-top-1 duration-150">
                    <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl flex items-center gap-2">
                      <span className="material-symbols-outlined text-indigo-700 text-[18px]">auto_stories</span>
                      <span className="text-[10px] font-black text-indigo-800">MANUAL TEXTBOOK BUILDER (NO PDF LINK NEEDED)</span>
                    </div>

                    <div className="space-y-6">
                      {/* Slides Section */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4 shadow-xs">
                        <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-indigo-700 text-[18px]">auto_stories</span>
                            <span className="text-[10px] font-black text-indigo-800 uppercase tracking-wider">Dynamic Textbook Slides ({builderSlides.length})</span>
                          </div>
                          <button type="button" onClick={handleAddSlide} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[9px] uppercase px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-transform active:scale-95 whitespace-nowrap">
                            <span className="material-symbols-outlined text-xs">add</span>Add Slide
                          </button>
                        </div>
                        <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                          {builderSlides.map((slide, idx) => (
                            <div key={slide.id} className="bg-slate-50 border border-slate-150 rounded-xl p-4 space-y-3 relative group transition-colors hover:border-slate-300">
                              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                <span className="text-[10.5px] font-black text-indigo-900 uppercase tracking-wider bg-indigo-100/75 px-2 py-0.5 rounded">📖 Slide #{idx + 1}</span>
                                <div className="flex items-center gap-1.5">
                                  <button type="button" onClick={() => handleMoveSlide(idx, 'up')} disabled={idx === 0} className="p-1 rounded bg-white text-slate-500 hover:bg-slate-250 disabled:opacity-30 disabled:pointer-events-none border border-slate-200 cursor-pointer" title="Move Slide Up">
                                    <span className="material-symbols-outlined text-sm block">expand_less</span>
                                  </button>
                                  <button type="button" onClick={() => handleMoveSlide(idx, 'down')} disabled={idx === builderSlides.length - 1} className="p-1 rounded bg-white text-slate-500 hover:bg-slate-250 disabled:opacity-30 disabled:pointer-events-none border border-slate-200 cursor-pointer" title="Move Slide Down">
                                    <span className="material-symbols-outlined text-sm block">expand_more</span>
                                  </button>
                                  <button type="button" onClick={() => handleRemoveSlide(slide.id)} disabled={builderSlides.length <= 1} className="p-1 rounded bg-white text-rose-600 hover:bg-rose-50 hover:border-rose-200 disabled:opacity-30 disabled:pointer-events-none border border-slate-200 cursor-pointer ml-1" title="Delete Slide">
                                    <span className="material-symbols-outlined text-sm block">delete</span>
                                  </button>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div>
                                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Slide Title / Reading Heading</label>
                                  <input type="text" value={slide.title} onChange={(e) => { const updated = [...builderSlides]; updated[idx].title = e.target.value; setBuilderSlides(updated); }} placeholder="e.g. Chapter Foundations" className="w-full bg-white border border-slate-200 focus:border-slate-505 rounded-xl p-2.5 text-xs outline-none font-semibold shadow-xs" required />
                                </div>
                                <div>
                                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Illustration / Unsplash Image URL</label>
                                  <input type="url" value={slide.imageUrl} onChange={(e) => { const updated = [...builderSlides]; updated[idx].imageUrl = e.target.value; setBuilderSlides(updated); }} placeholder="https://images.unsplash.com/... (optional)" className="w-full bg-white border border-slate-200 focus:border-slate-505 rounded-xl p-2.5 text-xs outline-none font-mono text-slate-700 shadow-xs" />
                                </div>
                              </div>
                              <div>
                                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Body Text Content / Chapter Lessons</label>
                                <textarea value={slide.content} onChange={(e) => { const updated = [...builderSlides]; updated[idx].content = e.target.value; setBuilderSlides(updated); }} placeholder="Write or paste paragraph structures for the student to study..." rows={3} className="w-full bg-white border border-slate-200 focus:border-slate-505 rounded-xl p-2.5 text-xs outline-none font-semibold leading-relaxed shadow-xs" required />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Quizzes Section */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4 shadow-xs">
                        <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-emerald-800 text-[18px]">verified</span>
                            <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">Dynamic Interactive Quizzes ({builderQuizzes.length})</span>
                          </div>
                          <button type="button" onClick={handleAddQuiz} className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[9px] uppercase px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-transform active:scale-95 whitespace-nowrap">
                            <span className="material-symbols-outlined text-xs">add</span>Add Question
                          </button>
                        </div>
                        <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                          {builderQuizzes.map((q, idx) => (
                            <div key={q.id} className="bg-slate-50 border border-slate-150 rounded-xl p-4 space-y-3 relative group transition-colors hover:border-slate-300">
                              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                <span className="text-[10.5px] font-black text-emerald-800 uppercase tracking-wider bg-emerald-100/70 px-2 py-0.5 rounded">✓ Check #{idx + 1}</span>
                                <div className="flex items-center gap-1.5">
                                  <button type="button" onClick={() => handleMoveQuiz(idx, 'up')} disabled={idx === 0} className="p-1 rounded bg-white text-slate-500 hover:bg-slate-250 disabled:opacity-30 disabled:pointer-events-none border border-slate-200 cursor-pointer">
                                    <span className="material-symbols-outlined text-sm block">expand_less</span>
                                  </button>
                                  <button type="button" onClick={() => handleMoveQuiz(idx, 'down')} disabled={idx === builderQuizzes.length - 1} className="p-1 rounded bg-white text-slate-500 hover:bg-slate-250 disabled:opacity-30 disabled:pointer-events-none border border-slate-200 cursor-pointer">
                                    <span className="material-symbols-outlined text-sm block">expand_more</span>
                                  </button>
                                  <button type="button" onClick={() => handleRemoveQuiz(q.id)} disabled={builderQuizzes.length <= 1} className="p-1 rounded bg-white text-rose-600 hover:bg-rose-50 hover:border-rose-200 disabled:opacity-30 disabled:pointer-events-none border border-slate-200 cursor-pointer ml-1">
                                    <span className="material-symbols-outlined text-sm block">delete</span>
                                  </button>
                                </div>
                              </div>
                              <div>
                                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Assessment Question Text</label>
                                <input type="text" value={q.question} onChange={(e) => { const updated = [...builderQuizzes]; updated[idx].question = e.target.value; setBuilderQuizzes(updated); }} placeholder="e.g. Which of these options can expand root growth in agricultural fields?" className="w-full bg-white border border-slate-200 focus:border-slate-505 rounded-xl p-2.5 text-xs outline-none font-semibold shadow-xs" required />
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-1 border-b border-dashed border-slate-200">
                                <div>
                                  <label className="text-[10px] font-extrabold uppercase text-[#526a79] block mb-0.5">Option A (Min Required)</label>
                                  <input type="text" value={q.options.A} onChange={(e) => { const updated = [...builderQuizzes]; updated[idx].options.A = e.target.value; setBuilderQuizzes(updated); }} placeholder="A) Loam compost soil" className="w-full bg-white border border-slate-205 rounded-xl p-2.5 text-xs outline-none font-semibold" required />
                                </div>
                                <div>
                                  <label className="text-[10px] font-extrabold uppercase text-[#526a79] block mb-0.5">Option B (Min Required)</label>
                                  <input type="text" value={q.options.B} onChange={(e) => { const updated = [...builderQuizzes]; updated[idx].options.B = e.target.value; setBuilderQuizzes(updated); }} placeholder="B) Silt clay blends" className="w-full bg-white border border-slate-205 rounded-xl p-2.5 text-xs outline-none font-semibold" required />
                                </div>
                                <div>
                                  <label className="text-[10px] font-extrabold uppercase text-slate-450 block mb-0.5">Option C (Optional)</label>
                                  <input type="text" value={q.options.C} onChange={(e) => { const updated = [...builderQuizzes]; updated[idx].options.C = e.target.value; setBuilderQuizzes(updated); }} placeholder="C) Sandy desert structures" className="w-full bg-white border border-slate-205 rounded-xl p-2.5 text-xs outline-none font-semibold" />
                                </div>
                                <div>
                                  <label className="text-[10px] font-extrabold uppercase text-slate-450 block mb-0.5">Option D (Optional)</label>
                                  <input type="text" value={q.options.D} onChange={(e) => { const updated = [...builderQuizzes]; updated[idx].options.D = e.target.value; setBuilderQuizzes(updated); }} placeholder="D) Dry gravel rocks" className="w-full bg-white border border-slate-205 rounded-xl p-2.5 text-xs outline-none font-semibold" />
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                                <div>
                                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Designate Correct Answer Choice</label>
                                  <select value={q.correctAnswer} onChange={(e) => { const updated = [...builderQuizzes]; updated[idx].correctAnswer = e.target.value as 'A' | 'B' | 'C' | 'D'; setBuilderQuizzes(updated); }} className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none font-bold">
                                    <option value="A">Option A is Correct</option>
                                    <option value="B">Option B is Correct</option>
                                    <option value="C" disabled={!q.options.C.trim()}>Option C is Correct {!q.options.C.trim() && "(Define Option C first)"}</option>
                                    <option value="D" disabled={!q.options.D.trim()}>Option D is Correct {!q.options.D.trim() && "(Define Option D first)"}</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Feedback / Correct Explanation</label>
                                  <input type="text" value={q.explanation} onChange={(e) => { const updated = [...builderQuizzes]; updated[idx].explanation = e.target.value; setBuilderQuizzes(updated); }} placeholder="e.g. Yes! Loam offers wonderful oxygen retention." className="w-full bg-white border border-slate-200 focus:border-slate-505 rounded-xl p-2.5 text-xs outline-none font-semibold shadow-xs" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full cursor-pointer py-3.5 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-xs rounded-xl shadow-md tracking-wider uppercase flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-purple-700 active:scale-[0.99] transition-all"
                >
                  <span className="material-symbols-outlined text-sm">published_with_changes</span>
                  {creationMethod === 'interactive' ? 'Publish Rich Textbook Slides' : 'Register & Bind Lesson Module'}
                </button>
              </form>
            </div>

            {/* My Published Lessons */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider block">My Published Lessons</h4>
              {myLessons.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-slate-150 rounded-2xl text-center text-slate-400">
                  <span className="material-symbols-outlined text-3xl mb-1.5 block">edit_note</span>
                  <p className="text-xs font-semibold">No lessons published yet.</p>
                  <p className="text-[10px] text-slate-450 mt-1">Use the form to create and publish your first lesson module.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                  {myLessons.map((l) => (
                    <div key={l.id} className="p-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-150 rounded-xl space-y-3 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="inline-flex px-2 py-0.5 rounded-md text-[9px] font-black uppercase mb-1.5 bg-indigo-50 text-indigo-700">{l.category}</span>
                          <h5 className="font-black text-xs text-slate-800 leading-tight block truncate" title={l.title}>{l.title}</h5>
                        </div>
                        <button onClick={() => onRemoveLesson(l.id)} className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-slate-200 transition-colors cursor-pointer shrink-0" title="Delete Lesson">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                      <p className="text-[10.5px] text-slate-500 line-clamp-2 leading-relaxed">{l.description}</p>
                      {l.bucketUrl ? (
                        <div className="flex items-center gap-2 pt-1 border-t border-slate-200 text-[10px] font-mono select-all text-indigo-700 font-bold truncate">
                          <span className="material-symbols-outlined text-xs shrink-0">link</span>
                          <a href={l.bucketUrl} target="_blank" rel="noreferrer" className="underline truncate shrink-1 hover:text-indigo-950">{l.bucketUrl}</a>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 pt-1 border-t border-slate-150 text-[10px] font-sans text-indigo-700 font-extrabold">
                          <span className="material-symbols-outlined text-[14px] shrink-0 text-indigo-500">auto_stories</span>
                          <span>Interactive Slide Module Package</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 text-indigo-800">
                <h5 className="font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1.5 text-indigo-900 mb-1">
                  <span className="material-symbols-outlined text-xs">info</span>
                  Where do students access this?
                </h5>
                <p className="text-[10px] leading-relaxed text-indigo-800">
                  Lessons you publish here stream directly into the student's <strong>Lessons Browser</strong> and become immediately available for study and quiz interaction.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
