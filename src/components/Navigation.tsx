import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  Home,
  MessageSquare,
  BookOpenCheck,
  FlaskConical,
  Calculator,
  GraduationCap,
  Sparkles,
  Flame,
  Gamepad2,
  CalendarCheck,
  TrendingUp,
  FolderGit2,
  Code2,
  Compass,
  User,
  PenTool,
  Mic,
  VolumeX,
  Clock,
  Layers,
  Search,
  Menu,
  X,
  Bell,
  CheckCircle2,
  LogIn,
  LogOut,
  Cloud,
  CloudOff,
} from "lucide-react";
import { GradeLevel, BoardType } from "../types";

interface NavigationProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<NavigationProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, activeTab, setActiveTab, currentUser, setIsAuthModalOpen, logout } = useApp();

  const navCategories = [
    {
      title: "Core",
      items: [
        { id: "HOME", label: "Home", icon: Home, emoji: "🏠" },
        { id: "DOUBTS", label: "Doubts & Tutor", icon: MessageSquare, emoji: "❓" },
        { id: "HOMEWORK", label: "Homework Solver", icon: BookOpenCheck, emoji: "📚" },
      ],
    },
    {
      title: "Specialist Labs",
      items: [
        { id: "SCIENCE LAB", label: "Science Lab", icon: FlaskConical, emoji: "🧪" },
        { id: "MATH LAB", label: "Math Lab", icon: Calculator, emoji: "📐" },
        { id: "CODING", label: "Coding Lab", icon: Code2, emoji: "💻" },
        { id: "SOCIAL & LANG", label: "Social & Language", icon: Layers, emoji: "🌍" },
      ],
    },
    {
      title: "Academics & Tests",
      items: [
        { id: "EXAM", label: "Exam & Question Bank", icon: GraduationCap, emoji: "📝" },
        { id: "REVISION", label: "Revision & Mistakes", icon: Sparkles, emoji: "🔁" },
        { id: "QUIZZES", label: "Quiz Battle & Daily", icon: Gamepad2, emoji: "⚡" },
      ],
    },
    {
      title: "Productivity & Growth",
      items: [
        { id: "PLANNER", label: "Study Planner & Goals", icon: CalendarCheck, emoji: "📅" },
        { id: "PROGRESS", label: "Analytics & Streak", icon: TrendingUp, emoji: "📊" },
        { id: "PROJECTS", label: "Project Studio", icon: FolderGit2, emoji: "🚀" },
        { id: "CAREER", label: "Career Explorer", icon: Compass, emoji: "🧭" },
        { id: "TEACHER", label: "Teacher & Parent", icon: User, emoji: "👨‍🏫" },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#0F172A] text-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800/80">
          <div
            onClick={() => {
              setActiveTab("HOME");
              setSidebarOpen(false);
            }}
            className="flex items-center space-x-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              G
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white block leading-tight">
                SCHOOLGENIUS
              </span>
              <span className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase flex items-center gap-1">
                AI Learning Suite
                {currentUser && <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
              </span>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links Scroll Area */}
        <nav className="flex-1 px-4 py-4 space-y-4 text-sm overflow-y-auto">
          {navCategories.map((cat) => (
            <div key={cat.title}>
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {cat.title}
              </div>
              <div className="mt-1 space-y-1">
                {cat.items.map((item) => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center px-3.5 py-2 rounded-xl text-sm font-medium transition-all text-left ${
                        isActive
                          ? "bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <span className="mr-3 text-base">{item.emoji}</span>
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Card in Footer with Cloud Sync Status & Login/Logout */}
        <div className="p-4 border-t border-slate-800 bg-[#0c1322] space-y-2">
          {currentUser ? (
            <div className="flex items-center justify-between">
              <div
                onClick={() => {
                  setActiveTab("PROFILE");
                  setSidebarOpen(false);
                }}
                className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-slate-800/80 cursor-pointer transition-colors flex-1 min-w-0"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-slate-900 font-bold text-xs shadow-sm ring-2 ring-indigo-400/30">
                  {user.avatar || "🧑‍🎓"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-emerald-400 truncate flex items-center gap-1 font-medium">
                    <span>● Cloud Synced</span>
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/90 border border-amber-500/20">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-xs">
                    👤
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-300 truncate">Guest Student</p>
                    <p className="text-[10px] text-amber-400 font-medium truncate flex items-center gap-1">
                      <span>⚠️ Not Stored in Cloud</span>
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 p-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition-all active:scale-98"
              >
                <LogIn className="h-4 w-4" />
                <span>Login & Sync Cloud</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export const Header: React.FC<NavigationProps> = ({ setSidebarOpen }) => {
  const {
    user,
    currentUser,
    setIsAuthModalOpen,
    setActiveTab,
    updateGrade,
    updateBoard,
    setIsWhiteboardOpen,
    setIsVoiceVivaOpen,
    isSpeaking,
    stopSpeech,
    isFocusModeActive,
    setIsFocusModeActive,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [showNotification, setShowNotification] = useState(false);

  const searchKeywords = [
    { query: "optics", tab: "SCIENCE LAB" },
    { query: "titration", tab: "SCIENCE LAB" },
    { query: "dna", tab: "SCIENCE LAB" },
    { query: "trigonometry", tab: "MATH LAB" },
    { query: "graph", tab: "MATH LAB" },
    { query: "quadratic", tab: "MATH LAB" },
    { query: "history", tab: "SOCIAL & LANG" },
    { query: "constitution", tab: "SOCIAL & LANG" },
    { query: "exam", tab: "EXAM" },
    { query: "mock", tab: "EXAM" },
    { query: "flashcards", tab: "REVISION" },
    { query: "mind map", tab: "REVISION" },
    { query: "doubt", tab: "DOUBTS" },
    { query: "homework", tab: "HOMEWORK" },
    { query: "coding", tab: "CODING" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const lower = searchQuery.toLowerCase();
    const match = searchKeywords.find((k) => lower.includes(k.query));
    if (match) {
      setActiveTab(match.tab);
    } else {
      setActiveTab("DOUBTS");
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 z-30 shrink-0">
      {/* Left: Mobile Hamburger & Search Input */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>

        <form onSubmit={handleSearch} className="relative">
          <div className="flex items-center bg-slate-100 hover:bg-slate-100/80 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 border border-transparent rounded-full px-4 py-2 w-52 sm:w-80 md:w-96 transition-all">
            <span className="text-slate-400 mr-2 text-sm">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics, formulas, or labs..."
              className="bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400 w-full"
            />
          </div>
        </form>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Grade & Board Quick Selector (Medium+ screens) */}
        <div className="hidden xl:flex items-center space-x-2 bg-slate-100/80 border border-slate-200/80 rounded-xl px-2.5 py-1">
          <div className="flex items-center space-x-1 text-xs">
            <span className="text-slate-500 font-medium">Grade:</span>
            <select
              value={user.grade}
              onChange={(e) => updateGrade(e.target.value as GradeLevel)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                <option key={g} value={g.toString()}>
                  Grade {g}
                </option>
              ))}
            </select>
          </div>

          <span className="text-slate-300">|</span>

          <div className="flex items-center space-x-1 text-xs">
            <span className="text-slate-500 font-medium">Board:</span>
            <select
              value={user.board}
              onChange={(e) => updateBoard(e.target.value as BoardType)}
              className="bg-transparent font-bold text-indigo-600 focus:outline-none cursor-pointer"
            >
              <option value="CBSE">CBSE</option>
              <option value="ICSE">ICSE</option>
              <option value="State Board">State Board</option>
              <option value="International / Cambridge">Cambridge/IB</option>
            </select>
          </div>
        </div>

        {/* AI Whiteboard & Viva Coach Action Buttons */}
        <button
          onClick={() => setIsWhiteboardOpen(true)}
          title="Open Interactive Whiteboard"
          className="hidden sm:flex items-center space-x-1.5 bg-indigo-50 border border-indigo-200/70 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 shadow-2xs"
        >
          <PenTool className="h-3.5 w-3.5" />
          <span>Whiteboard</span>
        </button>

        <button
          onClick={() => setIsVoiceVivaOpen(true)}
          title="Oral Viva Practice Coach"
          className="hidden md:flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200/70 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 shadow-2xs"
        >
          <Mic className="h-3.5 w-3.5" />
          <span>Viva Coach</span>
        </button>

        {/* Cloud Status / Login Button */}
        {currentUser ? (
          <div
            onClick={() => setActiveTab("PROFILE")}
            className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer hover:bg-emerald-100 transition-colors shadow-2xs"
            title="Database Connected & Synced"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="hidden sm:inline">Synced</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <div
              onClick={() => setIsAuthModalOpen(true)}
              className="hidden lg:flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1 rounded-xl text-[11px] font-semibold cursor-pointer hover:bg-amber-100 transition-colors shadow-2xs"
              title="Guest Mode: Data is not stored in the cloud. Click to log in."
            >
              <CloudOff className="h-3 w-3 text-amber-600" />
              <span>Guest (Not Saved in Cloud)</span>
            </div>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Login / Save</span>
            </button>
          </div>
        )}

        {/* Streak Counter */}
        <div
          onClick={() => setActiveTab("PROGRESS")}
          className="flex items-center space-x-1 text-xs sm:text-sm bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-full cursor-pointer hover:bg-orange-100 transition-colors shadow-2xs"
          title="Daily Study Streak"
        >
          <span className="text-orange-500 font-black">🔥 {user.streakDays}</span>
          <span className="text-slate-600 font-medium hidden sm:inline">Streak</span>
        </div>

        {/* Audio Mute if speaking */}
        {isSpeaking && (
          <button
            onClick={stopSpeech}
            className="flex items-center space-x-1 bg-rose-50 border border-rose-200 text-rose-700 px-2.5 py-1.5 rounded-xl text-xs font-bold animate-pulse"
          >
            <VolumeX className="h-3.5 w-3.5" />
            <span>Mute</span>
          </button>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotification(!showNotification)}
            className="w-9 h-9 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white"></span>
          </button>

          {showNotification && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl p-4 z-50 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2 font-bold text-slate-800">
                <span>Learning Alerts</span>
                <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">New</span>
              </div>
              <div className="space-y-2">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="font-semibold text-slate-800">🎯 Daily Goal: 84% complete</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">Solve 1 more doubt to finish today's streak target!</p>
                </div>
                <div className="p-2.5 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <p className="font-semibold text-indigo-900">🔬 Virtual Optics Lab Ready</p>
                  <p className="text-indigo-700 text-[11px] mt-0.5">Grade 10 Light reflection simulations unlocked.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export const Navigation: React.FC = () => {
  return null;
};
