import { useState } from 'react';
import { Lesson, StudentTab, UserAccount } from '../types';

interface CategoryConfig {
  icon: string;
  colorClass: string;
  activeClass: string;
  textClass: string;
}

const getCategoryConfig = (categoryName: string): CategoryConfig => {
  const name = categoryName.toLowerCase();
  if (name.includes('math')) {
    return {
      icon: 'calculate',
      colorClass: 'bg-indigo-50 border-indigo-100 hover:border-indigo-300 text-indigo-700',
      activeClass: 'ring-2 ring-indigo-500',
      textClass: 'bg-indigo-50 text-indigo-700',
    };
  }
  if (name.includes('science')) {
    return {
      icon: 'biotech',
      colorClass: 'bg-emerald-50 border-emerald-100 hover:border-emerald-300 text-emerald-700',
      activeClass: 'ring-2 ring-emerald-500',
      textClass: 'bg-emerald-50 text-emerald-700',
    };
  }
  if (name.includes('english')) {
    return {
      icon: 'menu_book',
      colorClass: 'bg-amber-50 border-amber-100 hover:border-amber-300 text-amber-700',
      activeClass: 'ring-2 ring-amber-500',
      textClass: 'bg-amber-50 text-amber-700',
    };
  }
  if (name.includes('filipino')) {
    return {
      icon: 'translate',
      colorClass: 'bg-orange-50 border-orange-100 hover:border-orange-300 text-orange-700',
      activeClass: 'ring-2 ring-orange-500',
      textClass: 'bg-orange-50 text-orange-700',
    };
  }
  if (name.includes('life') || name.includes('career')) {
    return {
      icon: 'volunteer_activism',
      colorClass: 'bg-rose-50 border-rose-100 hover:border-rose-300 text-rose-700',
      activeClass: 'ring-2 ring-rose-500',
      textClass: 'bg-rose-50 text-rose-700',
    };
  }
  if (name.includes('culture') || name.includes('society')) {
    return {
      icon: 'public',
      colorClass: 'bg-purple-50 border-purple-100 hover:border-purple-300 text-purple-700',
      activeClass: 'ring-2 ring-purple-500',
      textClass: 'bg-purple-50 text-purple-700',
    };
  }
  if (name.includes('digital') || name.includes('literacy') || name.includes('computer')) {
    return {
      icon: 'computer',
      colorClass: 'bg-sky-50 border-sky-100 hover:border-sky-300 text-sky-700',
      activeClass: 'ring-2 ring-sky-500',
      textClass: 'bg-sky-50 text-sky-700',
    };
  }
  return {
    icon: 'school',
    colorClass: 'bg-slate-50 border-slate-100 hover:border-slate-300 text-slate-700',
    activeClass: 'ring-2 ring-slate-500',
    textClass: 'bg-slate-50 text-slate-700',
  };
};

interface StudentLessonsProps {
  onTabChange: (tab: StudentTab) => void;
  onSelectLesson: (lesson: Lesson) => void;
  lessons: Lesson[];
  currentUser?: UserAccount;
  accounts: UserAccount[];
}

