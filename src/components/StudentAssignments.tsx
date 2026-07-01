import { useState } from 'react';
import { Assignment, UserAccount } from '../types';

interface StudentAssignmentsProps {
  assignments: Assignment[];
  currentUser?: UserAccount;
}

export default function StudentAssignments({ assignments, currentUser }: StudentAssignmentsProps) {
  const [submittedIds, setSubmittedIds] = useState<Set<string>>(new Set());

  // Filter assignments visible to this student (by section or 'all')
  const visibleAssignments = assignments.filter((a) => {
    if (!a.sectionId || a.sectionId === '') return true;
    return a.sectionId === currentUser?.section;
  });

  // Further filter by student subjects if set
  const myAssignments = visibleAssignments.filter((a) => {
    if (!currentUser?.subjects || currentUser.subjects.length === 0) return true;
    return currentUser.subjects.some((s) => s === a.subject);
  });

  const today = new Date().toISOString().split('T')[0];

  const openAssignments = myAssignments.filter(
    (a) => (a.status !== 'closed') && a.dueDate >= today
  );
  const pastAssignments = myAssignments.filter(
    (a) => a.status === 'closed' || a.dueDate < today
  );

  const handleSubmit = (id: string) => {
    setSubmittedIds((prev) => new Set([...prev, id]));
  };

  const getDueDiff = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diff = Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return { label: 'Due Today', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    if (diff === 1) return { label: 'Due Tomorrow', color: 'text-amber-500 bg-amber-50 border-amber-100' };
    if (diff > 1) return { label: `Due in ${diff} days`, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    return { label: `${Math.abs(diff)}d Overdue`, color: 'text-rose-600 bg-rose-50 border-rose-200' };
  };

  const renderCard = (a: Assignment, isPast: boolean) => {
    const isSubmitted = submittedIds.has(a.id);
    const due = getDueDiff(a.dueDate);

    return (
      <div
        key={a.id}
        className={`bg-white border rounded-2xl p-5 shadow-sm transition-all hover:shadow-md space-y-3 ${
          isPast ? 'opacity-70 border-slate-100' : 'border-slate-150'
        }`}
      >
        {/* Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              <span className="inline-flex px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">
                {a.subject}
              </span>
              {a.sectionId && (
                <span className="inline-flex px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-slate-100 text-slate-600 border border-slate-200">
                  {a.sectionId}
                </span>
              )}
            </div>
            <h3 className="font-black text-sm text-slate-800 leading-snug">{a.title}</h3>
          </div>
          {/* Due badge */}
          <span className={`shrink-0 text-[10px] font-black px-2.5 py-1 rounded-lg border ${due.color}`}>
            {due.label}
          </span>
        </div>

        {/* Description */}
        {a.description && (
          <p className="text-[11.5px] text-slate-500 leading-relaxed">{a.description}</p>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-semibold border-t border-slate-100 pt-3">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">calendar_today</span>
            Due: {a.dueDate}
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">grade</span>
            Max Score: {a.maxScore} pts
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">person</span>
            {a.uploadedBy}
          </span>
          {a.attachmentUrl && (
            <a
              href={a.attachmentUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 underline underline-offset-2"
            >
              <span className="material-symbols-outlined text-[13px]">attach_file</span>
              View Attachment
            </a>
          )}
        </div>

        {/* Action */}
        {!isPast && (
          <div className="flex justify-end pt-1">
            {isSubmitted ? (
              <span className="flex items-center gap-1.5 text-emerald-700 font-black text-xs bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                Submitted
              </span>
            ) : (
              <button
                onClick={() => handleSubmit(a.id)}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-4 py-2 rounded-xl transition-all active:scale-97 cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">upload_file</span>
                Mark as Submitted
              </button>
            )}
          </div>
        )}
        {isPast && (
          <div className="flex justify-end pt-1">
            <span className="text-[10px] font-black text-slate-400 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl uppercase tracking-wider">
              {a.status === 'closed' ? 'Closed' : 'Past Due'}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <section className="bg-slate-50 py-2">
        <h1 className="text-3xl font-extrabold text-[#526069] tracking-tight">Assignments</h1>
        <p className="text-base text-slate-500 mt-1">
          Your tasks and output requirements from your teachers.
        </p>
        {currentUser?.section && (
          <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-indigo-100 mt-2">
            <span className="material-symbols-outlined text-xs">group</span>
            {currentUser.section}
          </span>
        )}
      </section>

      {/* Empty State */}
      {myAssignments.length === 0 && (
        <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <span className="material-symbols-outlined text-4xl text-slate-300 block mb-3">assignment</span>
          <h3 className="text-base font-black text-slate-500">No Assignments Yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Your teacher hasn't posted any assignments for your section. Check back soon!
          </p>
        </div>
      )}

      {/* Open Assignments */}
      {openAssignments.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-wider">
              Open Assignments
            </h2>
            <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              {openAssignments.length}
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {openAssignments.map((a) => renderCard(a, false))}
          </div>
        </div>
      )}

      {/* Past / Closed Assignments */}
      {pastAssignments.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider">
            Past &amp; Closed Assignments
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pastAssignments.map((a) => renderCard(a, true))}
          </div>
        </div>
      )}
    </div>
  );
}
