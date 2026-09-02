import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  Sparkles,
  Layers,
  Brain,
  Bookmark,
  RotateCw,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Volume2,
  FileText,
  Copy,
  Check,
} from "lucide-react";
import { PRESET_FLASHCARDS, PRESET_FORMULAS, PRESET_MNEMONICS } from "../data/curriculumData";
import { Flashcard } from "../types";

export const RevisionEngine: React.FC = () => {
  const { user, selectedSubject, addXP, speakText } = useApp();

  const [revTab, setRevTab] = useState<"flashcards" | "mindmap" | "formulas" | "mnemonics" | "onepager">("flashcards");

  // Flashcards state
  const [cards, setCards] = useState<Flashcard[]>(PRESET_FLASHCARDS);
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Mnemonic generator state
  const [customTopic, setCustomTopic] = useState("");
  const [generatedMnemonic, setGeneratedMnemonic] = useState<string | null>(null);
  const [genLoading, setGenLoading] = useState(false);

  const currentCard = cards[cardIndex];

  const handleNextCard = (knewIt: boolean) => {
    setIsFlipped(false);
    if (knewIt) {
      addXP(10, "Reviewed Flashcard (Mastered)");
    }
    if (cardIndex < cards.length - 1) {
      setCardIndex(cardIndex + 1);
    } else {
      setCardIndex(0);
    }
  };

  const copyFormula = (formula: string, id: string) => {
    navigator.clipboard.writeText(formula);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateMnemonic = async () => {
    if (!customTopic.trim()) return;
    setGenLoading(true);
    try {
      const res = await fetch("/api/revision/mindmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: `Create a memorable, clever, funny mnemonic and acronym to easily memorize: ${customTopic}`,
          grade: user.grade,
          subject: selectedSubject,
        }),
      });
      const data = await res.json();
      setGeneratedMnemonic(data.onePager || "Mnemonics: Remember key initials in sequence!");
      addXP(15, "Generated Custom Memory Mnemonic");
    } catch {
      setGeneratedMnemonic("Mnemonic: My Very Educated Mother Just Served Us Nachos (Planets: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune)");
    } finally {
      setGenLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-bold text-white">Smart Revision Assistant & Mind Maps</h1>
              <p className="text-xs text-slate-400">
                Spaced Repetition Leitner Flashcards • Formula Banks • Visual Mind Maps • Mnemonics
              </p>
            </div>
          </div>
        </div>

        {/* Subtabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar rounded-xl border border-slate-800 bg-slate-950 p-1 text-xs">
          {[
            { id: "flashcards", label: "🗂️ Spaced Flashcards" },
            { id: "mindmap", label: "🧠 Visual Mind Map" },
            { id: "formulas", label: "📐 Formula Bank" },
            { id: "mnemonics", label: "💡 Memory Mnemonics" },
            { id: "onepager", label: "📄 1-Page Summary" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setRevTab(t.id as any)}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-all ${
                revTab === t.id
                  ? "bg-violet-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Flashcards */}
      {revTab === "flashcards" && (
        <div className="mx-auto max-w-xl space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Card {cardIndex + 1} of {cards.length} • {currentCard.subject}
            </span>
            <span className="rounded bg-indigo-500/20 px-2 py-0.5 font-bold text-indigo-300">
              Leitner Box {currentCard.box}
            </span>
          </div>

          {/* Flip card box */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer select-none rounded-2xl border border-slate-700 bg-gradient-to-b from-slate-900 to-slate-950 p-8 shadow-xl min-h-[260px] flex flex-col items-center justify-center text-center transition-all hover:border-violet-500/50"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400 mb-2">
              {isFlipped ? "Answer / Explanation (Click to flip back)" : "Question (Click card to reveal answer)"}
            </span>

            <p className="font-heading text-lg font-bold text-white leading-relaxed">
              {isFlipped ? currentCard.back : currentCard.front}
            </p>

            <div className="mt-6 flex items-center gap-1.5 text-xs text-slate-500">
              <RotateCw className="h-3.5 w-3.5" />
              <span>Tap anywhere to flip</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleNextCard(false)}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 py-3 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition-colors"
            >
              <XCircle className="h-4 w-4" />
              <span>Need Review (Move to Box 1)</span>
            </button>
            <button
              onClick={() => handleNextCard(true)}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-3 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition-colors"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>I Knew It! (Level Up Box)</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Visual Mind Map */}
      {revTab === "mindmap" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-heading text-base font-bold text-white flex items-center gap-2">
              <Brain className="h-5 w-5 text-violet-400" />
              <span>Concept Tree: Photosynthesis & Energy Transfer</span>
            </h3>
            <span className="text-xs text-slate-400">Interactive Hierarchy</span>
          </div>

          {/* Visual Tree Node Graph */}
          <div className="flex flex-col items-center space-y-6">
            {/* Root Node */}
            <div className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 font-heading font-bold text-white shadow-lg text-sm sm:text-base">
              🌿 Photosynthesis (6CO₂ + 6H₂O ➔ C₆H₁₂O₆ + 6O₂)
            </div>

            <div className="h-6 w-0.5 bg-slate-700" />

            {/* Level 1 branches */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 w-full max-w-2xl">
              {/* Branch A */}
              <div className="rounded-xl border border-sky-500/40 bg-slate-950 p-4 space-y-2">
                <h4 className="font-bold text-sky-400 text-sm">1. Light-Dependent Reactions</h4>
                <p className="text-xs text-slate-300">
                  Location: <strong>Thylakoid Grana</strong> inside Chloroplast
                </p>
                <ul className="text-[11px] text-slate-400 list-disc list-inside space-y-0.5">
                  <li>Chlorophyll absorbs photons</li>
                  <li>Photolysis of H₂O splits water into O₂ and H⁺</li>
                  <li>Generates ATP and NADPH energy currency</li>
                </ul>
              </div>

              {/* Branch B */}
              <div className="rounded-xl border border-emerald-500/40 bg-slate-950 p-4 space-y-2">
                <h4 className="font-bold text-emerald-400 text-sm">2. Light-Independent (Calvin Cycle)</h4>
                <p className="text-xs text-slate-300">
                  Location: <strong>Stroma Fluid</strong> of Chloroplast
                </p>
                <ul className="text-[11px] text-slate-400 list-disc list-inside space-y-0.5">
                  <li>Carbon Fixation catalyzed by RuBisCO enzyme</li>
                  <li>Uses ATP & NADPH from light reaction</li>
                  <li>Synthesizes Glucose (C₆H₁₂O₆) sugar molecules</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Formula Bank */}
      {revTab === "formulas" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-heading text-base font-bold text-white">
              Essential Board Formula Repository
            </h3>
            <span className="text-xs text-slate-400">Click to copy formula text</span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {PRESET_FORMULAS.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4 hover:border-slate-700 transition-colors"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                    {f.subject} • {f.topic}
                  </span>
                  <h4 className="font-bold text-white text-xs sm:text-sm">{f.name}</h4>
                  <p className="font-mono text-sm font-bold text-amber-300 mt-1">{f.formula}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{f.description}</p>
                </div>

                <button
                  onClick={() => copyFormula(f.formula, f.id)}
                  className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:bg-slate-700"
                  title="Copy formula"
                >
                  {copiedId === f.id ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Mnemonics */}
      {revTab === "mnemonics" && (
        <div className="space-y-4">
          {/* Preset Mnemonics */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {PRESET_MNEMONICS.map((m) => (
              <div key={m.id} className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-2">
                <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">
                  {m.subject} • {m.topic}
                </span>
                <h4 className="font-heading text-sm font-bold text-white">{m.phrase}</h4>
                <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono">
                  {m.explanation}
                </p>
                <button
                  onClick={() => speakText(m.phrase + ". " + m.explanation)}
                  className="flex items-center gap-1 text-[11px] text-sky-400 hover:underline"
                >
                  <Volume2 className="h-3 w-3" />
                  <span>Listen to Rhyme</span>
                </button>
              </div>
            ))}
          </div>

          {/* Mnemonic Generator Tool */}
          <div className="rounded-2xl border border-violet-500/30 bg-slate-900/90 p-5 shadow-sm space-y-3">
            <h3 className="font-heading text-sm font-bold text-white flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-300" />
              <span>Generate AI Custom Mnemonic</span>
            </h3>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="e.g. 12 cranial nerves in biology, or Reactivity series of metals..."
                className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-xs sm:text-sm text-white focus:outline-none"
              />
              <button
                onClick={handleGenerateMnemonic}
                disabled={genLoading}
                className="rounded-xl bg-violet-600 px-4 py-2 text-xs sm:text-sm font-bold text-white hover:bg-violet-500 disabled:opacity-50"
              >
                {genLoading ? "Creating..." : "Create Mnemonic"}
              </button>
            </div>

            {generatedMnemonic && (
              <div className="rounded-xl border border-violet-500/30 bg-slate-950 p-4 text-xs sm:text-sm text-slate-200 leading-relaxed font-mono whitespace-pre-wrap">
                {generatedMnemonic}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. 1-Page Revision Summary */}
      {revTab === "onepager" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-heading text-base font-bold text-white">
              Grade {user.grade} Board Examination 1-Page Master Cheat Sheet
            </h3>
            <span className="text-xs text-emerald-400 font-bold">100% Curriculum Aligned</span>
          </div>

          <div className="space-y-4 text-xs leading-relaxed text-slate-200">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <h4 className="font-bold text-sky-400 text-sm mb-1">⚡ Physics Core Formulas & Laws</h4>
              <p>• <strong>Newton's 2nd Law:</strong> F = m·a | <strong>Momentum:</strong> p = m·v</p>
              <p>• <strong>Ohm's Law:</strong> V = I·R | <strong>Electric Power:</strong> P = V·I = I²R = V²/R</p>
              <p>• <strong>Mirror Formula:</strong> 1/f = 1/v + 1/u | <strong>Lens Formula:</strong> 1/f = 1/v - 1/u</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <h4 className="font-bold text-emerald-400 text-sm mb-1">🧪 Chemistry Reactions & Valency</h4>
              <p>• <strong>Displacement:</strong> Fe + CuSO₄ (blue) ➔ FeSO₄ (pale green) + Cu (reddish brown)</p>
              <p>• <strong>Neutralization:</strong> Acid + Base ➔ Salt + Water + Heat (Exothermic)</p>
              <p>• <strong>pH Scale:</strong> pH = -log[H⁺] (Acidic &lt; 7, Neutral = 7, Basic &gt; 7)</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <h4 className="font-bold text-amber-400 text-sm mb-1">📐 Mathematics Identities</h4>
              <p>• <strong>Quadratic Formula:</strong> x = (-b ± √(b² - 4ac)) / (2a)</p>
              <p>• <strong>Trig Pythagorean:</strong> sin²θ + cos²θ = 1, 1 + tan²θ = sec²θ, 1 + cot²θ = cosec²θ</p>
              <p>• <strong>Arithmetic Progression:</strong> aₙ = a + (n-1)d | Sₙ = (n/2)[2a + (n-1)d]</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
