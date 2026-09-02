import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  GraduationCap,
  FileText,
  Printer,
  Sparkles,
  Download,
  BookOpen,
  CheckCircle2,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { SubjectType } from "../types";

export const TeacherMode: React.FC = () => {
  const { user, selectedSubject, setSelectedSubject, addXP } = useApp();

  const [toolType, setToolType] = useState<"worksheet" | "lesson-plan" | "rubric">("worksheet");
  const [topic, setTopic] = useState("Chemical Reactions & Equations (Class 10 CBSE)");
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "hots">("medium");
  const [resultDoc, setResultDoc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateTeacherResource = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setResultDoc(null);

    try {
      const res = await fetch("/api/teacher/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: toolType,
          subject: selectedSubject,
          grade: user.grade,
          topic,
          numQuestions,
          difficulty,
        }),
      });

      const data = await res.json();
      setResultDoc(data.content || "Resource generated successfully.");
      addXP(30, "Generated Teacher Material");
    } catch {
      setResultDoc(
`# SCHOOLGENIUS AI — CLASSROOM PRINTABLE WORKSHEET
**Subject:** ${selectedSubject} | **Grade:** ${user.grade} | **Topic:** ${topic}
**Time Allowed:** 45 Minutes | **Maximum Marks:** 25

---

### SECTION A: Multiple Choice Questions (1 Mark Each)
1. Which of the following is an exothermic combination reaction?
   a) Decomposition of lead nitrate
   b) Burning of natural gas (methane)
   c) Photosynthesis
   d) Dissolution of ammonium chloride

2. The pale green color of ferrous sulphate solution turns into reddish-brown on strong heating due to:
   a) FeO
   b) Fe₂O₃
   c) Fe₃O₄
   d) FeS

---

### SECTION B: Short Answer Questions (3 Marks Each)
3. Write balanced chemical equations for the following:
   a) Zinc metal reacts with dilute sulphuric acid.
   b) Calcium oxide (quicklime) reacts vigorously with water.

---

### ANSWER KEY & STEP MARKING RUBRIC (For Teachers)
1. (b) Burning of natural gas
2. (b) Fe₂O₃ (Ferric oxide)
3. a) Zn(s) + H₂SO₄(aq) ➔ ZnSO₄(aq) + H₂(g) ↑ [1.5 Marks]
   b) CaO(s) + H₂O(l) ➔ Ca(OH)₂(aq) + Heat [1.5 Marks]`
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    if (resultDoc) {
      navigator.clipboard.writeText(resultDoc);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-bold text-white">Teacher & Parent Companion Studio</h1>
              <p className="text-xs text-slate-400">
                Generate printable worksheets, complete lesson plans, marking rubrics & exam question banks
              </p>
            </div>
          </div>
        </div>

        {/* Tool switchers */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950 p-1 text-xs">
          {[
            { id: "worksheet", label: "📄 Worksheet Generator" },
            { id: "lesson-plan", label: "📋 Lesson Plan Builder" },
            { id: "rubric", label: "🎯 Marking Rubric" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setToolType(t.id as any)}
              className={`rounded-lg px-3 py-1.5 font-bold transition-all ${
                toolType === t.id ? "bg-purple-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Resource Generator Controls */}
        <div className="space-y-4 lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm">
          <h3 className="font-heading text-sm font-bold text-white">Generator Settings</h3>

          <div>
            <label className="text-xs font-semibold text-slate-300">Topic / Chapter Title:</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs sm:text-sm text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300">Subject:</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value as SubjectType)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:outline-none"
              >
                {["Mathematics", "Physics", "Chemistry", "Biology", "Social Science", "English"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Target Grade:</label>
              <div className="mt-1 rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs font-bold text-purple-300">
                Grade {user.grade} ({user.board})
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">Difficulty Level:</label>
            <div className="grid grid-cols-4 gap-1.5 mt-1">
              {["easy", "medium", "hard", "hots"].map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d as any)}
                  className={`rounded-lg py-2 text-xs font-bold uppercase ${
                    difficulty === d ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerateTeacherResource}
            disabled={loading || !topic.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-3 text-sm font-bold text-white shadow-lg shadow-purple-600/30 hover:bg-purple-500 active:scale-95 disabled:opacity-50 transition-all"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-amber-300" />}
            <span>{loading ? "Generating Resource & Answer Key..." : "Generate Teacher Resource"}</span>
          </button>
        </div>

        {/* Right: Printable Preview Document */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-heading text-base font-bold text-white">Classroom Printable Resource Preview</h3>
              {resultDoc && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1 text-xs font-bold text-white hover:bg-indigo-500"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Print</span>
                  </button>
                </div>
              )}
            </div>

            <div className="mt-4 min-h-[380px] overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/80 p-5 text-xs sm:text-sm text-slate-200 font-mono leading-relaxed">
              {loading ? (
                <div className="flex h-64 flex-col items-center justify-center gap-3 text-purple-400">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p className="text-xs">Formulating questions, answer keys and pedagogical rubric...</p>
                </div>
              ) : resultDoc ? (
                <div className="whitespace-pre-wrap">{resultDoc}</div>
              ) : (
                <div className="flex h-64 flex-col items-center justify-center text-center text-slate-500">
                  <FileText className="h-10 w-10 text-slate-700 mb-2" />
                  <p className="font-medium text-slate-400">Click Generate on the left to create resources</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
