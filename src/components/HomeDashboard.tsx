import React from "react";
import { useApp } from "../context/AppContext";
import {
  Sparkles,
  FlaskConical,
  MessageSquare,
  BookOpenCheck,
  GraduationCap,
  ArrowRight,
  Calculator,
  Compass,
  Code2,
  CalendarCheck,
  CheckCircle2,
  Lightbulb,
  Layers,
  ChevronRight,
  TrendingUp,
  Target,
  Flame,
  BrainCircuit,
  Clock,
  Award,
} from "lucide-react";

export const HomeDashboard: React.FC = () => {
  const { user, setActiveTab, setSelectedSubject } = useApp();

  const quickFeatures = [
    {
      id: "SCIENCE LAB",
      title: "Science Lab",
      subtitle: "Virtual Titration, Periodic Table & Optics",
      icon: "🔬",
      bgBadge: "bg-emerald-100 text-emerald-800",
      category: "Simulation",
    },
    {
      id: "MATH LAB",
      title: "Math Explorer",
      subtitle: "2D/3D Grapher & Trig Unit Circle",
      icon: "🧮",
      bgBadge: "bg-blue-100 text-blue-800",
      category: "Visual Math",
    },
    {
      id: "EXAM",
      title: "Exam Coach",
      subtitle: `Mock Tests for Grade ${user.grade} (${user.board})`,
      icon: "📝",
      bgBadge: "bg-rose-100 text-rose-800",
      category: "Assessment",
    },
    {
      id: "HOMEWORK",
      title: "Vision AI Solver",
      subtitle: "Scan homework & detect step errors",
      icon: "📸",
      bgBadge: "bg-amber-100 text-amber-800",
      category: "Lens AI",
    },
    {
      id: "DOUBTS",
      title: "AI Socratic Tutor",
      subtitle: "5 Mental Models & Socratic guidance",
      icon: "💡",
      bgBadge: "bg-indigo-100 text-indigo-800",
      category: "Tutor",
    },
    {
      id: "REVISION",
      title: "Revision & Mind Maps",
      subtitle: "Leitner spaced repetition & formula bank",
      icon: "⚡",
      bgBadge: "bg-violet-100 text-violet-800",
      category: "Retention",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 12-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Columns: Hero Banner, Quick Labs, Today's Learning Path */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          {/* Hero Banner with Executive Gradient */}
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-200">
            <div className="relative z-10">
              <div className="flex items-center space-x-2 text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-2">
                <Sparkles className="h-4 w-4" />
                <span>Grade {user.grade} • {user.board} Curriculum</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 leading-tight">
                Welcome back, {user.name}! 🚀
              </h1>
              <p className="text-indigo-100 opacity-90 mb-6 max-w-xl text-xs sm:text-sm leading-relaxed">
                You have mastered 85% of Trigonometry & Chemical Reactions. Ready to explore Optics in the Virtual Science Lab or test your knowledge?
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setActiveTab("SCIENCE LAB")}
                  className="bg-white text-indigo-600 hover:bg-slate-50 px-5 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all"
                >
                  Continue Learning
                </button>
                <button
                  onClick={() => setActiveTab("PLANNER")}
                  className="bg-indigo-500/30 hover:bg-indigo-500/50 border border-indigo-300/40 text-white px-5 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm active:scale-95 transition-all"
                >
                  View Roadmap
                </button>
              </div>
            </div>

            {/* Background Decorative Watermark */}
            <div className="absolute top-0 right-0 w-64 h-full bg-white opacity-5 flex items-center justify-center transform rotate-12 translate-x-8 pointer-events-none select-none">
              <span className="text-[160px] font-black">A+</span>
            </div>
          </div>

          {/* Quick Specialist Grid Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickFeatures.map((feat) => (
              <div
                key={feat.id}
                onClick={() => setActiveTab(feat.id)}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex items-center space-x-4 group"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${feat.bgBadge} group-hover:scale-105 transition-transform`}>
                  {feat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base group-hover:text-indigo-600 transition-colors truncate">
                      {feat.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{feat.subtitle}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            ))}
          </div>

          {/* Today's Learning Path Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex-1">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base sm:text-lg">Today's Learning Path</h3>
                <p className="text-xs text-slate-500">Scheduled modules tailored for your exam timetable</p>
              </div>
              <button
                onClick={() => setActiveTab("PLANNER")}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-bold uppercase tracking-wider transition-colors"
              >
                ADJUST PLAN
              </button>
            </div>

            <div className="space-y-3">
              {/* Task 1 */}
              <div className="flex items-center p-3.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="w-1.5 h-10 bg-indigo-500 rounded-full mr-3.5 shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400 font-medium">09:00 AM - 10:30 AM</p>
                  <p className="font-bold text-sm text-slate-800 truncate">Mathematics: Quadratic Equations & Polynomials</p>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="px-2.5 py-1 bg-green-100 text-green-700 text-[11px] font-bold rounded-lg flex items-center space-x-1">
                    <CheckCircle2 className="h-3 w-3 inline mr-1" />
                    <span>COMPLETED</span>
                  </span>
                </div>
              </div>

              {/* Task 2 (In Progress) */}
              <div className="flex items-center p-3.5 bg-white border border-indigo-200 rounded-xl ring-2 ring-indigo-500/20 shadow-xs">
                <div className="w-1.5 h-10 bg-amber-500 rounded-full mr-3.5 shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-indigo-600 font-bold">IN PROGRESS</p>
                  <p className="font-bold text-sm text-slate-800 truncate">Science: Light - Reflection, Refraction & Ray Diagrams</p>
                </div>
                <button
                  onClick={() => setActiveTab("SCIENCE LAB")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3.5 py-1.5 rounded-lg font-bold shadow-xs active:scale-95 transition-all shrink-0"
                >
                  START LAB
                </button>
              </div>

              {/* Task 3 */}
              <div className="flex items-center p-3.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="w-1.5 h-10 bg-slate-300 rounded-full mr-3.5 shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400 font-medium">04:00 PM - 05:00 PM</p>
                  <p className="font-bold text-sm text-slate-800 truncate">Social Science: Indian Constitution & Civic Rights</p>
                </div>
                <button
                  onClick={() => setActiveTab("SOCIAL & LANG")}
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0"
                >
                  Open Study
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Columns: Analytics, AI Smart Tutor, Next Exam Countdown */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          {/* Learning Analytics Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-base sm:text-lg">Learning Analytics</h3>
              <button
                onClick={() => setActiveTab("PROGRESS")}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Full Report
              </button>
            </div>

            {/* Weekly Bar Chart */}
            <div className="flex justify-around items-end h-32 mb-4 space-x-2 pt-2 border-b border-slate-100 pb-3">
              <div className="w-full flex flex-col items-center">
                <div className="w-full bg-indigo-100 rounded-t-md h-[40%] transition-all"></div>
                <span className="text-[10px] mt-2 font-bold text-slate-400">MON</span>
              </div>
              <div className="w-full flex flex-col items-center">
                <div className="w-full bg-indigo-300 rounded-t-md h-[65%] transition-all"></div>
                <span className="text-[10px] mt-2 font-bold text-slate-400">TUE</span>
              </div>
              <div className="w-full flex flex-col items-center">
                <div className="w-full bg-indigo-600 rounded-t-md h-[95%] shadow-xs transition-all"></div>
                <span className="text-[10px] mt-2 font-bold text-indigo-600">WED</span>
              </div>
              <div className="w-full flex flex-col items-center">
                <div className="w-full bg-indigo-400 rounded-t-md h-[75%] transition-all"></div>
                <span className="text-[10px] mt-2 font-bold text-slate-400">THU</span>
              </div>
              <div className="w-full flex flex-col items-center">
                <div className="w-full bg-slate-200 rounded-t-md h-[15%] transition-all"></div>
                <span className="text-[10px] mt-2 font-bold text-slate-400">FRI</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Daily Goal</p>
                <p className="text-lg font-black text-slate-800">84%</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Focus Score</p>
                <p className="text-lg font-black text-emerald-600">9.2 / 10</p>
              </div>
            </div>
          </div>

          {/* AI Smart Tutor Companion Widget */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-xs">
                  AI
                </div>
                <h3 className="font-bold text-slate-800 text-base">AI Smart Tutor</h3>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 mb-4 text-xs italic text-slate-700 leading-relaxed border border-slate-100">
                "Hey {user.name}! I noticed you explored ray diagrams yesterday. Would you like a 5-minute visual walkthrough before starting the lab?"
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab("DOUBTS")}
                  className="w-full text-left p-3 text-xs bg-white border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 rounded-xl transition-all font-medium text-slate-700 flex items-center justify-between"
                >
                  <span>Yes, show me the 5-point method.</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </button>
                <button
                  onClick={() => setActiveTab("DOUBTS")}
                  className="w-full text-left p-3 text-xs bg-white border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 rounded-xl transition-all font-medium text-slate-700 flex items-center justify-between"
                >
                  <span>I have a specific doubt about lenses.</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </button>
                <button
                  onClick={() => setActiveTab("SCIENCE LAB")}
                  className="w-full text-left p-3 text-xs bg-white border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 rounded-xl transition-all font-medium text-slate-700 flex items-center justify-between"
                >
                  <span>No, I'm ready for the simulation.</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Next Exam Countdown Pill */}
            <div className="mt-6 p-4 bg-indigo-50/80 border border-indigo-100 rounded-xl flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-3">
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-0.5">Next Target Exam</p>
                <p className="text-sm font-bold text-slate-800 truncate">Science Mid-Term Exam</p>
                <p className="text-xs text-slate-500">In 4 days • Units 1-4</p>
              </div>
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full flex items-center justify-center text-xs font-black text-indigo-700 shrink-0">
                4d
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