export default function StudentLessons({ onTabChange, onSelectLesson, lessons, currentUser, accounts }: StudentLessonsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Build enrolled subjects set (empty = all allowed)
  const enrolledSubjects: string[] = currentUser?.subjects ?? [];

  // Check section alignment based on teacher-student relationship and sectionId target
  const isLessonSectionAllowed = (l: Lesson) => {
    if (l.uploadedByEmail) {
      const publisher = accounts.find(a => a.email.toLowerCase() === l.uploadedByEmail!.toLowerCase());
      if (publisher) {
        const teacherSections = [
          ...(publisher.sections ?? []),
          ...(publisher.assignedSections ?? []),
          ...(publisher.section ? [publisher.section] : [])
        ];
        const activeSections = [...new Set(teacherSections.filter(Boolean))];
        const studentSection = currentUser?.section || '';
        
        if (activeSections.length > 0) {
          const isTeacherForStudent = activeSections.includes(studentSection);
          if (!isTeacherForStudent) {
            return false;
          }
        }
        
        return !l.sectionId || l.sectionId === studentSection;
      }
    }
    return !l.sectionId || l.sectionId === currentUser?.section;
  };

  // Legacy subject names that no longer apply — filter them out everywhere
  const isLsCategory = (cat: string) => /^LS\d+/i.test(cat.trim());

  // Get categories from available lessons that the student is allowed to see
  const lessonCategories = lessons
    .filter(l => l.id !== 'learning-active' && !l.assignedTo?.includes('Teachers') && isLessonSectionAllowed(l))
    .map(l => l.category)
    .filter(isLsCategory);

  const enrolledCategories = enrolledSubjects.length > 0
    ? [...new Set(enrolledSubjects.filter(isLsCategory))]
    : [...new Set(lessonCategories)];

  // Always show all enrolled subject tiles (even if 0 lessons), plus any lesson categories not in enrolled list
  // Only LS-format subjects are shown — legacy bare names (Math, Science, English, Life Skills) are excluded
  const uniqueCategories = [...new Set([...enrolledCategories, ...lessonCategories])]
    .filter(Boolean)
    .sort();

  // Filter lessons based on category selection, search query, and enrolled subjects
  const filteredLessons = lessons.filter(l => {
    if (l.id === 'learning-active') return false;
    if (l.assignedTo?.includes('Teachers')) return false;

    const sectionAllowed = isLessonSectionAllowed(l);

    // Only show lessons that belong to enrolled subjects (if subjects are assigned)
    const subjectAllowed = enrolledSubjects.length === 0 || enrolledCategories.includes(l.category);
    const matchesCategory = selectedCategory ? l.category === selectedCategory : true;
    const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.category.toLowerCase().includes(searchQuery.toLowerCase());
                          
    console.log(`[Diagnostic] Lesson "${l.title}":`, {
      sectionAllowed,
      subjectAllowed,
      matchesCategory,
      matchesSearch,
      details: {
        lessonSectionId: l.sectionId,
        studentSection: currentUser?.section,
        uploadedByEmail: l.uploadedByEmail,
        category: l.category,
        enrolledCategories
      }
    });

    return sectionAllowed && subjectAllowed && matchesCategory && matchesSearch;
  });

  // Live lesson counts per category (among allowed lessons)
  const countForCategory = (cat: string) =>
    lessons.filter(l =>
      l.id !== 'learning-active' &&
      !l.assignedTo?.includes('Teachers') &&
      isLessonSectionAllowed(l) &&
      l.category === cat &&
      (enrolledSubjects.length === 0 || enrolledCategories.includes(cat))
    ).length;

  const categories = uniqueCategories.map(catTitle => {
    const config = getCategoryConfig(catTitle);
    return {
      title: catTitle,
      icon: config.icon,
      colorClass: config.colorClass,
      activeClass: config.activeClass,
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Welcome & Search Section */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-none md:text-4xl">
            What do you want to learn today?
          </h2>
          {currentUser?.gradeLevel && (
            <span className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-[11px] font-black px-3 py-1 rounded-full shadow-sm">
              <span className="material-symbols-outlined text-xs">military_tech</span>
              Grade Level {currentUser.gradeLevel}
            </span>
          )}
        </div>
        <p className="text-base text-slate-500 leading-normal">Find a lesson and start your adventure.</p>
        {enrolledSubjects.length > 0 && (
          <p className="text-xs text-indigo-700 font-semibold">
            Showing lessons for your enrolled subjects: <span className="font-black">{enrolledSubjects.join(' • ')}</span>
          </p>
        )}
      </section>

      {/* Search Input */}
      <div className="relative group">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#526069] transition-colors">
          search
        </span>
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for topics like 'Fractions' or 'Ecosystems'..."
          className="w-full h-14 pl-12 pr-4 rounded-xl bg-slate-100 border-2 border-transparent focus:border-[#526069] focus:bg-white text-sm outline-none transition-all placeholder:text-slate-400 shadow-sm"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* BENTO CATEGORIES GRID — 3 on mobile, up to 4 or 7 on wider screens */}
      <section className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      {categories.map((cat) => {
          const isSelected = selectedCategory === cat.title;
          const liveCount = countForCategory(cat.title);
          return (
            <button
              key={cat.title}
              onClick={() => setSelectedCategory(isSelected ? null : cat.title)}
              className={`flex flex-col items-center p-6 bg-white rounded-xl border border-slate-100 shadow-sm transition-all group relative overflow-hidden active:scale-95 cursor-pointer
                ${cat.colorClass}
                ${isSelected ? cat.activeClass : ''}`}
            >
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm shrink-0">
                <span className="material-symbols-outlined text-[32px]">{cat.icon}</span>
              </div>
              <span className="text-base font-extrabold tracking-tight block">{cat.title}</span>
              <span className="text-[12px] font-bold text-slate-400 block mt-0.5">
                {liveCount} Lesson{liveCount !== 1 ? 's' : ''}
              </span>

              {isSelected && (
                <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-white">
                  <span className="material-symbols-outlined text-xs">check</span>
                </div>
              )}
            </button>
          );
        })}
      </section>

      {/* Pro Tip instructional banner */}
      <section className="bg-emerald-50 rounded-2xl p-5 flex items-center gap-5 border border-emerald-100">
        <div className="hidden sm:flex w-14 h-14 bg-white rounded-full items-center justify-center shrink-0 shadow-sm">
          <span className="material-symbols-outlined text-emerald-600 text-2xl">lightbulb</span>
        </div>
        <div>
          <h3 className="font-extrabold text-sm text-emerald-800">Pro Tip!</h3>
          <p className="text-xs text-emerald-700/95 leading-relaxed mt-0.5">
            Completing one lesson in each category earns you the &quot;Well-Rounded Learner&quot; badge. Keep it up!
          </p>
        </div>
      </section>

      {/* New Lessons List */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-black text-slate-800">
            {selectedCategory ? `${selectedCategory} Lessons` : 'New Lessons'}
          </h3>
          {selectedCategory && (
            <button 
              onClick={() => setSelectedCategory(null)}
              className="text-xs text-indigo-700 font-bold hover:underline"
            >
              Show All categories
            </button>
          )}
        </div>

        {filteredLessons.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <span className="material-symbols-outlined text-slate-400 text-4xl block mb-2">sentiment_dissatisfied</span>
            <p className="text-sm font-semibold text-slate-500">No lessons found matching your filters.</p>
            <button 
              onClick={() => { setSelectedCategory(null); setSearchQuery(''); }}
              className="text-xs text-[#FF9800] font-bold mt-2 hover:underline"
            >
              Reset search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredLessons.map((l) => (
              <div
                key={l.id}
                onClick={() => onSelectLesson(l)}
                className="bg-white p-5 rounded-2xl flex gap-4 border border-slate-100 hover:border-[#526069]/40 hover:shadow-md cursor-pointer transition-all group"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-50 shadow-sm">
                  <img 
                    src={l.assetUrl} 
                    alt={l.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                <div className="flex flex-col justify-center min-w-0 flex-1">
                  <div className="flex flex-wrap gap-1.5 mb-1.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase w-fit ${
                      getCategoryConfig(l.category).textClass
                    }`}>
                      {l.category} • Level {l.level}
                    </span>
                    {l.bucketUrl && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase text-indigo-700 bg-indigo-50 border border-indigo-150 shadow-2xs">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping shrink-0"></span>
                        Supabase File
                      </span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-800 leading-tight block truncate group-hover:text-indigo-900 transition-colors">
                    {l.title}
                  </h4>

                  <div className="mt-2">
                    {l.progress > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0">
                          <div className="h-full bg-purple-500" style={{ width: `${l.progress}%` }}></div>
                        </div>
                        <span className="text-[10px] font-bold text-purple-600 shrink-0">{l.progress}% Started</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <span className="material-symbols-outlined text-[13px]">
                          {getCategoryConfig(l.category).icon}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">{l.rewardText}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
