import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  Sparkles,
  Layers,
  FileCheck,
  CheckCircle2,
  Volume2,
  Download,
  Loader2,
  Lightbulb,
  BookmarkPlus,
} from "lucide-react";

export const ProjectStudio: React.FC = () => {
  const { user, addXP, speakText, saveNote } = useApp();

  const [projectTopic, setProjectTopic] = useState("Low-Cost Solar Water Purification & Desalination Unit");
  const [projectBudget, setProjectBudget] = useState<"low" | "medium" | "advanced">("low");
  const [projectType, setProjectType] = useState<"working-model" | "investigative-chart" | "ai-iot">("working-model");
  const [blueprintResult, setBlueprintResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const presetIdeas = [
    "Automatic Plant Watering System using Soil Moisture Sensor",
    "Eco-Friendly Bioplastics from Banana Peels and Cornstarch",
    "Smart Traffic Signal system using Optical Sensors",
    "Hydraulic Robotic Arm using Syringes & Pascal's Principle",
  ];

  const handleGenerateBlueprint = async (topicToUse?: string) => {
    const topic = topicToUse || projectTopic;
    if (!topic.trim()) return;

    setLoading(true);
    setBlueprintResult(null);

    try {
      const res = await fetch("/api/project/blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          grade: user.grade,
          budget: projectBudget,
          type: projectType,
        }),
      });

      const data = await res.json();
      setBlueprintResult(data.blueprint || "Project blueprint generated successfully.");
      addXP(40, "Generated Science Fair Blueprint");
    } catch {
      setBlueprintResult(
`# Science Fair Project Blueprint: ${topic}
## 1. Project Title & Objective
To construct a low-cost, scalable demonstration demonstrating solar distillation.

## 2. Scientific Hypothesis
If sunlight is concentrated using a reflective parabolic basin, water evaporation rates will increase by 45%, leaving behind particulate contaminants and dissolved salts.

## 3. Bill of Materials (Budget: Low Cost under ₹500)
- Black painted collection basin (1x)
- Transparent glass sheet / clear acrylic (1x)
- Silicone sealant & condensation collection gutter (1x)
- Condensate tube and clean beaker (1x)

## 4. Step-by-Step Construction Procedure
1. Coat inner basin in non-toxic matte black paint to maximize solar absorption.
2. Incline the transparent glass cover at a 30-degree angle toward the collector trough.
3. Pour saline or turbid water into the lower tray.
4. Place under direct midday sunlight (11 AM - 2 PM) and measure distillate collection volume hourly.

## 5. Viva Presentation Pitch (Say this to Judges!)
"Respected judges, our project solves clean drinking water scarcity for rural and coastal communities utilizing 100% renewable solar thermal distillation..."`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-bold text-white">Science Fair & Project Studio</h1>
              <p className="text-xs text-slate-400">
                AI blueprint architect • Hypothesis, Materials, Step-by-step build & Viva pitch script
              </p>
            </div>
          </div>
        </div>

        <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-300">
          Grade {user.grade} Project Fair
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Input parameters */}
        <div className="space-y-4 lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm">
          <h3 className="font-heading text-sm font-bold text-white">Project Configuration</h3>

          <div>
            <label className="text-xs font-semibold text-slate-300">Project Concept / Title:</label>
            <input
              type="text"
              value={projectTopic}
              onChange={(e) => setProjectTopic(e.target.value)}
              placeholder="e.g. Smart Smart Drainage Overflow Alert System..."
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs sm:text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">Project Type:</label>
            <div className="flex gap-2 mt-1">
              {[
                { id: "working-model", label: "⚙️ Working Model" },
                { id: "investigative-chart", label: "📊 Research Chart" },
                { id: "ai-iot", label: "🤖 AI & IoT Prototype" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setProjectType(t.id as any)}
                  className={`flex-1 rounded-lg py-2 text-xs font-bold ${
                    projectType === t.id ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">Budget Range:</label>
            <div className="flex gap-2 mt-1">
              {[
                { id: "low", label: "💰 Low Cost (< ₹500)" },
                { id: "medium", label: "💵 Standard (< ₹1500)" },
                { id: "advanced", label: "🔬 Advanced Hardware" },
              ].map((b) => (
                <button
                  key={b.id}
                  onClick={() => setProjectBudget(b.id as any)}
                  className={`flex-1 rounded-lg py-2 text-xs font-bold ${
                    projectBudget === b.id ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick preset ideas */}
          <div>
            <span className="text-xs font-semibold text-slate-400">Award-Winning Project Ideas:</span>
            <div className="space-y-1.5 mt-2">
              {presetIdeas.map((idea, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setProjectTopic(idea);
                    handleGenerateBlueprint(idea);
                  }}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/80 p-2.5 text-left text-xs text-slate-300 hover:border-indigo-500/40 hover:text-white transition-colors"
                >
                  {idea}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => handleGenerateBlueprint()}
            disabled={loading || !projectTopic.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:scale-95 disabled:opacity-50 transition-all"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-amber-300" />}
            <span>{loading ? "Architecting Full Blueprint..." : "Generate Master Blueprint"}</span>
          </button>
        </div>

        {/* Right: Master Blueprint View */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-heading text-base font-bold text-white">Full Science Project Blueprint</h3>
              {blueprintResult && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => speakText(blueprintResult)}
                    className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-sky-400 hover:bg-slate-700"
                    title="Read Aloud"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() =>
                      saveNote({
                        title: `Project Blueprint: ${projectTopic}`,
                        subject: "Science Project",
                        content: blueprintResult,
                        type: "science-lab",
                      })
                    }
                    className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-300 hover:bg-slate-700"
                    title="Save Note"
                  >
                    <BookmarkPlus className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="mt-4 min-h-[380px] overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-xs sm:text-sm text-slate-200 leading-relaxed">
              {loading ? (
                <div className="flex h-64 flex-col items-center justify-center gap-3 text-indigo-400">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p className="text-xs">Formulating scientific hypothesis, bill of materials, circuit & judge pitch...</p>
                </div>
              ) : blueprintResult ? (
                <div className="prose prose-invert max-w-none whitespace-pre-wrap">
                  {blueprintResult}
                </div>
              ) : (
                <div className="flex h-64 flex-col items-center justify-center text-center text-slate-500">
                  <Lightbulb className="h-10 w-10 text-slate-700 mb-2" />
                  <p className="font-medium text-slate-300">Select or enter a project idea on the left</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
