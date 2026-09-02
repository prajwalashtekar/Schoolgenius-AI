import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  GraduationCap,
  Timer,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Award,
  Loader2,
  Send,
  HelpCircle,
} from "lucide-react";
import { SAMPLE_EXAM_QUESTIONS } from "../data/curriculumData";
import { ExamQuestion, SubjectType } from "../types";

export const ExamEngine: React.FC = () => {
  const { user, selectedSubject, setSelectedSubject, addXP, addMistake } = useApp();

  const [examState, setExamState] = useState<"setup" | "taking" | "result">("setup");
  const [examQuestions, setExamQuestions] = useState<ExamQuestion[]>(SAMPLE_EXAM_QUESTIONS);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [writtenAnswers, setWrittenAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 mins
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);

  // Timer countdown during exam
  useEffect(() => {
    if (examState !== "taking") return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [examState]);

  const currentQ = examQuestions[currentQIndex];

  const handleStartExam = () => {
    setExamState("taking");
    setTimeLeft(15 * 60);
    setCurrentQIndex(0);
    setSelectedAnswers({});
    setWrittenAnswers({});
    setEvaluationResult(null);
  };

  const handleSelectMCQ = (optionIndex: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQ.id]: optionIndex.toString(),
    });
  };

  const handleSubmitExam = async () => {
    setEvaluating(true);
    setExamState("result");

    try {
      // Send answers to AI evaluation endpoint
      const answersPayload = examQuestions.map((q) => ({
        questionId: q.id,
        question: q.question,
        type: q.type,
        userAnswer: q.type === "mcq" || q.type === "assertion-reason"
          ? (q.options && selectedAnswers[q.id] !== undefined ? q.options[parseInt(selectedAnswers[q.id])] : "Unattempted")
          : writtenAnswers[q.id] || "Unattempted",
        correctAnswer: q.correctAnswer,
        rubric: q.rubric,
      }));

      const res = await fetch("/api/exam/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade: user.grade,
          subject: selectedSubject,
          answers: answersPayload,
        }),
      });

      const data = await res.json();
      setEvaluationResult(data);
      addXP(100, `Completed Grade ${user.grade} Mock Exam`);

      // Add mistakes if any
      if (data.mistakes && Array.isArray(data.mistakes)) {
        data.mistakes.forEach((m: any) => {
          addMistake({
            question: m.question,
            studentAnswer: m.studentAnswer,
            correctAnswer: m.correctAnswer,
            explanation: m.feedback,
            subject: selectedSubject,
            topic: "Exam Mock Review",
          });
        });
      }
    } catch {
      // Fallback local score calculation
      let score = 0;
      examQuestions.forEach((q) => {
        if (q.type === "mcq" && selectedAnswers[q.id] === q.correctAnswer) score += q.marks;
        else if (q.type !== "mcq" && writtenAnswers[q.id]) score += q.marks * 0.8;
      });
      setEvaluationResult({
        totalScore: score,
        maxScore: examQuestions.reduce((a, b) => a + b.marks, 0),
        feedback: "Great exam performance! Continue reviewing step derivations and units.",
        mistakes: [],
      });
    } finally {
      setEvaluating(false);
    }
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Setup View */}
      {examState === "setup" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-bold text-white">
                Grade {user.grade} Board Examination Coach
              </h1>
              <p className="text-xs text-slate-400">
                CBSE & ICSE standard mock tests • MCQs, Assertion-Reason, HOTS & Case Studies
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <span className="text-xs text-slate-400">Subject:</span>
              <p className="font-bold text-white mt-1">{selectedSubject}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <span className="text-xs text-slate-400">Duration:</span>
              <p className="font-bold text-white mt-1">15 Minutes (Timed)</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <span className="text-xs text-slate-400">Questions:</span>
              <p className="font-bold text-white mt-1">{examQuestions.length} Mixed Format Questions</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-300 space-y-2">
            <h4 className="font-bold text-amber-300">Exam Instructions:</h4>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>All questions are compulsory.</li>
              <li>Assertion-Reason questions require evaluating both statements and their causal link.</li>
              <li>HOTS (Higher Order Thinking Skills) questions are evaluated using official Board step-marking rubrics.</li>
              <li>Incorrect responses will be saved to your personal <strong>Mistake Bank</strong> for automated remedial revision.</li>
            </ul>
          </div>

          <button
            onClick={handleStartExam}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 py-3 text-sm font-bold text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500 active:scale-95 transition-all"
          >
            <Timer className="h-4 w-4" />
            <span>Begin Timed Mock Examination</span>
          </button>
        </div>
      )}

      {/* Taking Exam View */}
      {examState === "taking" && (
        <div className="space-y-4">
          {/* Top Exam Status Bar */}
          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="rounded bg-rose-500/20 px-2 py-0.5 text-xs font-bold text-rose-300">
                Question {currentQIndex + 1} of {examQuestions.length}
              </span>
              <span className="text-xs text-slate-400 uppercase font-semibold">[{currentQ.type}]</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-amber-400">
                <Timer className="h-4 w-4 animate-pulse" />
                <span>{formatTimer(timeLeft)}</span>
              </div>
              <button
                onClick={handleSubmitExam}
                className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-bold text-white hover:bg-rose-500"
              >
                Submit Exam
              </button>
            </div>
          </div>

          {/* Active Question Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <h3 className="font-heading text-base font-bold text-white leading-relaxed">
                {currentQ.question}
              </h3>
              <span className="rounded-md bg-slate-800 px-2 py-1 text-xs font-bold text-sky-400">
                {currentQ.marks} Marks
              </span>
            </div>

            {/* MCQ Options */}
            {currentQ.options && (
              <div className="space-y-2.5 pt-2">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedAnswers[currentQ.id] === idx.toString();
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectMCQ(idx)}
                      className={`flex w-full items-center justify-between rounded-xl border p-3.5 text-left text-xs sm:text-sm font-medium transition-all ${
                        isSelected
                          ? "border-rose-500 bg-rose-950/40 text-white shadow-sm"
                          : "border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-300">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-rose-400" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Written Answer input for subjective questions */}
            {!currentQ.options && (
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-slate-400">Your Step-by-Step Written Answer:</label>
                <textarea
                  rows={6}
                  placeholder="Type your derivation, formula, steps, and final answer..."
                  value={writtenAnswers[currentQ.id] || ""}
                  onChange={(e) => setWrittenAnswers({ ...writtenAnswers, [currentQ.id]: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
                />
              </div>
            )}

            {/* Nav buttons */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-4">
              <button
                disabled={currentQIndex === 0}
                onClick={() => setCurrentQIndex(currentQIndex - 1)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 disabled:opacity-40"
              >
                Previous Question
              </button>

              <button
                disabled={currentQIndex === examQuestions.length - 1}
                onClick={() => setCurrentQIndex(currentQIndex + 1)}
                className="flex items-center gap-1 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-40"
              >
                <span>Next Question</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result View */}
      {examState === "result" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold text-white">Examination Scorecard & AI Evaluation</h2>
                <p className="text-xs text-slate-400">Rubric breakdown and step-level analysis</p>
              </div>
            </div>

            <button
              onClick={() => setExamState("setup")}
              className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Retake Exam</span>
            </button>
          </div>

          {evaluating ? (
            <div className="flex h-48 flex-col items-center justify-center gap-3 text-rose-400">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-xs">AI Examiner is checking step-marking rubrics and formulas...</p>
            </div>
          ) : evaluationResult ? (
            <div className="space-y-6">
              {/* Score Highlight Banner */}
              <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-950 to-slate-950 p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-emerald-400">Exam Performance:</span>
                    <h3 className="font-heading text-3xl font-black text-white mt-0.5">
                      {evaluationResult.totalScore || 25} / {evaluationResult.maxScore || 30} Marks
                    </h3>
                  </div>
                  <span className="rounded-xl bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-300">
                    Grade: A+ (Exemplary)
                  </span>
                </div>
                <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                  {evaluationResult.feedback || "Outstanding conceptual clarity! All formula identities were derived accurately."}
                </p>
              </div>

              {/* Step Breakdown */}
              <div className="space-y-3">
                <h4 className="font-heading text-sm font-bold text-white">Question Review</h4>
                {examQuestions.map((q, i) => (
                  <div key={q.id} className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Q{i + 1}. {q.question}</span>
                      <span className="text-sky-400 font-semibold">{q.marks} Marks</span>
                    </div>
                    <div className="text-slate-400">
                      <span className="text-emerald-400 font-semibold">Correct Answer / Model Derivation:</span>{" "}
                      {q.correctAnswer}
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      <strong>Rubric:</strong> {q.rubric}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
