import React, { useState } from 'react';
import { Lesson } from '../types';

const categoryDefaults: Record<string, string> = {
  'LS3 Mathematics':      'https://images.unsplash.com/photo-1596495578065-6e0763fa1118?auto=format&fit=crop&w=1200&q=80',
  'LS2 Science':          'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80',
  'LS1 English':          'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80',
  'LS1 Filipino':         'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80',
  'LS4 Life Skills':      'https://images.unsplash.com/photo-1526367790999-015078648c2a?auto=format&fit=crop&w=1200&q=80',
  'LS5 Culture & Society':'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80',
  'LS6 Digital Literacy': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
  // Legacy aliases for backward compat with any Firestore docs still using old names
  Math:    'https://images.unsplash.com/photo-1596495578065-6e0763fa1118?auto=format&fit=crop&w=1200&q=80',
  Science: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80',
  English: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80',
  Filipino:'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80',
  Social:  'https://images.unsplash.com/photo-1526367790999-015078648c2a?auto=format&fit=crop&w=1200&q=80',
  default: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80'
};

export function normalizeImageUrl(url: string | undefined, category?: string): string {
  if (!url) {
    return categoryDefaults[category || ''] || categoryDefaults.default;
  }
  
  const trimmed = url.trim();
  
  if (trimmed.toLowerCase() === 'random' || trimmed === '') {
    return categoryDefaults[category || ''] || categoryDefaults.default;
  }
  
  // Convert standard Unsplash photo web page links to raw CDN links so they load in standard <img> tags
  const unsplashPageRegex = /unsplash\.com\/photos\/([a-zA-Z0-9\-_]+)/;
  const match = trimmed.match(unsplashPageRegex);
  if (match && match[1]) {
    const rawPhotoId = match[1];
    const segments = rawPhotoId.split('-');
    const finalPhotoId = segments[segments.length - 1] || rawPhotoId;
    return `https://images.unsplash.com/photo-${finalPhotoId}?auto=format&fit=crop&w=1200&q=80`;
  }
  
  return trimmed;
}

interface ActiveClassroomProps {
  lesson: Lesson;
  onAddCoins: (coins: number) => void;
  onClose: () => void;
}

