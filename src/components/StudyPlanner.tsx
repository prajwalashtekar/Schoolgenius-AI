import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import {
  CalendarCheck,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  CheckCircle2,
  Plus,
  Trash2,
  Clock,
  Flame,
  PlusCircle,
} from "lucide-react";
import { SubjectType } from "../types";

export const StudyPlanner: React.FC = () => {
  const { user, goals, toggleGoal, addGoal, deleteGoal, addXP } = useApp();

  const [pomodoroMode, setPomodoroMode] = useState<"focus" | "break">("focus");
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [ambientSound, setAmbientSound] = useState<"rain" | "library" | "none">("none");
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalSubject, setNewGoalSubject] = useState<SubjectType>("Mathematics");

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Pomodoro countdown
  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      setPomodoroSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsTimerRunning(false);
          if (pomodoroMode === "focus") {
            addXP(50, "Completed 25-Minute Focus Session");
            alert("Focus session complete! Take a 5-minute break.");
            setPomodoroMode("break");
            return 5 * 60;
          } else {
            alert("Break finished! Ready for next focus block?");
            setPomodoroMode("focus");
            return 25 * 60;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, pomodoroMode]);

  // Ambient sound synthesizer with Web Audio
  const toggleAmbientSound = (type: "rain" | "library" | "none") => {
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }

    if (type === "none") {
      setAmbientSound("none");
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Pink noise / rain synthesis buffer
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2) * 0.05;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = type === "rain" ? "lowpass" : "bandpass";
      filter.frequency.value = type === "rain" ? 800 : 400;

      const gain = ctx.createGain();
      gain.gain.value = 0.15;

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
      setAmbientSound(type);
    } catch (e) {
      console.warn("Audio synthesis not allowed or supported without user click", e);
    }
  };

  const handleAddNewGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    addGoal({
      title: newGoalTitle,
      subject: newGoalSubject,
      durationMinutes: 20,
      dueDate: "Today",
    });
    setNewGoalTitle("");
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${rem.toString().padStart(2, "0")}`;
  };

  const completedCount = goals.filter((g) => g.completed).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 text-xl font-bold shadow-xs">
            <CalendarCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-heading text-lg font-bold text-slate-800">
              Study Planner & Pomodoro Focus Engine
            </h1>
            <p className="text-xs text-slate-500">
              Set syllabus target goals • Stay locked in with smart focus timers & ambient study audio
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-2xl border border-orange-200 bg-orange-50 px-3.5 py-1.5 text-xs font-bold text-orange-700">
            <Flame className="h-4 w-4 fill-orange-500 text-orange-500" />
            <span>{user.streakDays} Day Streak Active</span>
          </div>
        </div>
      </div>

      {/* Grid: Timer Left, Goals Right */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Pomodoro Timer & Audio */}
        <div className="space-y-4 lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-indigo-600" />
                <h3 className="font-heading text-sm font-bold text-slate-800">Smart Focus Timer</h3>
              </div>
              <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-1 text-xs">
                <button
                  onClick={() => {
                    setPomodoroMode("focus");
                    setPomodoroSeconds(25 * 60);
                    setIsTimerRunning(false);
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                    pomodoroMode === "focus"
                      ? "bg-white text-indigo-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  25m Focus
                </button>
                <button
                  onClick={() => {
                    setPomodoroMode("break");
                    setPomodoroSeconds(5 * 60);
                    setIsTimerRunning(false);
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                    pomodoroMode === "break"
                      ? "bg-white text-emerald-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  5m Break
                </button>
              </div>
            </div>

            {/* Big Timer Display */}
            <div className="my-8 text-center">
              <div className="font-mono text-6xl font-black text-slate-800 tracking-wider">
                {formatTimer(pomodoroSeconds)}
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium">
                {pomodoroMode === "focus"
                  ? "🎯 Stay locked in on deep study"
                  : "☕ Relax, hydrate & rest your eyes"}
              </p>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-600/30 active:scale-98 transition-all"
              >
                {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                <span>{isTimerRunning ? "Pause Focus" : "Start Focus Session"}</span>
              </button>

              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setPomodoroSeconds(pomodoroMode === "focus" ? 25 * 60 : 5 * 60);
                }}
                className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-600 hover:bg-slate-100 transition-colors"
                title="Reset Timer"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Ambient Sound Toggles */}
          <div className="border-t border-slate-100 pt-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Ambient Focus Audio:
            </span>
            <div className="flex gap-2 mt-2">
              {[
                { id: "rain", label: "🌧️ Soft Rain" },
                { id: "library", label: "📚 Library Focus" },
                { id: "none", label: "Mute" },
              ].map((snd) => (
                <button
                  key={snd.id}
                  onClick={() => toggleAmbientSound(snd.id as any)}
                  className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${
                    ambientSound === snd.id
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {snd.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Daily Checklist & Weekly Timetable */}
        <div className="space-y-4 lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-heading text-sm font-bold text-slate-800">
              Daily Syllabus Targets & Goals
            </h3>
            <span className="text-xs text-indigo-700 font-bold bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
              {completedCount} / {goals.length} Completed
            </span>
          </div>

          {/* Add Goal Form */}
          <form onSubmit={handleAddNewGoal} className="flex gap-2">
            <input
              type="text"
              placeholder="Add a new target goal (e.g. Master 3 Chemistry formulas)..."
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
            />
            <select
              value={newGoalSubject}
              onChange={(e) => setNewGoalSubject(e.target.value as SubjectType)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-indigo-600 focus:outline-none cursor-pointer"
            >
              <option value="Mathematics">Math</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="Social Science">Social</option>
              <option value="English">English</option>
            </select>
            <button
              type="submit"
              className="flex items-center gap-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition-all shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Add</span>
            </button>
          </form>

          {/* Goal items */}
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {goals.map((g) => (
              <div
                key={g.id}
                className={`flex items-center justify-between rounded-2xl border p-3.5 transition-all ${
                  g.completed
                    ? "border-slate-200 bg-slate-50/70 text-slate-400"
                    : "border-slate-200 bg-white text-slate-800 hover:border-indigo-300 shadow-2xs"
                }`}
              >
                <div
                  onClick={() => toggleGoal(g.id)}
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                >
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs transition-colors ${
                      g.completed
                        ? "bg-emerald-500 text-white"
                        : "border-2 border-slate-300 bg-white hover:border-indigo-500"
                    }`}
                  >
                    {g.completed && <CheckCircle2 className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs sm:text-sm font-semibold truncate ${g.completed ? "line-through text-slate-400" : "text-slate-800"}`}>
                      {g.title}
                    </p>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md mt-0.5 inline-block">
                      {g.subject}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-slate-400">{g.dueDate || "Today"}</span>
                  <button
                    onClick={() => deleteGoal(g.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Smart AI Recommended Schedule */}
          <div className="border-t border-slate-100 pt-4 space-y-2">
            <h4 className="font-heading text-xs font-bold text-indigo-700 uppercase tracking-wider">
              ⚡ Grade {user.grade} Optimal Study Timetable
            </h4>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 text-xs">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <span className="font-bold text-indigo-600">5:00 PM – 6:00 PM</span>
                <p className="text-slate-700 mt-1 font-medium">Mathematics & Numerical Derivations</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <span className="font-bold text-indigo-600">6:15 PM – 7:15 PM</span>
                <p className="text-slate-700 mt-1 font-medium">Science Labs & Chemical Reactions</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <span className="font-bold text-indigo-600">7:30 PM – 8:30 PM</span>
                <p className="text-slate-700 mt-1 font-medium">Social Science & Language Grammar</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
