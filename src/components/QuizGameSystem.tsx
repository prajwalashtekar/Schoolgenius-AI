import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  Trophy,
  Swords,
  Flame,
  Zap,
  Award,
  Sparkles,
  Bot,
  User,
  CheckCircle2,
  XCircle,
  Timer,
  RotateCcw,
} from "lucide-react";

export const QuizGameSystem: React.FC = () => {
  const { user, addXP } = useApp();

  const [gameMode, setGameMode] = useState<"battle" | "daily" | "badges">("battle");
  const [battleRound, setBattleRound] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [battleState, setBattleState] = useState<"idle" | "playing" | "finished">("idle");
  const [selectedBattleOption, setSelectedBattleOption] = useState<number | null>(null);

  const battleQuestions = [
    {
      q: "What is the SI unit of Electric Current?",
      options: ["Volt", "Ampere", "Ohm", "Watt"],
      answer: 1,
      fact: "Ampere (A) is named after André-Marie Ampère.",
    },
    {
      q: "Which element has the highest electronegativity on the Pauling scale?",
      options: ["Oxygen", "Chlorine", "Fluorine", "Helium"],
      answer: 2,
      fact: "Fluorine has a Pauling electronegativity of 3.98!",
    },
    {
      q: "If sin(θ) = 1/2, what is the acute angle θ in degrees?",
      options: ["30°", "45°", "60°", "90°"],
      answer: 0,
      fact: "sin(30°) = 1/2 and cos(60°) = 1/2.",
    },
    {
      q: "Which cell organelle contains hydrolytic digestive enzymes?",
      options: ["Ribosome", "Golgi Apparatus", "Lysosome", "Centrosome"],
      answer: 2,
      fact: "Lysosomes are known as the suicidal bags of the cell.",
    },
  ];

  const currentQ = battleQuestions[battleRound];

  const startBattle = () => {
    setBattleState("playing");
    setBattleRound(0);
    setUserScore(0);
    setBotScore(0);
    setSelectedBattleOption(null);
  };

  const handleAnswer = (optionIdx: number) => {
    if (selectedBattleOption !== null) return;
    setSelectedBattleOption(optionIdx);

    const isCorrect = optionIdx === currentQ.answer;
    if (isCorrect) setUserScore((prev) => prev + 100);

    // Bot randomly gets 75% accuracy
    const botCorrect = Math.random() > 0.3;
    if (botCorrect) setBotScore((prev) => prev + 100);

    setTimeout(() => {
      if (battleRound < battleQuestions.length - 1) {
        setBattleRound((prev) => prev + 1);
        setSelectedBattleOption(null);
      } else {
        setBattleState("finished");
        if (userScore + (isCorrect ? 100 : 0) >= botScore + (botCorrect ? 100 : 0)) {
          addXP(150, "Won 1v1 Topic Battle vs AI!");
        } else {
          addXP(50, "Participated in 1v1 Battle");
        }
      }
    }, 1800);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-bold text-white">Quiz Master & Topic Battles</h1>
              <p className="text-xs text-slate-400">
                1v1 Live Battles vs AI • Daily Streak Challenges • Badges & Leaderboards
              </p>
            </div>
          </div>
        </div>

        {/* Game Mode switchers */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950 p-1 text-xs">
          {[
            { id: "battle", label: "⚔️ 1v1 AI Battle" },
            { id: "badges", label: "🎖️ Trophy Showcase" },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setGameMode(m.id as any)}
              className={`rounded-lg px-3 py-1.5 font-bold transition-all ${
                gameMode === m.id
                  ? "bg-amber-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. 1v1 Battle Arena */}
      {gameMode === "battle" && (
        <div className="mx-auto max-w-2xl space-y-6">
          {battleState === "idle" && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-8 text-center space-y-5 shadow-xl">
              <div className="flex items-center justify-center gap-6">
                <div className="flex flex-col items-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white text-xl font-bold shadow-lg">
                    {user.name.charAt(0)}
                  </div>
                  <span className="mt-2 text-xs font-bold text-white">{user.name}</span>
                  <span className="text-[10px] text-slate-400">Lv {user.level}</span>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 font-black">
                  VS
                </div>

                <div className="flex flex-col items-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 to-sky-500 text-white shadow-lg">
                    <Bot className="h-8 w-8" />
                  </div>
                  <span className="mt-2 text-xs font-bold text-white">GeniusBot</span>
                  <span className="text-[10px] text-cyan-400">AI Challenger</span>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-heading text-lg font-bold text-white">Live Speed Battle: Grade {user.grade} STEM</h3>
                <p className="text-xs text-slate-400">
                  4 Rapid-fire questions. Fastest correct answer gains max XP!
                </p>
              </div>

              <button
                onClick={startBattle}
                className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/30 hover:opacity-95 active:scale-95 transition-all"
              >
                Enter Battle Arena ⚔️
              </button>
            </div>
          )}

          {battleState === "playing" && (
            <div className="space-y-4">
              {/* Scoreboard */}
              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-white">{user.name}:</span>
                  <span className="font-mono text-lg font-black text-emerald-400">{userScore} pts</span>
                </div>
                <div className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-amber-300">
                  Round {battleRound + 1} / {battleQuestions.length}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-400">GeniusBot:</span>
                  <span className="font-mono text-lg font-black text-cyan-400">{botScore} pts</span>
                </div>
              </div>

              {/* Question Card */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm space-y-4">
                <h3 className="font-heading text-base font-bold text-white text-center">
                  {currentQ.q}
                </h3>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 pt-2">
                  {currentQ.options.map((opt, idx) => {
                    let btnStyle = "border-slate-800 bg-slate-950/70 text-slate-200 hover:border-amber-500/50";
                    if (selectedBattleOption !== null) {
                      if (idx === currentQ.answer) {
                        btnStyle = "border-emerald-500 bg-emerald-950/40 text-emerald-300 font-bold";
                      } else if (selectedBattleOption === idx) {
                        btnStyle = "border-rose-500 bg-rose-950/40 text-rose-300 font-bold";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={selectedBattleOption !== null}
                        onClick={() => handleAnswer(idx)}
                        className={`rounded-xl border p-4 text-xs sm:text-sm font-medium transition-all ${btnStyle}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {selectedBattleOption !== null && (
                  <p className="mt-2 text-center text-xs text-slate-400 font-mono animate-fade-in">
                    💡 {currentQ.fact}
                  </p>
                )}
              </div>
            </div>
          )}

          {battleState === "finished" && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-8 text-center space-y-5 shadow-xl">
              <div className="text-4xl">
                {userScore >= botScore ? "🏆 Victory!" : "🤝 Nice Effort!"}
              </div>
              <h3 className="font-heading text-2xl font-black text-white">
                Final Score: {userScore} vs {botScore}
              </h3>
              <p className="text-xs text-slate-300">
                {userScore >= botScore
                  ? "Congratulations! You outperformed GeniusBot and earned +150 XP!"
                  : "Great challenge! Review the mistake concepts and challenge again."}
              </p>
              <button
                onClick={startBattle}
                className="flex items-center justify-center gap-1.5 mx-auto rounded-xl bg-amber-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-amber-500"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Play Another Battle</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. Badges & Trophy Showcase */}
      {gameMode === "badges" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {user.badges.map((b) => (
            <div
              key={b.id}
              className={`rounded-2xl border p-5 transition-all ${
                b.unlocked
                  ? "border-amber-500/40 bg-gradient-to-b from-slate-900 to-amber-950/20 shadow-md"
                  : "border-slate-800 bg-slate-950/40 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl">{b.icon}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    b.unlocked ? "bg-amber-500/20 text-amber-300" : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {b.unlocked ? "UNLOCKED" : "LOCKED"}
                </span>
              </div>
              <h4 className="font-heading text-sm font-bold text-white mt-3">{b.name}</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{b.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
