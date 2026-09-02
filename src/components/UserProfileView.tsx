import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  User,
  GraduationCap,
  Award,
  Flame,
  Zap,
  BookOpen,
  CheckCircle2,
  Trash2,
  Bookmark,
  Sparkles,
  LogIn,
  LogOut,
  Cloud,
  CloudCheck,
  ShieldCheck,
  Calendar,
  Layers,
} from "lucide-react";
import { BoardType, GradeLevel } from "../types";

export const UserProfileView: React.FC = () => {
  const { 
    user, 
    currentUser, 
    setIsAuthModalOpen, 
    logout, 
    updateGrade, 
    updateBoard, 
    deleteNote 
  } = useApp();

  const [name, setName] = useState(user.name);
  const [grade, setGrade] = useState<GradeLevel>(user.grade);
  const [board, setBoard] = useState<BoardType>(user.board);
  const [saved, setSaved] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateGrade(grade);
    updateBoard(board);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const notesList = user.savedNotes || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white text-2xl font-black shadow-lg shadow-indigo-600/30">
            {user.name ? user.name.charAt(0) : "S"}
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold text-slate-800 flex items-center gap-2">
              {user.name}
              <span className="rounded-lg bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                Grade {user.grade}
              </span>
              {currentUser && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  <Cloud className="h-3 w-3" />
                  <span>Cloud Synced</span>
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {user.board} Curriculum • Level {user.level} Scholar • {user.xp} Total XP
              {currentUser?.email && ` • ${currentUser.email}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-black text-orange-700 shadow-2xs">
            <Flame className="h-4 w-4 fill-orange-500 text-orange-500" />
            <span>{user.streakDays} Day Streak</span>
          </div>

          {currentUser ? (
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 px-4 py-2 text-xs font-bold text-slate-700 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition-all"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Login / Sync Account</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid: Profile settings & Notes */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Profile & Grade Form */}
        <div className="space-y-6 lg:col-span-5">
          <form onSubmit={handleSaveProfile} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading text-sm font-bold text-slate-800">
                Academic Profile & Curriculum
              </h3>
              <span className="text-[11px] text-indigo-600 font-semibold">Real-Time Sync</span>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Student Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Grade Level (1 to 12)</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value as GradeLevel)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all font-medium cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                  <option key={g} value={g.toString()}>
                    Grade {g} {g === 10 ? "(Class X Board)" : g === 12 ? "(Class XII Senior Board)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Educational Board</label>
              <select
                value={board}
                onChange={(e) => setBoard(e.target.value as BoardType)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all font-medium cursor-pointer"
              >
                {["CBSE", "ICSE", "State Board", "International / Cambridge"].map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 py-3 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition-all active:scale-98"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{saved ? "Profile Updated Successfully!" : "Save Profile Settings"}</span>
            </button>
          </form>

          {/* Cloud Sync Status Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4" />
              <span>Cloud Database Status</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {currentUser
                ? `Logged in as ${currentUser.email}. All your study streaks, saved notes, and mistake bank items are securely backed up in Google Cloud Firestore.`
                : "You are currently using local offline storage. Log in or create a free student account to back up your study streaks, notes, and lab progress in the Cloud."}
            </p>
            {!currentUser && (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 py-2.5 text-xs font-bold text-indigo-700 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span>Connect to Cloud Database</span>
              </button>
            )}
          </div>
        </div>

        {/* Right: Saved Notes & Bookmarks */}
        <div className="space-y-4 lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-indigo-600" />
              <h3 className="font-heading text-sm font-bold text-slate-800">Saved Notes & AI Doubt Solutions</h3>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
              {notesList.length} Notes Saved
            </span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {notesList.length > 0 ? (
              notesList.map((n) => (
                <div key={n.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-sm">{n.title}</span>
                    <button
                      onClick={() => deleteNote(n.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="rounded-xl bg-white border border-slate-200 p-3 text-slate-700 text-xs whitespace-pre-wrap max-h-36 overflow-y-auto leading-relaxed">
                    {n.content}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-1">
                    <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md">
                      {n.subject}
                    </span>
                    <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-48 flex-col items-center justify-center text-center text-slate-400">
                <BookOpen className="h-10 w-10 text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-600">No saved notes yet</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs leading-relaxed">
                  Click "Save Note" in the AI Tutor or Homework Solver to build your personalized revision library!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
