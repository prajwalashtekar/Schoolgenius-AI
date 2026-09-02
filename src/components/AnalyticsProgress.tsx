import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Brain,
  Target,
  Sparkles,
  Award,
  Zap,
  RotateCcw,
  BookOpen,
  Trash2,
  Flame,
} from "lucide-react";

export const AnalyticsProgress: React.FC = () => {
  const { user, resolveMistake, deleteMistake, addXP } = useApp();

  const [activeFilter, setActiveFilter] = useState<string>("all");

  const subjectMastery = [
    { subject: "Mathematics", score: 92, status: "Mastered", color: "bg-indigo-600" },
    { subject: "Physics", score: 88, status: "Strong", color: "bg-blue-600" },
    { subject: "Chemistry", score: 81, status: "Needs Practice", color: "bg-cyan-600" },
    { subject: "Biology", score: 95, status: "Exemplary", color: "bg-emerald-600" },
    { subject: "Social Science", score: 90, status: "Mastered", color: "bg-violet-600" },
    { subject: "Languages", score: 87, status: "Strong", color: "bg-pink-600" },
  ];

  const mistakes = user.mistakeBank || [];

  const filteredMistakes = mistakes.filter((m) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "pending") return !m.resolved;
    if (activeFilter === "resolved") return m.resolved;
    return m.subject === activeFilter;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 text-xl font-bold shadow-xs">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-bold text-slate-800">
                Learning Analytics & Smart Mistake Bank
              </h1>
              <p className="text-xs text-slate-500">
                AI diagnostic insights • Real-time concept mastery • Spaced remedial revision in Cloud
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-2xl border border-orange-200 bg-orange-50 px-3.5 py-1.5 text-xs font-bold text-orange-700">
            <Flame className="h-4 w-4 fill-orange-500 text-orange-500" />
            <span>{user.streakDays} Day Streak</span>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs text-emerald-700 font-bold">
            <Award className="h-4 w-4" />
            <span>Accuracy: 89.2%</span>
          </div>
        </div>
      </div>

      {/* Subject Mastery Radar Bars */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h3 className="font-heading text-sm font-bold text-slate-800 flex items-center gap-2">
          <Brain className="h-4 w-4 text-indigo-600" />
          <span>Grade {user.grade} Curriculum Mastery Breakdown</span>
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjectMastery.map((sub) => (
            <div key={sub.subject} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">{sub.subject}</span>
                <span className="font-mono font-bold text-indigo-600">{sub.score}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                <div style={{ width: `${sub.score}%` }} className={`h-full rounded-full ${sub.color}`} />
              </div>
              <span className="text-[11px] text-slate-500 font-medium">{sub.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mistake Bank */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-rose-600" />
            <div>
              <h3 className="font-heading text-sm font-bold text-slate-800">
                Personalized Mistake Bank ({mistakes.length})
              </h3>
              <p className="text-[11px] text-slate-500">
                Target and eliminate recurring conceptual & calculation errors
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar text-xs">
            {["all", "pending", "resolved", "Physics", "Chemistry", "Mathematics"].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`rounded-xl px-3 py-1 text-xs font-semibold capitalize transition-all ${
                  activeFilter === f
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Mistakes List */}
        <div className="space-y-3">
          {filteredMistakes.length > 0 ? (
            filteredMistakes.map((m) => (
              <div
                key={m.id}
                className={`rounded-2xl border p-4 text-xs space-y-2 transition-all ${
                  m.resolved
                    ? "border-slate-200 bg-slate-50/50 opacity-75"
                    : "border-rose-200 bg-rose-50/20 shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-[11px] font-bold text-indigo-700">
                    {m.subject} • {m.topic}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => resolveMistake(m.id)}
                      className={`flex items-center gap-1 rounded-xl px-3 py-1 text-xs font-bold transition-all ${
                        m.resolved
                          ? "bg-emerald-100 text-emerald-800 cursor-default"
                          : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs"
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{m.resolved ? "Mastered" : "Mark Mastered"}</span>
                    </button>
                    {deleteMistake && (
                      <button
                        onClick={() => deleteMistake(m.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Delete from Mistake Bank"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="font-bold text-slate-800 text-xs sm:text-sm leading-snug">{m.question}</p>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-slate-700">
                  <div className="rounded-xl bg-rose-50 border border-rose-100 p-3">
                    <span className="font-bold text-rose-800 text-[11px]">Previous Mistake / Attempt:</span>
                    <p className="mt-0.5 text-xs text-rose-950">{m.studentAnswer}</p>
                  </div>
                  <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">
                    <span className="font-bold text-emerald-800 text-[11px]">Correct Conceptual Method:</span>
                    <p className="mt-0.5 text-xs text-emerald-950">{m.correctAnswer}</p>
                  </div>
                </div>

                {m.explanation && (
                  <p className="text-[11px] text-slate-600 italic pt-1 leading-relaxed">
                    <strong className="text-slate-800">AI Remedial Advice:</strong> {m.explanation}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="flex h-32 flex-col items-center justify-center text-center text-slate-400">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-1" />
              <p className="font-bold text-slate-600 text-xs">No mistakes in this filter category!</p>
              <p className="text-[11px] text-slate-400">Keep solving problems in Exam Engine and Homework Solver.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
