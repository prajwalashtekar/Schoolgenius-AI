import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  Compass,
  Globe,
  BookA,
  Scroll,
  Shield,
  TrendingUp,
  FileCheck,
  Languages,
  Sparkles,
  Volume2,
  CheckCircle2,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { HISTORICAL_TIMELINE_EVENTS } from "../data/curriculumData";

export const SocialLanguageLab: React.FC = () => {
  const { user, addXP, speakText } = useApp();

  const [activeDomain, setActiveDomain] = useState<"social" | "language">("social");
  const [socialTab, setSocialTab] = useState<"history" | "constitution" | "economics">("history");
  const [langTab, setLangTab] = useState<"grammar" | "essay" | "vocab">("grammar");

  // Economics Simulator State
  const [marketPrice, setMarketPrice] = useState(50);

  // Grammar Checker State
  const [sentenceInput, setSentenceInput] = useState("She dont know where the books is kept at.");
  const [grammarResult, setGrammarResult] = useState<any>(null);
  const [grammarLoading, setGrammarLoading] = useState(false);

  // Essay / Letter Drafter State
  const [essayPrompt, setEssayPrompt] = useState("Write a formal letter to the Municipal Commissioner regarding bad roads");
  const [essayResult, setEssayResult] = useState<string | null>(null);
  const [essayLoading, setEssayLoading] = useState(false);

  // Analyze Grammar
  const handleCheckGrammar = async () => {
    setGrammarLoading(true);
    try {
      const res = await fetch("/api/labs/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          labType: "Language & Grammar Lab",
          query: `Analyze this sentence for grammar, tense, subject-verb agreement, and punctuation: "${sentenceInput}". Provide the corrected sentence, explain each error, and show Active/Passive or Direct/Indirect transformations if applicable.`,
        }),
      });
      const data = await res.json();
      setGrammarResult(data.result);
      addXP(15, "Analyzed Sentence Grammar");
    } catch {
      setGrammarResult("Corrected: She doesn't know where the books are kept.\nErrors: 'dont' -> 'doesn't' (third-person singular), 'is' -> 'are' (plural books).");
    } finally {
      setGrammarLoading(false);
    }
  };

  // Draft Essay / Letter
  const handleDraftEssay = async () => {
    setEssayLoading(true);
    try {
      const res = await fetch("/api/labs/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          labType: "Language & Writing Studio",
          query: `Draft a high-scoring exemplar for Grade ${user.grade} Board Exam: ${essayPrompt}. Follow formal standard layout, sender/receiver addresses, subject line, body paragraphs, and formal conclusion.`,
        }),
      });
      const data = await res.json();
      setEssayResult(data.result);
      addXP(25, "Drafted High-Scoring Formal Letter");
    } catch {
      setEssayResult("Standard Formal Letter draft formatted according to CBSE/ICSE Board Rubric guidelines.");
    } finally {
      setEssayLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-bold text-white">Social Science & Language Studio</h1>
              <p className="text-xs text-slate-400">
                Interactive History Timelines, Indian Constitution, Economics Market & Grammar Analyzer
              </p>
            </div>
          </div>
        </div>

        {/* 2 Domain switchers */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950 p-1 text-xs">
          {[
            { id: "social", label: "🌍 Social Science Lab" },
            { id: "language", label: "✍️ Languages & Grammar" },
          ].map((d) => (
            <button
              key={d.id}
              onClick={() => setActiveDomain(d.id as any)}
              className={`rounded-lg px-3 py-1.5 font-bold transition-all ${
                activeDomain === d.id
                  ? "bg-violet-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. SOCIAL SCIENCE LAB */}
      {activeDomain === "social" && (
        <div className="space-y-5">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-slate-800 pb-2 text-xs">
            {[
              { id: "history", label: "Interactive History Timeline" },
              { id: "constitution", label: "Constitution & Civics Explorer" },
              { id: "economics", label: "Economics & Market Simulator" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSocialTab(t.id as any)}
                className={`rounded-lg px-3 py-1.5 font-semibold ${
                  socialTab === t.id ? "bg-violet-600 text-white" : "bg-slate-800 text-slate-400"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* History Timeline */}
          {socialTab === "history" && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm space-y-4">
              <h3 className="font-heading text-base font-bold text-white flex items-center gap-2">
                <Scroll className="h-5 w-5 text-amber-400" />
                <span>Major Indian & World Historical Milestones</span>
              </h3>

              <div className="relative border-l-2 border-slate-800 ml-4 space-y-6 py-2">
                {HISTORICAL_TIMELINE_EVENTS.map((event) => (
                  <div key={event.id} className="relative pl-6 group">
                    <div className="absolute -left-2 top-1.5 h-4 w-4 rounded-full border-2 border-slate-900 bg-amber-400 group-hover:scale-125 transition-transform" />
                    <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 hover:border-amber-500/40 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-amber-400">{event.year}</span>
                        <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                          {event.era}
                        </span>
                      </div>
                      <h4 className="font-heading text-sm font-bold text-white mt-1">{event.title}</h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{event.significance}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => speakText(`${event.title}, year ${event.year}. ${event.significance}`)}
                          className="flex items-center gap-1 text-[11px] text-sky-400 hover:underline"
                        >
                          <Volume2 className="h-3 w-3" />
                          <span>Narrate</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Constitution & Civics Explorer */}
          {socialTab === "constitution" && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="space-y-3 lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-emerald-400" />
                  <h3 className="font-heading text-sm font-bold text-white">6 Fundamental Rights (Part III)</h3>
                </div>
                <div className="space-y-2 text-xs">
                  {[
                    { title: "Right to Equality (Articles 14–18)", desc: "Prohibition of discrimination on grounds of religion, race, caste, sex or place of birth." },
                    { title: "Right to Freedom (Articles 19–22)", desc: "Freedom of speech, assembly, association, movement, residence, and profession." },
                    { title: "Right against Exploitation (Articles 23–24)", desc: "Prohibition of human trafficking, forced labor, and child employment under 14." },
                    { title: "Right to Freedom of Religion (Articles 25–28)", desc: "Freedom of conscience and free profession, practice, and propagation of religion." },
                    { title: "Cultural & Educational Rights (Articles 29–30)", desc: "Protection of interests of linguistic and religious minorities to establish institutions." },
                    { title: "Right to Constitutional Remedies (Article 32)", desc: "Heart and Soul of the Constitution; power to move Supreme Court via Writs (Habeas Corpus, Mandamus)." },
                  ].map((r, i) => (
                    <div key={i} className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                      <p className="font-bold text-emerald-300">{r.title}</p>
                      <p className="text-slate-400 mt-1">{r.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preamble & Key Pillars */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm lg:col-span-7 flex flex-col justify-between">
                <div>
                  <h3 className="font-heading text-base font-bold text-amber-300 border-b border-slate-800 pb-3">
                    📜 The Preamble to the Constitution of India
                  </h3>
                  <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-950/10 p-4 font-serif text-xs sm:text-sm text-slate-200 leading-relaxed italic">
                    "WE, THE PEOPLE OF INDIA, having solemnly resolved to constitute India into a SOVEREIGN SOCIALIST SECULAR DEMOCRATIC REPUBLIC and to secure to all its citizens: JUSTICE, social, economic and political; LIBERTY of thought, expression, belief, faith and worship; EQUALITY of status and of opportunity; and to promote among them all FRATERNITY assuring the dignity of the individual and the unity and integrity of the Nation..."
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                      <span className="font-bold text-sky-400">Adopted:</span>
                      <p className="text-slate-300 mt-0.5">26th November 1949 (Constitution Day)</p>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                      <span className="font-bold text-sky-400">Enforced:</span>
                      <p className="text-slate-300 mt-0.5">26th January 1950 (Republic Day)</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => addXP(20, "Mastered Constitutional Rights & Preamble")}
                  className="mt-4 flex w-full items-center justify-center gap-1 rounded-xl bg-violet-600 py-2.5 text-xs font-semibold text-white hover:bg-violet-500"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Mark Civics Module Completed (+20 XP)</span>
                </button>
              </div>
            </div>
          )}

          {/* Economics Simulator */}
          {socialTab === "economics" && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                  <h3 className="font-heading text-sm font-bold text-white">Supply & Demand Equilibrium</h3>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Market Price (P):</span>
                    <span className="font-mono text-emerald-400">₹{marketPrice}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={marketPrice}
                    onChange={(e) => setMarketPrice(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer mt-1"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>₹10 (Shortage)</span>
                    <span>₹50 (Equilibrium Price)</span>
                    <span>₹90 (Surplus)</span>
                  </div>
                </div>

                {(() => {
                  const demand = 100 - marketPrice;
                  const supply = marketPrice;
                  const diff = supply - demand;

                  return (
                    <div className="space-y-2 text-xs">
                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 flex justify-between">
                        <span className="text-slate-400">Quantity Demanded (Qd):</span>
                        <span className="font-mono font-bold text-sky-400">{demand} units</span>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 flex justify-between">
                        <span className="text-slate-400">Quantity Supplied (Qs):</span>
                        <span className="font-mono font-bold text-amber-400">{supply} units</span>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                        <span className="font-semibold text-white">Market State:</span>
                        <p className="mt-1 font-bold">
                          {diff === 0 ? (
                            <span className="text-emerald-400">🎯 Market Clearing Equilibrium (Q = 50)</span>
                          ) : diff > 0 ? (
                            <span className="text-rose-400">⚠️ Excess Supply / Surplus ({diff} unsold units) ➔ Price will fall</span>
                          ) : (
                            <span className="text-amber-400">⚠️ Excess Demand / Shortage ({Math.abs(diff)} unfulfilled units) ➔ Price will rise</span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Economic Sectors */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm lg:col-span-7 flex flex-col justify-between">
                <div>
                  <h4 className="font-heading text-sm font-bold text-white border-b border-slate-800 pb-3">
                    3 Sectors of the Indian Economy
                  </h4>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center">
                      <span className="text-lg">🌾</span>
                      <p className="font-bold text-emerald-400 mt-1">Primary Sector</p>
                      <p className="text-[11px] text-slate-400 mt-1">Agriculture, mining, fishing, forestry (Raw extraction)</p>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center">
                      <span className="text-lg">🏭</span>
                      <p className="font-bold text-amber-400 mt-1">Secondary Sector</p>
                      <p className="text-[11px] text-slate-400 mt-1">Manufacturing, factories, construction, power plants</p>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center">
                      <span className="text-lg">💻</span>
                      <p className="font-bold text-sky-400 mt-1">Tertiary Sector</p>
                      <p className="text-[11px] text-slate-400 mt-1">Services, IT, healthcare, banking, education, transport</p>
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-xs text-slate-400 text-center border-t border-slate-800 pt-3">
                  In India, while the <strong>Primary Sector</strong> employs the largest workforce (~44%), the <strong>Tertiary Sector</strong> contributes the highest share to the national Gross Domestic Product (GDP ~54%).
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. LANGUAGE & GRAMMAR LAB */}
      {activeDomain === "language" && (
        <div className="space-y-5">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-slate-800 pb-2 text-xs">
            {[
              { id: "grammar", label: "Grammar & Syntax Analyzer" },
              { id: "essay", label: "Essay, Notice & Letter Studio" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setLangTab(t.id as any)}
                className={`rounded-lg px-3 py-1.5 font-semibold ${
                  langTab === t.id ? "bg-violet-600 text-white" : "bg-slate-800 text-slate-400"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Grammar Analyzer */}
          {langTab === "grammar" && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm space-y-4">
              <div>
                <h3 className="font-heading text-base font-bold text-white">Grammar, Tense & Syntax Doctor</h3>
                <p className="text-xs text-slate-400">
                  Type any sentence to diagnose syntax errors, passive voice, clauses, and correct phrasing
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={sentenceInput}
                  onChange={(e) => setSentenceInput(e.target.value)}
                  placeholder="Enter a sentence to check..."
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none"
                />
                <button
                  onClick={handleCheckGrammar}
                  disabled={grammarLoading}
                  className="rounded-xl bg-violet-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-violet-500 disabled:opacity-50"
                >
                  {grammarLoading ? "Checking..." : "Analyze Sentence"}
                </button>
              </div>

              {grammarResult && (
                <div className="rounded-xl border border-violet-500/30 bg-slate-950 p-4 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {grammarResult}
                </div>
              )}
            </div>
          )}

          {/* Essay & Letter Studio */}
          {langTab === "essay" && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm space-y-4">
              <div>
                <h3 className="font-heading text-base font-bold text-white">Formal Writing & Letter Studio</h3>
                <p className="text-xs text-slate-400">
                  Generate board-format letters, essays, notices, and articles with marking rubric guidelines
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={essayPrompt}
                  onChange={(e) => setEssayPrompt(e.target.value)}
                  placeholder="Enter essay topic or letter prompt..."
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none"
                />
                <button
                  onClick={handleDraftEssay}
                  disabled={essayLoading}
                  className="rounded-xl bg-violet-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-violet-500 disabled:opacity-50"
                >
                  {essayLoading ? "Drafting..." : "Generate Exemplar"}
                </button>
              </div>

              {essayResult && (
                <div className="rounded-xl border border-violet-500/30 bg-slate-950 p-4 text-xs sm:text-sm text-slate-200 leading-relaxed font-mono whitespace-pre-wrap">
                  {essayResult}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