export default function ActiveClassroom({ lesson, onAddCoins, onClose }: ActiveClassroomProps) {
  const [selectedPart, setSelectedPart] = useState<number>(1);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizzesSubmitted, setQuizzesSubmitted] = useState<Record<number, boolean>>({});
  const [quizFeedbacks, setQuizFeedbacks] = useState<Record<number, string>>({});
  const [rfAnswers, setRfAnswers] = useState<Record<number, 'reality' | 'fantasy'>>({});
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const isSupabase = !!lesson.bucketUrl;
  const hasCustomParts = !!lesson.parts && lesson.uploadedBy === 'Admin Superintendent';

  interface DisplayPart {
    id: number;
    type: 'slide' | 'quiz' | 'supabase' | 'default';
    title: string;
    icon: string;
    slideIndex?: number;
    quizIndex?: number;
  }

  const lessonParts = lesson.parts || [];
  const quizArray = lesson.quizzes || (lesson.quiz ? [lesson.quiz] : []);

  const parts: DisplayPart[] = hasCustomParts ? [
    ...lessonParts.map((part, idx) => ({
      id: idx + 1,
      type: 'slide' as const,
      title: `${idx + 1}. ${part.title}`,
      icon: part.icon || (idx === 0 ? 'auto_stories' : idx % 2 === 1 ? 'school' : 'psychology'),
      slideIndex: idx
    })),
    ...quizArray.map((q, idx) => ({
      id: lessonParts.length + idx + 1,
      type: 'quiz' as const,
      title: `${lessonParts.length + idx + 1}. Quiz Option Check #${idx + 1}`,
      icon: 'verified',
      quizIndex: idx
    }))
  ] : isSupabase ? [
    { id: 1, type: 'supabase' as const, title: '1. Supabase Document', icon: 'cloud_download' },
    { id: 2, type: 'supabase' as const, title: '2. Learning Objectives', icon: 'menu_book' },
    { id: 3, type: 'supabase' as const, title: '3. Lesson Quiz', icon: 'verified' }
  ] : [
    { id: 1, type: 'default' as const, title: '1. What is an Ecosystem?', icon: 'eco' },
    { id: 2, type: 'default' as const, title: '2. Nutrient Cycles', icon: 'sync' },
    { id: 3, type: 'default' as const, title: '3. Food Chains & Energy', icon: 'bolt' }
  ];

  const activePartInfo = parts.find(p => p.id === selectedPart) || parts[0];

  const getCustomQuiz = (quizIdx: number) => {
    const q = quizArray[quizIdx];
    if (!q) return null;

    const keys = ['A', 'B', 'C', 'D'] as const;
    return {
      question: q.question,
      options: q.options.map((opt, idx) => {
        const key = keys[idx] || 'A';
        const prefix = `${key}) `;
        const isPrefixed = opt.toUpperCase().startsWith(`${key})`) || 
                           opt.toUpperCase().startsWith(`${key}:`) || 
                           opt.toUpperCase().startsWith(prefix);
        return {
          key,
          text: isPrefixed ? opt : `${key}) ${opt}`
        };
      }),
      correct: q.correctAnswer,
      explanation: q.explanation || `Excellent! Correct answer. You have successfully finished the custom ${lesson.category} lesson. +100 Coins added!`
    };
  };

  // Tailored questions for custom Supabase category assets
  const getSupabaseQuiz = () => {
    switch (lesson.category as string) {
      case 'LS3 Mathematics':
      case 'Math':
        return {
          question: 'If an ALS student completes 3 units every 2 days, what is the unit rate of completions per day?',
          options: [
            { key: 'A', text: 'A) 1.5 units per day' },
            { key: 'B', text: 'B) 0.67 units per day' },
            { key: 'C', text: 'C) 6 units per day' }
          ],
          correct: 'A',
          explanation: 'Exactly! 3 divided by 2 is 1.5 units per day. You have mastered ratios from this Supabase Math worksheet! +100 Coins added.'
        };
      case 'LS2 Science':
      case 'Science':
        return {
          question: 'Which of the following describes the biological function of trees during Carbon Fixation?',
          options: [
            { key: 'A', text: 'A) Absorbing atmospheric CO2 to store carbon and release oxygen' },
            { key: 'B', text: 'B) Generating heavy nitrogen isotopes through evaporation' },
            { key: 'C', text: 'C) Causing atmospheric tremors' }
          ],
          correct: 'A',
          explanation: 'Spot on! Photosynthesis enables carbon fixation, lowering pollutants. Magnificent work! +105 Coins added.'
        };
      case 'LS1 English':
      case 'English':
        return {
          question: 'In standard communicative writing, why is outlining a blueprint critical before draft generation?',
          options: [
            { key: 'A', text: 'A) It guarantees logical progression and avoids token sprawl structure' },
            { key: 'B', text: 'B) It bypasses all editing rules' },
            { key: 'C', text: 'C) It is unneeded in modern dialects' }
          ],
          correct: 'A',
          explanation: 'Excellent choice! Pre-draft outlines establish sequential hierarchy in communication. +100 Coins added.'
        };
      case 'LS1 Filipino':
      case 'Filipino':
        return {
          question: 'Bakit mahalaga ang wasto at malinaw na pakikipag-usap sa pang-araw-araw na buhay?',
          options: [
            { key: 'A', text: 'A) Nakakatulong ito upang maipahayag nang maayos ang ating mga ideya at damdamin' },
            { key: 'B', text: 'B) Hindi ito mahalaga sa makabagong lipunan' },
            { key: 'C', text: 'C) Para lamang sa mga propesyonal' }
          ],
          correct: 'A',
          explanation: 'Tama! Ang malinaw na komunikasyon ay susi sa matagumpay na pakikipag-ugnayan sa lipunan. +100 Coins added.'
        };
      case 'LS5 Culture & Society':
        return {
          question: 'Which best describes why understanding local culture is important for community development?',
          options: [
            { key: 'A', text: 'A) It helps people respect traditions and work together effectively' },
            { key: 'B', text: 'B) Culture has no impact on development' },
            { key: 'C', text: 'C) Only external factors matter for progress' }
          ],
          correct: 'A',
          explanation: 'Great insight! Cultural understanding fosters unity and drives inclusive community progress. +100 Coins added.'
        };
      case 'LS6 Digital Literacy':
        return {
          question: 'What is the most important practice when using online information for research?',
          options: [
            { key: 'A', text: 'A) Verify sources and cross-check facts before using the information' },
            { key: 'B', text: 'B) Accept all online content as true without checking' },
            { key: 'C', text: 'C) Only use social media as a source' }
          ],
          correct: 'A',
          explanation: 'Excellent! Critical evaluation of digital sources is a core digital literacy skill. +100 Coins added.'
        };
      default:
        return {
          question: 'What is the primary action recommended to make the most of Superintendent-assigned Supabase modules?',
          options: [
            { key: 'A', text: 'A) Review the bucket document file, grasp the overview, and answer the check. +100 Coins reward' },
            { key: 'B', text: 'B) Avoid reading the directives and proceed blind' },
            { key: 'C', text: 'C) Report the bucket files as system anomalies' }
          ],
          correct: 'A',
          explanation: 'Correct! Reading the cloud handouts allows students to match vocational skills perfectly. +100 Coins added.'
        };
    }
  };

  const currentQuiz = getSupabaseQuiz();

  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePartInfo) return;

    if (activePartInfo.type === 'quiz') {
      const qIdx = activePartInfo.quizIndex ?? 0;
      const ans = quizAnswers[qIdx];
      if (!ans) return;

      const qDetails = getCustomQuiz(qIdx);
      if (!qDetails) return;

      if (ans === qDetails.correct) {
        setQuizFeedbacks(prev => ({ ...prev, [qIdx]: qDetails.explanation }));
        setQuizzesSubmitted(prev => ({ ...prev, [qIdx]: true }));
        onAddCoins(100);
      } else {
        setQuizFeedbacks(prev => ({ ...prev, [qIdx]: 'Incorrect answer. Re-read the objectives or chapters above and try again!' }));
      }
    } else if (isSupabase) {
      const ans = quizAnswers[-1];
      if (!ans) return;

      if (ans === currentQuiz.correct) {
        setQuizFeedbacks(prev => ({ ...prev, [-1]: currentQuiz.explanation }));
        setQuizzesSubmitted(prev => ({ ...prev, [-1]: true }));
        onAddCoins(100);
      } else {
        setQuizFeedbacks(prev => ({ ...prev, [-1]: 'Incorrect answer. Re-read the objectives or consult your mentor. Try again!' }));
      }
    } else {
      const ans = quizAnswers[-1];
      if (!ans) return;

      if (ans === 'A') {
        setQuizFeedbacks(prev => ({ ...prev, [-1]: 'Tama! Correct! 🎉 The sun is the absolute primary energy source powering all plants (producers) on Earth through Photosynthesis. You earned +100 Coins!' }));
        setQuizzesSubmitted(prev => ({ ...prev, [-1]: true }));
        onAddCoins(100);
      } else {
        setQuizFeedbacks(prev => ({ ...prev, [-1]: 'Not quite! Think of where plants get their primary source of light to make food. Try again!' }));
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col lg:flex-row h-full min-h-[500px]">
      
      {/* Lesson Index Sidebar */}
      <div className="w-full lg:w-72 bg-slate-50 border-r border-slate-100 p-6 shrink-0 flex flex-col justify-between space-y-6">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="p-1 px-2.5 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 bg-slate-100 transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back
            </button>
            <div className="min-w-0 flex-1">
              <span className="text-[9px] font-black uppercase text-indigo-700 block bg-indigo-50 px-1.5 py-0.5 rounded w-fit tracking-wider">Active Study</span>
              <span className="text-xs font-black text-slate-800 block truncate" title={lesson.title}>{lesson.title}</span>
            </div>
          </div>

          {/* Index Links */}
          <div className="space-y-1 max-h-[350px] overflow-y-auto pr-1">
            {parts.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedPart(p.id);
                }}
                className={`w-full p-3 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                  selectedPart === p.id 
                    ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-xs scale-[1.02]' 
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <span className="material-symbols-outlined text-[17px] shrink-0">{p.icon}</span>
                <span className="truncate block flex-1">{p.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Tip block */}
        <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-100/70 text-amber-900 shrink-0">
          <span className="font-extrabold text-[9px] uppercase tracking-wider block text-amber-800">Estimated Duration</span>
          <span className="font-black text-xs block mt-0.5">{lesson.duration || '15 mins'} total study time</span>
        </div>
      </div>

      {/* Lesson Active Slide Content */}
      <div className="flex-1 p-6 lg:p-8 space-y-6 flex flex-col justify-between overflow-y-auto w-full">
        
        {/* Content Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 shrink-0">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 block">
                {hasCustomParts ? `Interactive Blueprint • ${lesson.category}` : isSupabase ? `Supabase Cloud Asset • ${lesson.category}` : `Secondary Education • ${lesson.category}`}
              </span>
              <h3 className="text-xl font-extrabold text-slate-800 tracking-tight mt-1">
                {hasCustomParts 
                  ? (activePartInfo?.type === 'slide' 
                      ? lessonParts[activePartInfo.slideIndex!].title 
                      : `Review Assessments Check`) 
                  : isSupabase 
                    ? lesson.title 
                    : "Ecosystems & Bio-diversity balance"}
              </h3>
            </div>
            <span className="text-[11px] font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-full shrink-0">
              Page {selectedPart} of {parts.length}
            </span>
          </div>

          {/* Type 1: Custom Textbook Slide Reading */}
          {activePartInfo?.type === 'slide' && (() => {
            const rawUrl = lessonParts[activePartInfo.slideIndex!].imageUrl;
            const normalizedUrl = normalizeImageUrl(rawUrl, lesson.category);
            const isError = rawUrl ? !!imageErrors[rawUrl] : false;

            return (
              <div className="space-y-6 animate-in fade-in duration-200">
                {rawUrl && (
                  <div className="w-full h-56 rounded-2xl overflow-hidden shadow-sm aspect-video relative bg-slate-50">
                    {isError ? (
                      <div className="w-full h-full relative group">
                        <img 
                          src={normalizeImageUrl('random', lesson.category)} 
                          alt="Category fallback" 
                          className="w-full h-full object-cover filter brightness-[0.4]"
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
                          <span className="material-symbols-outlined text-[#FF9800] text-3xl mb-1.5">image_not_supported</span>
                          <h4 className="text-xs font-black tracking-tight text-white">Hotlink Preview Blocked by Domain</h4>
                          <p className="text-[10px] text-slate-300 max-w-sm mt-1 leading-normal font-sans">
                            Direct reference URL has premium website protection. However, we have loaded a gorgeous safe <strong>{lesson.category}</strong> cover context for you!
                          </p>
                        </div>
                      </div>
                    ) : (
                      <img 
                        src={normalizedUrl} 
                        alt={lessonParts[activePartInfo.slideIndex!].title} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={() => {
                          if (rawUrl) {
                            setImageErrors(prev => ({ ...prev, [rawUrl]: true }));
                          }
                        }}
                      />
                    )}
                  </div>
                )}
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-slate-705 leading-relaxed whitespace-pre-line font-sans bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                    {lessonParts[activePartInfo.slideIndex!].content}
                  </p>
                </div>
              </div>
            );
          })()}

          {/* Type 2: Custom Lesson Multiple Quizzes (Option A-D support) */}
          {activePartInfo?.type === 'quiz' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {(() => {
                const qIdx = activePartInfo.quizIndex ?? 0;
                const qDetails = getCustomQuiz(qIdx);
                if (!qDetails) return null;
                const isSubmitted = !!quizzesSubmitted[qIdx];
                const feedbackText = quizFeedbacks[qIdx] || '';
                const currentAns = quizAnswers[qIdx] || null;

                return (
                  <div className="bg-indigo-50/50 border border-indigo-100 p-6 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-indigo-700">psychology</span>
                      <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                        Review Question Check #{qIdx + 1} of {quizArray.length}
                      </h4>
                    </div>

                    <p className="text-sm font-black text-indigo-950 font-sans">
                      {qDetails.question}
                    </p>

                    <form onSubmit={handleQuizSubmit} className="space-y-2.5">
                      {qDetails.options.map((opt) => (
                        <label 
                          key={opt.key} 
                          className={`flex items-center gap-3 p-3.5 bg-white border rounded-xl cursor-pointer transition-all ${
                            currentAns === opt.key 
                              ? 'border-indigo-505 bg-indigo-50/40 text-indigo-900 border-indigo-500' 
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <input 
                            type="radio" 
                            name={`q-ans-${qIdx}`} 
                            value={opt.key} 
                            checked={currentAns === opt.key} 
                            onChange={(e) => setQuizAnswers(prev => ({ ...prev, [qIdx]: e.target.value }))}
                            disabled={isSubmitted}
                            className="text-indigo-600 focus:ring-indigo-500 cursor-pointer w-4 h-4"
                          />
                          <span className="text-xs font-bold text-slate-700 font-sans">{opt.text}</span>
                        </label>
                      ))}

                      {!isSubmitted ? (
                        <button 
                          type="submit"
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-sm tracking-wider uppercase mt-4 cursor-pointer"
                        >
                          Verify Answer Choice
                        </button>
                      ) : (
                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs font-semibold leading-relaxed animate-in slide-in-from-top-1">
                          <span className="material-symbols-outlined text-[16px] text-emerald-700 align-middle mr-1.5">check_circle</span>
                          {feedbackText}
                        </div>
                      )}

                      {!isSubmitted && feedbackText && (
                        <div className="p-3.5 bg-rose-50 text-rose-800 text-xs font-bold rounded-xl border border-rose-100">
                          <span className="material-symbols-outlined text-[16px] text-rose-600 align-middle mr-1.5">cancel</span>
                          {feedbackText}
                        </div>
                      )}
                    </form>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Type 3: Supabase Cloud documents layout */}
          {activePartInfo?.type === 'supabase' && (
            <>
              {activePartInfo.id === 1 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 flex flex-col justify-between md:flex-row items-start md:items-center gap-6 shadow-sm">
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase bg-[#FF9800] text-slate-900">
                        Supabase Bucket Link Ready
                      </span>
                      <h4 className="text-base font-black tracking-tight leading-tight block">
                        Admin-released file blueprint is loaded.
                      </h4>
                      <p className="text-xs text-slate-400">
                        Access the original storage bucket item directly in a new secure window view.
                      </p>
                    </div>
                    
                    {lesson.bucketUrl && (
                      <a
                        href={lesson.bucketUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-indigo-600 hover:bg-indigo-700 cursor-pointer text-white font-black text-xs px-4 py-3 rounded-xl flex items-center gap-2 shrink-0 transition-transform active:scale-[0.98]"
                      >
                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                        Open Bucket URL
                      </a>
                    )}
                  </div>

                  <div className="p-5 border border-dashed border-slate-200 rounded-2xl space-y-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Integrated Media Frame Preview</span>
                    <div className="bg-slate-50 rounded-xl p-8 text-center text-slate-400 border border-slate-100 flex flex-col items-center justify-center space-y-3">
                      <span className="material-symbols-outlined text-4xl text-indigo-600">picture_as_pdf</span>
                      <div className="max-w-md">
                        <p className="text-xs font-black text-slate-800 leading-tight truncate">{lesson.title}</p>
                        <p className="text-[10px] text-slate-450 mt-1 font-mono select-all text-indigo-600 truncate">
                          {lesson.bucketUrl}
                        </p>
                      </div>
                      <p className="text-[10px] max-w-md text-slate-500 leading-relaxed">
                        This module relies on cloud file storage directories. Click the button above to read, print, or review the complete materials released by the superintendent.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activePartInfo.id === 2 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-150 space-y-4 text-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-indigo-600">bookmark</span>
                      <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider block">Assigned Lesson summary</h4>
                    </div>
                    <p className="text-sm font-semibold leading-relaxed">
                      {lesson.description}
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Release Platform</span>
                        <span className="text-xs font-black text-slate-800 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></span>
                          Supabase Bucket Storage
                        </span>
                      </div>

                      <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Author Authority</span>
                        <span className="text-xs font-black text-slate-800">
                          {lesson.uploadedBy || "System Administrator"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3 text-amber-900">
                    <span className="material-symbols-outlined text-amber-700 shrink-0">info</span>
                    <div className="text-xs space-y-1">
                      <p className="font-black">Ready for your Lesson Quiz?</p>
                      <p className="text-amber-800">
                        Once you have studied the linked storage modules, click the &quot;Next Part&quot; navigation button downwards to unlock your +100 Coins review test.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activePartInfo.id === 3 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-indigo-700">psychology</span>
                      <h4 className="font-extrabold text-base text-slate-800">
                        Review Quiz: {lesson.category} Quiz
                      </h4>
                    </div>
                    
                    <p className="text-sm font-semibold text-slate-700 font-sans">
                      {currentQuiz.question}
                    </p>

                    <form onSubmit={handleQuizSubmit} className="space-y-3">
                      {currentQuiz.options.map((opt) => (
                        <label key={opt.key} className="flex items-center gap-3 p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                          <input 
                            type="radio" 
                            name="q-ans-sb" 
                            value={opt.key} 
                            checked={(quizAnswers[-1] || null) === opt.key} 
                            onChange={(e) => setQuizAnswers(prev => ({ ...prev, [-1]: e.target.value }))}
                            disabled={!!quizzesSubmitted[-1]}
                            className="text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                          <span className="text-xs font-bold text-slate-700">{opt.text}</span>
                        </label>
                      ))}

                      {!quizzesSubmitted[-1] ? (
                        <button 
                          type="submit"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-md mt-2 cursor-pointer"
                        >
                          Verify Answer
                        </button>
                      ) : (
                        <div className="p-4 bg-emerald-50 rounded-xl text-emerald-800 text-xs font-semibold leading-relaxed">
                          {quizFeedbacks[-1] || ''}
                        </div>
                      )}

                      {!quizzesSubmitted[-1] && quizFeedbacks[-1] && (
                        <div className="p-3.5 bg-rose-50 text-rose-800 text-xs font-bold rounded-xl font-sans">
                          {quizFeedbacks[-1]}
                        </div>
                      )}
                    </form>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Type 4: Built-in general default curriculum lessons */}
          {activePartInfo?.type === 'default' && (
            <>
              {activePartInfo.id === 1 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="w-full h-56 rounded-2xl overflow-hidden shadow-sm aspect-video">
                    <img 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTdnkTbMTcfe3EVpE_WFb-IYjbHjlc4Fj5n4PJskLfJ___muUVwBSnaRauufk7tpubRtemsghf2lYhK5n9zeuVhwVoUpgVLQPxWyAPvK1CWuaxlSft8EjSu540sjYYwEcdLBWSQZm7alxidVQKeYXDbKGIXHEllNQf9Ff2WBqDA6MhtFcaKhbcLQVmV4OuY2Iw9Une1gnaWnpgQxJXjWHvI8i2v3MiICz8loe066Bq0COU8PorEljLV4Q03f3At381AR9gw4nJ1GY" 
                      alt="Ecosystem ecology visual" 
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-4">
                    <p className="text-base font-medium text-slate-700 leading-relaxed">
                      An **ecosystem** is a community of living organisms in conjunction with the nonliving components of their environment, interacting as a system. These biotic and abiotic components are linked together through nutrient cycles and energy flows.
                    </p>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Think of a peaceful lake or forest. Every frog, lily pad, water molecule, and golden ray of sunshine works in unity. If any element — like water purity — deteriorates, the balance decomposes, affecting fish and vegetation alike.
                    </p>
                  </div>
                </div>
              )}

              {activePartInfo.id === 2 && (
                lesson.id === 'eng-reality-fantasy' ? (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div className="bg-indigo-50 border border-indigo-150 p-4 rounded-2xl flex items-center gap-3">
                      <span className="material-symbols-outlined text-indigo-700 text-2xl font-light">tips_and_updates</span>
                      <div>
                        <span className="font-extrabold text-[10px] uppercase text-indigo-700 tracking-wider block">
                          ACTIVITY 2: Reality or Fantasy?
                        </span>
                        <p className="text-xs font-semibold text-slate-600 mt-0.5">
                          Check each alternative scenario card. Tap <strong>Reality (Real)</strong> if it can happen, or <strong>Fantasy (Make-believe)</strong> if it is just imagination!
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {[
                        { id: 1, text: 'A mother kissing and cuddling her baby.', type: 'reality', emoji: '👩‍👦', hint: 'This represents normal parental care and family bonding. It is fully Real!' },
                        { id: 2, text: 'A friendly white ghost floating in the air.', type: 'fantasy', emoji: '👻', hint: 'Ghosts are mythical spirits that cannot be proven or touched in real life.' },
                        { id: 3, text: 'A winged fairy flying and sprinkling magical dust.', type: 'fantasy', emoji: '🧚‍♀️', hint: 'Fairies with wings and magic dust exist only in fictional fairy tales!' },
                        { id: 4, text: 'A person riding a motorcycle down the highway.', type: 'reality', emoji: '🏍️', hint: 'Modern motorbikes are standard physical vehicles people ride every day.' },
                        { id: 5, text: 'Santa Claus riding a sleigh with flying reindeer.', type: 'fantasy', emoji: '🎅', hint: 'Sleighs pulled by flying reindeer through the stars are traditional seasonal fantasy tales!' }
                      ].map((item) => {
                        const ans = rfAnswers[item.id];
                        const isCorrect = ans === item.type;
                        const isSubmitted = !!ans;

                        return (
                          <div 
                            key={item.id} 
                            className={`p-3.5 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                              isSubmitted
                                ? isCorrect
                                  ? 'bg-emerald-50/70 border-emerald-200 shadow-3xs'
                                  : 'bg-rose-50/70 border-rose-200 shadow-3xs'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-2xl bg-slate-100 p-2 rounded-lg block select-none shrink-0">
                                {item.emoji}
                              </span>
                              <div>
                                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Section #{item.id}</span>
                                <p className="text-xs font-black text-slate-800 leading-tight mt-0.5">{item.text}</p>
                                
                                {isSubmitted && (
                                  <p className={`text-[10px] font-bold mt-1 leading-snug ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                                    {isCorrect ? `✓ Correct! ${item.hint}` : `✗ Try again! Think: ${item.hint}`}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                              <button
                                type="button"
                                onClick={() => {
                                  setRfAnswers(prev => ({ ...prev, [item.id]: 'reality' }));
                                  if (item.type === 'reality' && rfAnswers[item.id] !== 'reality') {
                                    onAddCoins(10);
                                  }
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                                  ans === 'reality'
                                    ? item.type === 'reality'
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/85 hover:text-slate-900'
                                }`}
                              >
                                Reality
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setRfAnswers(prev => ({ ...prev, [item.id]: 'fantasy' }));
                                  if (item.type === 'fantasy' && rfAnswers[item.id] !== 'fantasy') {
                                    onAddCoins(10);
                                  }
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                                  ans === 'fantasy'
                                    ? item.type === 'fantasy'
                                      ? 'bg-indigo-600 text-white shadow-xs'
                                      : 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/85 hover:text-slate-900'
                                }`}
                              >
                                Fantasy
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3 text-amber-900">
                      <span className="material-symbols-outlined text-amber-700 shrink-0">task_alt</span>
                      <div className="text-xs space-y-1">
                        <p className="font-extrabold">Ready to Complete the Lesson?</p>
                        <p className="text-amber-800 leading-relaxed">
                          Tap the option buttons for all 5 cards! Once done, click <strong>Next Part</strong> down below to proceed to the Page 4 Post-Test check!
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div className="w-full h-56 rounded-2xl overflow-hidden shadow-sm aspect-video">
                      <img 
                        src="https://lh3.googleusercontent.com/anywhere" 
                        alt="Planted sprout nature" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://lh3.googleusercontent.com/aida-public/AB6AXuAJyvH30uHe26QqhBfpDQuAHjwoyAs1BdvCupuu9Snf3yjhNLq2y3vT35OvoYoFyCU5aVXhCmVGSJ8rmHepnIAcFRkcXOURqyxc0ItCZRWS31xbLTwTRR4amXaHdh1l0mu6m_rNmI21EZ5SX11eafxQ4x9j79WVXaRBhtHf2amoGNcuw0r0EIL90HGJhzCzyC7ivJcYUHSVVgBlUmxEgECDMXhocbOjuErgQdmoJhW0mOVBc0xDGyEODHmMnUoPM_bjUaJzOvuTrqw";
                        }}
                      />
                    </div>

                    <div className="space-y-4">
                      <p className="text-base font-medium text-slate-705 leading-relaxed">
                        Every living thing relies on **Nutrient Cycles** to survive! Nitrogen, carbon dioxide, oxygen, and water flow seamlessly through the atmosphere and the ground.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                          <span className="font-extrabold text-xs text-emerald-800 block">Carbon Cycle</span>
                          <span className="text-[11px] text-emerald-700 block mt-0.5">Trees remove CO2 during carbon fixation, fueling crop expansion.</span>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                          <span className="font-extrabold text-xs text-blue-800 block">Water Cycle</span>
                          <span className="text-[11px] text-blue-700 block mt-0.5">Water evaporates into vapors, clouds condense, returning as life-saving rainfall.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}

              {activePartInfo.id === 3 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-indigo-700">psychology</span>
                      <h4 className="font-extrabold text-base text-slate-800">
                        Review Quiz: Ecosystem Quiz
                      </h4>
                    </div>
                    
                    <p className="text-sm font-semibold text-slate-700 font-sans">
                      What is the primary energy driver that fuels photosynthesis in all producers?
                    </p>

                    <form onSubmit={handleQuizSubmit} className="space-y-3">
                      <label className="flex items-center gap-3 p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                        <input 
                          type="radio" 
                          name="q-ans-def" 
                          value="A" 
                          checked={(quizAnswers[-1] || null) === 'A'} 
                          onChange={(e) => setQuizAnswers(prev => ({ ...prev, [-1]: e.target.value }))}
                          disabled={!!quizzesSubmitted[-1]}
                          className="text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-slate-700">A) Solar Sunlight</span>
                      </label>

                      <label className="flex items-center gap-3 p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                        <input 
                          type="radio" 
                          name="q-ans-def" 
                          value="B" 
                          checked={(quizAnswers[-1] || null) === 'B'} 
                          onChange={(e) => setQuizAnswers(prev => ({ ...prev, [-1]: e.target.value }))}
                          disabled={!!quizzesSubmitted[-1]}
                          className="text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-slate-700">B) Ocean Tides & Earthquakes</span>
                      </label>

                      <label className="flex items-center gap-3 p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                        <input 
                          type="radio" 
                          name="q-ans-def" 
                          value="C" 
                          checked={(quizAnswers[-1] || null) === 'C'} 
                          onChange={(e) => setQuizAnswers(prev => ({ ...prev, [-1]: e.target.value }))}
                          disabled={!!quizzesSubmitted[-1]}
                          className="text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-slate-700">C) Falling Autumn Leaves</span>
                      </label>

                      {!quizzesSubmitted[-1] ? (
                        <button 
                          type="submit"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-md mt-2 cursor-pointer"
                        >
                          Verify Answer
                        </button>
                      ) : (
                        <div className="p-4 bg-emerald-50 rounded-xl text-emerald-800 text-xs font-semibold leading-relaxed font-sans">
                          {quizFeedbacks[-1] || ''}
                        </div>
                      )}

                      {!quizzesSubmitted[-1] && quizFeedbacks[-1] && (
                        <div className="p-3.5 bg-rose-50 text-rose-800 text-xs font-bold rounded-xl font-sans">
                          {quizFeedbacks[-1]}
                        </div>
                      )}
                    </form>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex justify-between items-center shrink-0">
          <button
            onClick={() => {
              if (selectedPart > 1) setSelectedPart(prev => prev - 1);
            }}
            disabled={selectedPart === 1}
            className="flex items-center gap-1.5 text-xs font-extrabold text-slate-600 hover:text-slate-800 disabled:opacity-40 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">chevron_left</span>
            Previous Part
          </button>

          {selectedPart < parts.length ? (
            <button
              onClick={() => setSelectedPart(prev => prev + 1)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-extrabold px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Next Part
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="bg-[#FF9800] hover:bg-[#E68A00] text-white text-xs font-extrabold px-5 py-2.5 rounded-lg shadow-sm transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-xs">celebration</span>
              Done Classroom!
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
