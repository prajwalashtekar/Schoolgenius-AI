import React, { useState, useRef } from "react";
import { useApp } from "../context/AppContext";
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  Volume2,
  VolumeX,
  BookmarkPlus,
  RefreshCw,
  Lightbulb,
  BrainCircuit,
  GraduationCap,
  BookOpen,
  Image as ImageIcon,
  Loader2,
  Paperclip,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { SubjectType } from "../types";

export const TutorDoubts: React.FC = () => {
  const { user, selectedSubject, setSelectedSubject, addXP, saveNote, speakText, isSpeaking, stopSpeech } = useApp();

  const [mode, setMode] = useState<"step-by-step" | "socratic" | "explain-5-ways" | "teach-back">("step-by-step");
  const [inputMessage, setInputMessage] = useState("");
  const [concept, setConcept] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "assistant"; text: string; mode?: string }>>([
    {
      role: "assistant",
      text: `Hello ${user.name}! I am your SchoolGenius AI Tutor for Grade ${user.grade} (${user.board}). What topic or question would you like to explore today? You can switch to **Socratic Mode** if you want guiding hints, or **Explain 5 Ways** for diverse mental models!`,
    },
  ]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const subjects: SubjectType[] = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Social Science",
    "English",
    "Hindi",
    "Marathi",
    "Computer Science",
  ];

  const presetTopics = [
    "Explain Doppler Effect in sound waves",
    "Why does balancing chemical equations obey conservation of mass?",
    "Step-by-step solution to find roots of 2x² - 5x + 3 = 0",
    "How does Photosynthesis light reaction produce ATP and NADPH?",
    "What is the difference between Fundamental Rights and DPSP in Indian Constitution?",
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const msg = customText || inputMessage;
    if (!msg.trim() && !imageBase64) return;

    const userEntry = {
      role: "user" as const,
      text: msg,
      mode,
    };

    setChatHistory((prev) => [...prev, userEntry]);
    setInputMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/tutor-doubt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          subject: selectedSubject,
          grade: user.grade,
          board: user.board,
          mode: mode,
          imageBase64: imageBase64,
          language: user.languagePreference,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get answer");
      }

      const data = await response.json();
      const assistantText = data.text || "Here is the guidance for your concept:";

      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          text: assistantText,
          mode,
        },
      ]);

      addXP(20, "Engaged with AI Tutor");
      setImageBase64(null);
    } catch (e: any) {
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "I experienced a brief hiccup connecting to the server. Please try submitting again!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsNote = (text: string) => {
    saveNote({
      title: `${selectedSubject} - Tutor Note (${new Date().toLocaleDateString()})`,
      subject: selectedSubject,
      content: text,
      type: "doubt-solution",
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      {/* Top Controls: Subject & Mode Selector */}
      <div className="border-b border-slate-200 bg-slate-50/90 p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Subject Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {subjects.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`rounded-xl px-3 py-1 text-xs font-semibold transition-all ${
                  selectedSubject === sub
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          {/* Tutoring Pedagogical Modes */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1 text-xs">
            {[
              { id: "step-by-step", label: "Step-by-Step", icon: GraduationCap },
              { id: "socratic", label: "Socratic Hints", icon: BrainCircuit },
              { id: "explain-5-ways", label: "Explain 5 Ways", icon: Sparkles },
              { id: "teach-back", label: "Teach-Back Test", icon: BookOpen },
            ].map((m) => {
              const Icon = m.icon;
              const isActive = mode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id as any)}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition-all ${
                    isActive
                      ? "bg-white text-indigo-700 font-bold shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  <span className="hidden sm:inline">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mode Explanatory Pill */}
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
          <span>
            Current Mode:{" "}
            <strong className="text-indigo-600">
              {mode === "socratic"
                ? "🏛️ Socratic Coach (Guides with questions instead of revealing answers directly)"
                : mode === "explain-5-ways"
                ? "💡 Explain-5-Ways (Simple Analogy, Visual Model, Mathematical Proof, Real-World Story, 30s Recap)"
                : mode === "teach-back"
                ? "👨‍🏫 Teach-Back (You explain to the AI, AI grades your conceptual clarity)"
                : "🎓 Step-by-Step Systematic Explanations with formulas & why"}
            </strong>
          </span>
          {savedSuccess && (
            <span className="flex items-center gap-1 text-emerald-600 font-semibold animate-pulse">
              <CheckCircle className="h-3 w-3" />
              <span>Saved to My Notes!</span>
            </span>
          )}
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#F8FAFC]">
        {chatHistory.map((item, idx) => {
          const isAssistant = item.role === "assistant";
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${isAssistant ? "justify-start" : "justify-end"}`}
            >
              {isAssistant && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-xs font-bold text-sm">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed sm:text-sm ${
                  isAssistant
                    ? "border border-slate-200 bg-white text-slate-800 shadow-xs"
                    : "bg-indigo-600 text-white font-medium shadow-xs"
                }`}
              >
                <div className="whitespace-pre-wrap max-w-none text-xs sm:text-sm leading-relaxed">
                  {item.text}
                </div>

                {isAssistant && (
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px]">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => speakText(item.text)}
                        className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                        title="Read aloud"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                        <span>Listen</span>
                      </button>
                      <button
                        onClick={() => handleSaveAsNote(item.text)}
                        className="flex items-center gap-1 text-slate-500 hover:text-slate-800 font-medium transition-colors"
                        title="Save note"
                      >
                        <BookmarkPlus className="h-3.5 w-3.5" />
                        <span>Save Note</span>
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">Grade {user.grade} Aligned</span>
                  </div>
                )}
              </div>

              {!isAssistant && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-white shadow-xs">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-indigo-600 p-2 bg-indigo-50/50 rounded-xl border border-indigo-100 max-w-md">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
            <span className="font-medium">SchoolGenius AI is formulating a step-by-step response...</span>
          </div>
        )}
      </div>

      {/* Quick Prompt Suggestions */}
      <div className="border-t border-slate-100 bg-white px-4 py-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
          <span className="text-slate-400 font-medium whitespace-nowrap">Suggested:</span>
          {presetTopics.map((pt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(pt)}
              className="whitespace-nowrap rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700 hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-700 transition-colors font-medium"
            >
              {pt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Composer */}
      <div className="border-t border-slate-200 bg-white p-3 sm:p-4">
        {imageBase64 && (
          <div className="mb-2 flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 p-2 text-xs text-indigo-800">
            <ImageIcon className="h-4 w-4 text-indigo-600" />
            <span>Image attached for visual equation/diagram analysis</span>
            <button
              onClick={() => setImageBase64(null)}
              className="ml-auto text-rose-600 font-semibold hover:underline"
            >
              Remove
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            title="Attach textbook question or sketch"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100 transition-colors shrink-0"
          >
            <Paperclip className="h-4 w-4" />
          </button>

          <input
            type="text"
            placeholder={`Ask any ${selectedSubject} doubt for Grade ${user.grade}...`}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={loading || (!inputMessage.trim() && !imageBase64)}
            className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 text-xs sm:text-sm font-bold text-white shadow-xs active:scale-95 disabled:opacity-50 transition-all shrink-0"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="hidden sm:inline">Ask Tutor</span>
          </button>
        </div>
      </div>
    </div>
  );
};
