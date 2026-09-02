import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  FlaskConical,
  Atom,
  Eye,
  Sparkles,
  Play,
  RotateCcw,
  Zap,
  Layers,
  Thermometer,
  ShieldAlert,
  ChevronRight,
  Flame,
  Volume2,
  Info,
  Maximize2,
  CheckCircle2,
  Search,
} from "lucide-react";
import { PERIODIC_TABLE_ELEMENTS, PRESET_CHEMICAL_REACTIONS } from "../data/curriculumData";
import { ChemicalElement } from "../types";

export const ScienceLab: React.FC = () => {
  const { addXP, speakText } = useApp();

  const [activeLab, setActiveLab] = useState<"chemistry" | "physics" | "biology">("chemistry");
  const [chemSubTab, setChemSubTab] = useState<"periodic" | "reactions" | "balancer" | "titration" | "mole" | "bohr">("periodic");
  const [physicsSubTab, setPhysicsSubTab] = useState<"projectile" | "friction" | "circuit" | "optics" | "waves">("projectile");
  const [bioSubTab, setBioSubTab] = useState<"microscope" | "anatomy" | "dna" | "ecosystem">("microscope");

  // Periodic Table State
  const [selectedElement, setSelectedElement] = useState<ChemicalElement>(PERIODIC_TABLE_ELEMENTS[0]);
  const [elementFilter, setElementFilter] = useState<string>("all");
  const [elementSearch, setElementSearch] = useState<string>("");

  // Virtual Reactions State
  const [selectedReaction, setSelectedReaction] = useState(PRESET_CHEMICAL_REACTIONS[0]);
  const [isReacting, setIsReacting] = useState(false);
  const [reactionProgress, setReactionProgress] = useState(0);

  // Equation Balancer State
  const [unbalancedEq, setUnbalancedEq] = useState("Fe + O2 -> Fe2O3");
  const [balancedResult, setBalancedResult] = useState<any>(null);
  const [balancingLoading, setBalancingLoading] = useState(false);

  // Titration State
  const [titrantVolume, setTitrantVolume] = useState(0); // mL NaOH added
  const [indicator, setIndicator] = useState<"phenolphthalein" | "methyl_orange">("phenolphthalein");

  // Physics Projectile State
  const [projAngle, setProjAngle] = useState(45);
  const [projSpeed, setProjSpeed] = useState(25);
  const [projGravity, setProjGravity] = useState(9.8);
  const [projAnimating, setProjAnimating] = useState(false);
  const [projT, setProjT] = useState(0);
  const projCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Physics Optics State
  const [opticsType, setOpticsType] = useState<"convex_lens" | "concave_lens" | "concave_mirror">("convex_lens");
  const [focalLength, setFocalLength] = useState(50);
  const [objectDistance, setObjectDistance] = useState(100);
  const [objectHeight, setObjectHeight] = useState(30);

  // Biology Microscope State
  const [cellType, setCellType] = useState<"plant" | "animal">("plant");
  const [magnification, setMagnification] = useState<number>(100);
  const [focusLevel, setFocusLevel] = useState<number>(50); // 50 is perfect focus
  const [selectedOrganelle, setSelectedOrganelle] = useState<string>("Nucleus");

  // DNA Transcriber State
  const [dnaInput, setDnaInput] = useState("ATGCGATAC");
  const [transcribeResult, setTranscribeResult] = useState<{ mrna: string; aminoAcids: string[] }>({
    mrna: "UACGCUAUG",
    aminoAcids: ["Tyr (Tyrosine)", "Ala (Alanine)", "Met (Methionine)"],
  });

  // Circuit Builder State
  const [circuitSeries, setCircuitSeries] = useState(true);
  const [circuitVoltage, setCircuitVoltage] = useState(9);
  const [resistor1, setResistor1] = useState(10);
  const [resistor2, setResistor2] = useState(20);
  const [circuitSwitch, setCircuitSwitch] = useState(true);

  // Trigger Reaction Animation
  const triggerReaction = () => {
    setIsReacting(true);
    setReactionProgress(0);
    const interval = setInterval(() => {
      setReactionProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsReacting(false);
          addXP(30, "Completed Chemical Reaction Simulation");
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  // Solve Equation Balancing
  const balanceEquation = async () => {
    setBalancingLoading(true);
    try {
      const res = await fetch("/api/labs/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          labType: "Chemistry Equation Balancer",
          query: `Balance this chemical equation step-by-step: ${unbalancedEq}. Explain oxidation numbers, balancing atom counts on LHS and RHS.`,
        }),
      });
      const data = await res.json();
      setBalancedResult(data.result);
      addXP(20, "Balanced Chemical Equation");
    } catch {
      setBalancedResult("2Fe + 3O₂ ➔ 2Fe₂O₃\nBalanced atom counts: Fe: 4 on both sides, O: 6 on both sides.");
    } finally {
      setBalancingLoading(false);
    }
  };

  // Draw Projectile Canvas
  useEffect(() => {
    const canvas = projCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Ground line
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(30, 200);
    ctx.lineTo(470, 200);
    ctx.stroke();

    // Trajectory calculations
    const rad = (projAngle * Math.PI) / 180;
    const vx = projSpeed * Math.cos(rad);
    const vy = projSpeed * Math.sin(rad);
    const totalTime = (2 * vy) / projGravity;
    const maxHeight = (vy * vy) / (2 * projGravity);
    const maxRange = vx * totalTime;

    // Draw theoretical path
    ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(30, 200);

    for (let t = 0; t <= totalTime; t += 0.05) {
      const x = 30 + (vx * t * 400) / (maxRange || 1);
      const y = 200 - (vy * t - 0.5 * projGravity * t * t) * (150 / (maxHeight || 1));
      ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Animated ball position
    const currentT = (projT / 100) * totalTime;
    const ballX = 30 + (vx * currentT * 400) / (maxRange || 1);
    const ballY = 200 - (vy * currentT - 0.5 * projGravity * currentT * currentT) * (150 / (maxHeight || 1));

    // Ball
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.arc(ballX, ballY, 8, 0, 2 * Math.PI);
    ctx.fill();

    // Velocity vector arrow
    const currentVy = vy - projGravity * currentT;
    ctx.strokeStyle = "#f43f5e";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ballX, ballY);
    ctx.lineTo(ballX + vx * 0.8, ballY - currentVy * 0.8);
    ctx.stroke();
  }, [projAngle, projSpeed, projGravity, projT, activeLab, physicsSubTab]);

  // Projectile animation loop
  useEffect(() => {
    if (!projAnimating) return;
    const interval = setInterval(() => {
      setProjT((prev) => {
        if (prev >= 100) {
          setProjAnimating(false);
          return 0;
        }
        return prev + 2;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [projAnimating]);

  // DNA Translation Handler
  const handleTranscribeDNA = () => {
    const dna = dnaInput.toUpperCase().replace(/[^ATGC]/g, "");
    // DNA to mRNA: A->U, T->A, C->G, G->C
    let mrna = "";
    for (let char of dna) {
      if (char === "A") mrna += "U";
      else if (char === "T") mrna += "A";
      else if (char === "C") mrna += "G";
      else if (char === "G") mrna += "C";
    }

    const codonMap: Record<string, string> = {
      AUG: "Met (Start)",
      UUU: "Phe",
      UUC: "Phe",
      UUA: "Leu",
      UUG: "Leu",
      UCU: "Ser",
      UCC: "Ser",
      UCA: "Ser",
      UCG: "Ser",
      UAU: "Tyr",
      UAC: "Tyr",
      UGU: "Cys",
      UGC: "Cys",
      UGG: "Trp",
      CUU: "Leu",
      CUC: "Leu",
      CUA: "Leu",
      CUG: "Leu",
      CCU: "Pro",
      CCC: "Pro",
      CCA: "Pro",
      CCG: "Pro",
      CAU: "His",
      CAC: "His",
      CAA: "Gln",
      CAG: "Gln",
      CGU: "Arg",
      CGC: "Arg",
      CGA: "Arg",
      CGG: "Arg",
      AUU: "Ile",
      AUC: "Ile",
      AUA: "Ile",
      ACU: "Thr",
      ACC: "Thr",
      ACA: "Thr",
      ACG: "Thr",
      AAU: "Asn",
      AAC: "Asn",
      AAA: "Lys",
      AAG: "Lys",
      AGU: "Ser",
      AGC: "Ser",
      AGA: "Arg",
      AGG: "Arg",
      GUU: "Val",
      GUC: "Val",
      GUA: "Val",
      GUG: "Val",
      GCU: "Ala",
      GCC: "Ala",
      GCA: "Ala",
      GCG: "Ala",
      GAU: "Asp",
      GAC: "Asp",
      GAA: "Glu",
      GAG: "Glu",
      GGU: "Gly",
      GGC: "Gly",
      GGA: "Gly",
      GGG: "Gly",
      UAA: "STOP",
      UAG: "STOP",
      UGA: "STOP",
    };

    const aminoAcids: string[] = [];
    for (let i = 0; i < mrna.length - 2; i += 3) {
      const codon = mrna.slice(i, i + 3);
      aminoAcids.push(codonMap[codon] || "Unknown");
    }

    setTranscribeResult({ mrna, aminoAcids });
    addXP(15, "Synthesized RNA & Protein Peptides");
  };

  // Calculate Titration pH
  const calculateTitrationPH = () => {
    // 50mL of 0.1M HCl titrated with 0.1M NaOH (equivalence at 50mL)
    const v = titrantVolume;
    if (v < 50) {
      const molesH = 0.05 * 0.1 - (v / 1000) * 0.1;
      const totalVol = 0.05 + v / 1000;
      const concH = molesH / totalVol;
      return Math.max(1, -Math.log10(concH)).toFixed(2);
    } else if (v === 50) {
      return "7.00";
    } else {
      const molesOH = ((v - 50) / 1000) * 0.1;
      const totalVol = 0.05 + v / 1000;
      const concOH = molesOH / totalVol;
      const pOH = -Math.log10(concOH);
      return Math.min(14, 14 - pOH).toFixed(2);
    }
  };

  const getTitrationColor = () => {
    const ph = parseFloat(calculateTitrationPH());
    if (indicator === "phenolphthalein") {
      if (ph < 8.2) return "bg-transparent border border-slate-700";
      if (ph >= 8.2 && ph < 10) return "bg-pink-300/60";
      return "bg-fuchsia-600/80";
    } else {
      // Methyl Orange (Red < 3.1, Orange 3.1-4.4, Yellow > 4.4)
      if (ph < 3.1) return "bg-rose-600/80";
      if (ph <= 4.4) return "bg-amber-500/80";
      return "bg-yellow-400/80";
    }
  };

  // Filtered elements
  const filteredElements = PERIODIC_TABLE_ELEMENTS.filter((el) => {
    const matchesCat = elementFilter === "all" || el.category === elementFilter;
    const matchesSearch =
      el.name.toLowerCase().includes(elementSearch.toLowerCase()) ||
      el.symbol.toLowerCase().includes(elementSearch.toLowerCase()) ||
      el.number.toString() === elementSearch;
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Main Lab Navigator */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
              <FlaskConical className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-bold text-white">STEM Virtual Science Laboratory</h1>
              <p className="text-xs text-slate-400">
                Interactive Chemistry, Physics & Biology Simulators with real-time variables
              </p>
            </div>
          </div>
        </div>

        {/* 3 Main Lab Switchers */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950 p-1 text-xs">
          {[
            { id: "chemistry", label: "🧪 Chemistry Lab" },
            { id: "physics", label: "⚡ Physics Lab" },
            { id: "biology", label: "🧬 Biology Lab" },
          ].map((lab) => (
            <button
              key={lab.id}
              onClick={() => setActiveLab(lab.id as any)}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-all ${
                activeLab === lab.id
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {lab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. CHEMISTRY LAB */}
      {/* ========================================================================= */}
      {activeLab === "chemistry" && (
        <div className="space-y-5">
          {/* Sub tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-slate-800 pb-2 text-xs">
            {[
              { id: "periodic", label: "Interactive Periodic Table" },
              { id: "reactions", label: "Virtual Reactions Simulator" },
              { id: "balancer", label: "Chemical Equation Balancer" },
              { id: "titration", label: "pH & Titration Simulator" },
              { id: "bohr", label: "Bohr & Molecular Visualizer" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setChemSubTab(tab.id as any)}
                className={`rounded-lg px-3 py-1.5 font-medium whitespace-nowrap transition-colors ${
                  chemSubTab === tab.id
                    ? "bg-indigo-600 text-white font-semibold shadow"
                    : "bg-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1.1: Interactive Periodic Table */}
          {chemSubTab === "periodic" && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Elements Grid */}
              <div className="space-y-4 lg:col-span-8">
                {/* Filters & Search */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/90 p-3">
                  <div className="relative flex-1 min-w-[180px]">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by name, symbol, or atomic #..."
                      value={elementSearch}
                      onChange={(e) => setElementSearch(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar text-xs">
                    {[
                      { id: "all", label: "All" },
                      { id: "nonmetal", label: "Non-metals" },
                      { id: "noble", label: "Noble Gases" },
                      { id: "alkali", label: "Alkali" },
                      { id: "transition", label: "Transition" },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setElementFilter(f.id)}
                        className={`rounded px-2 py-1 text-[11px] ${
                          elementFilter === f.id
                            ? "bg-sky-500 text-slate-950 font-bold"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Elements Matrix Cards */}
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
                  {filteredElements.map((el) => {
                    const isSelected = selectedElement.number === el.number;
                    const catColors: Record<string, string> = {
                      nonmetal: "border-sky-500/50 bg-sky-500/10 text-sky-300",
                      noble: "border-purple-500/50 bg-purple-500/10 text-purple-300",
                      alkali: "border-red-500/50 bg-red-500/10 text-red-300",
                      alkaline: "border-orange-500/50 bg-orange-500/10 text-orange-300",
                      metalloid: "border-emerald-500/50 bg-emerald-500/10 text-emerald-300",
                      halogen: "border-teal-500/50 bg-teal-500/10 text-teal-300",
                      transition: "border-amber-500/50 bg-amber-500/10 text-amber-300",
                      "post-transition": "border-blue-500/50 bg-blue-500/10 text-blue-300",
                    };

                    return (
                      <button
                        key={el.number}
                        onClick={() => setSelectedElement(el)}
                        className={`flex flex-col items-center justify-between rounded-xl border p-2 text-center transition-all hover:scale-105 active:scale-95 ${
                          catColors[el.category] || "border-slate-700 bg-slate-800"
                        } ${isSelected ? "ring-2 ring-white scale-105 shadow-lg" : ""}`}
                      >
                        <div className="flex w-full items-center justify-between text-[9px] text-slate-400">
                          <span>{el.number}</span>
                          <span>{el.atomicMass}</span>
                        </div>
                        <span className="my-1 font-heading text-lg font-black">{el.symbol}</span>
                        <span className="truncate w-full text-[10px] font-medium">{el.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Element Detail & Bohr Shell Visualizer */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm lg:col-span-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                        Element #{selectedElement.number} • {selectedElement.category}
                      </span>
                      <h3 className="font-heading text-2xl font-black text-white flex items-center gap-2">
                        {selectedElement.name} ({selectedElement.symbol})
                      </h3>
                    </div>

                    <button
                      onClick={() => speakText(`${selectedElement.name}, symbol ${selectedElement.symbol}. Atomic number ${selectedElement.number}. ${selectedElement.summary}`)}
                      className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-sky-400 hover:bg-slate-700"
                      title="Audio Pronunciation & Summary"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* 2D Bohr Atom Shell Graphic */}
                  <div className="my-4 flex items-center justify-center">
                    <div className="relative flex h-40 w-40 items-center justify-center">
                      {/* Nucleus */}
                      <div className="z-10 flex h-12 w-12 flex-col items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-rose-500 text-white shadow-md">
                        <span className="text-[10px] font-bold">{selectedElement.symbol}</span>
                        <span className="text-[8px]">p⁺{selectedElement.number}</span>
                      </div>

                      {/* Shell orbits */}
                      {selectedElement.shells.map((electrons, sIdx) => {
                        const size = 60 + sIdx * 28;
                        return (
                          <div
                            key={sIdx}
                            className="absolute rounded-full border border-sky-500/40 animate-spin"
                            style={{
                              width: `${size}px`,
                              height: `${size}px`,
                              animationDuration: `${(sIdx + 1) * 8}s`,
                            }}
                          >
                            <div className="absolute -top-1 left-1/2 -ml-1 h-2 w-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Element Data Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg border border-slate-800 bg-slate-950 p-2">
                      <span className="text-[10px] text-slate-400">Electron Config:</span>
                      <p className="font-mono font-bold text-sky-300">{selectedElement.electronConfig}</p>
                    </div>
                    <div className="rounded-lg border border-slate-800 bg-slate-950 p-2">
                      <span className="text-[10px] text-slate-400">Electronegativity:</span>
                      <p className="font-mono font-bold text-emerald-300">
                        {selectedElement.electronegativity || "Inert"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-800 bg-slate-950 p-2">
                      <span className="text-[10px] text-slate-400">Density:</span>
                      <p className="font-mono font-bold text-amber-300">{selectedElement.density || "N/A"}</p>
                    </div>
                    <div className="rounded-lg border border-slate-800 bg-slate-950 p-2">
                      <span className="text-[10px] text-slate-400">Shells:</span>
                      <p className="font-mono font-bold text-purple-300">
                        [{selectedElement.shells.join(", ")}]
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    {selectedElement.summary}
                  </p>
                </div>

                <button
                  onClick={() => addXP(10, `Explored Element ${selectedElement.name}`)}
                  className="mt-4 flex w-full items-center justify-center gap-1 rounded-xl bg-indigo-600 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Mark as Studied (+10 XP)</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 1.2: Virtual Reaction Simulator */}
          {chemSubTab === "reactions" && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Left: Reaction Catalog */}
              <div className="space-y-3 lg:col-span-5">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Select Reaction Experiment
                </h3>
                {PRESET_CHEMICAL_REACTIONS.map((rxn) => (
                  <div
                    key={rxn.id}
                    onClick={() => {
                      setSelectedReaction(rxn);
                      setReactionProgress(0);
                    }}
                    className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                      selectedReaction.id === rxn.id
                        ? "border-cyan-500 bg-cyan-950/30 shadow-md"
                        : "border-slate-800 bg-slate-900/90 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-heading text-sm font-bold text-white">{rxn.name}</span>
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-cyan-300">
                        {rxn.type}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-mono text-slate-400">{rxn.equation}</p>
                  </div>
                ))}
              </div>

              {/* Right: Virtual Flask & Heat Simulator */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm lg:col-span-7 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="font-heading text-base font-bold text-white flex items-center gap-2">
                      <FlaskConical className="h-5 w-5 text-cyan-400" />
                      <span>{selectedReaction.name}</span>
                    </h3>
                    <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-semibold text-amber-300">
                      {selectedReaction.temperatureChange}
                    </span>
                  </div>

                  {/* Reaction Flask Animation Graphic */}
                  <div className="my-6 flex flex-col items-center justify-center">
                    <div className="relative flex h-52 w-40 flex-col items-center justify-end overflow-hidden rounded-b-3xl border-4 border-slate-600 bg-slate-950/80 p-2 shadow-inner">
                      {/* Fluid in Flask */}
                      <div
                        style={{
                          height: `${40 + reactionProgress * 0.4}%`,
                          backgroundColor: selectedReaction.color,
                        }}
                        className="w-full rounded-b-2xl transition-all duration-300 opacity-80 relative flex items-center justify-center"
                      >
                        {isReacting && (
                          <div className="flex gap-1">
                            <div className="h-2 w-2 rounded-full bg-white animate-ping" />
                            <div className="h-2.5 w-2.5 rounded-full bg-white animate-bounce" />
                            <div className="h-2 w-2 rounded-full bg-white animate-ping" />
                          </div>
                        )}
                      </div>

                      {/* Gas evolution vapors if active */}
                      {isReacting && (
                        <div className="absolute top-4 inset-x-0 flex justify-center gap-2 animate-pulse">
                          <div className="h-4 w-4 rounded-full bg-white/20 blur-sm" />
                          <div className="h-6 w-6 rounded-full bg-white/30 blur-sm" />
                        </div>
                      )}
                    </div>

                    <p className="mt-3 font-mono text-xs text-sky-400">
                      Progress: {reactionProgress}% {isReacting ? "(Reacting...)" : "(Ready)"}
                    </p>
                  </div>

                  {/* Balanced Equation & Observations */}
                  <div className="space-y-2 text-xs">
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                      <span className="font-semibold text-slate-400">Balanced Equation:</span>
                      <p className="font-mono text-sm font-bold text-emerald-400 mt-0.5">
                        {selectedReaction.equation}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                      <span className="font-semibold text-slate-400">Live Observation:</span>
                      <p className="text-slate-200 mt-0.5 leading-relaxed">{selectedReaction.observations}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={triggerReaction}
                    disabled={isReacting}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-600 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-cyan-600/30 hover:bg-cyan-500 active:scale-95 disabled:opacity-50"
                  >
                    <Play className="h-4 w-4 fill-white" />
                    <span>{isReacting ? "Experiment in Progress..." : "Mix Reactants & Run"}</span>
                  </button>

                  <button
                    onClick={() => setReactionProgress(0)}
                    className="rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-slate-300 hover:bg-slate-700"
                    title="Reset Flask"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 1.3: Chemical Equation Balancer */}
          {chemSubTab === "balancer" && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm space-y-4">
              <div>
                <h3 className="font-heading text-base font-bold text-white">Chemical Equation Balancer & Stoichiometry</h3>
                <p className="text-xs text-slate-400">
                  Enter any unbalanced reaction to calculate balanced coefficients and atom count verifications
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={unbalancedEq}
                  onChange={(e) => setUnbalancedEq(e.target.value)}
                  placeholder="e.g. Al + Fe2O3 -> Al2O3 + Fe"
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 font-mono text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
                <button
                  onClick={balanceEquation}
                  disabled={balancingLoading}
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {balancingLoading ? "Balancing..." : "Balance Reaction"}
                </button>
              </div>

              {balancedResult && (
                <div className="rounded-xl border border-emerald-500/30 bg-slate-950 p-4 text-xs sm:text-sm text-slate-200 leading-relaxed font-mono whitespace-pre-wrap">
                  {balancedResult}
                </div>
              )}
            </div>
          )}

          {/* Tab 1.4: Titration Simulator */}
          {chemSubTab === "titration" && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-5">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm space-y-3">
                  <h3 className="font-heading text-sm font-bold text-white">Titration Controls</h3>
                  <p className="text-xs text-slate-400">
                    Titrating 50 mL of 0.1 M HCl with 0.1 M NaOH burette solution
                  </p>

                  <div>
                    <label className="text-xs font-semibold text-slate-300">
                      Burette Volume Added: <span className="text-cyan-400 font-mono">{titrantVolume} mL</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={titrantVolume}
                      onChange={(e) => setTitrantVolume(Number(e.target.value))}
                      className="w-full accent-cyan-500 cursor-pointer mt-1"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>0 mL (Acidic)</span>
                      <span>50 mL (Equivalence pH 7)</span>
                      <span>100 mL (Basic)</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300">Indicator:</label>
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => setIndicator("phenolphthalein")}
                        className={`flex-1 rounded-lg py-1.5 text-xs font-medium ${
                          indicator === "phenolphthalein"
                            ? "bg-fuchsia-600 text-white font-bold"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        Phenolphthalein
                      </button>
                      <button
                        onClick={() => setIndicator("methyl_orange")}
                        className={`flex-1 rounded-lg py-1.5 text-xs font-medium ${
                          indicator === "methyl_orange"
                            ? "bg-amber-600 text-white font-bold"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        Methyl Orange
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Titration Flask & pH display */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm lg:col-span-7 flex flex-col items-center justify-between">
                <div className="w-full flex justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[11px] text-slate-400">Current Solution pH:</span>
                    <h4 className="font-heading text-2xl font-black text-cyan-400 font-mono">
                      pH {calculateTitrationPH()}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400">Solution State:</span>
                    <p className="font-bold text-xs text-white">
                      {parseFloat(calculateTitrationPH()) < 7
                        ? "Acidic Solution (Excess H⁺)"
                        : parseFloat(calculateTitrationPH()) === 7
                        ? "Neutral Equivalence Point 🎯"
                        : "Alkaline / Basic (Excess OH⁻)"}
                    </p>
                  </div>
                </div>

                <div className="my-6 flex flex-col items-center">
                  {/* Burette Graphic */}
                  <div className="h-20 w-3 rounded-t border-2 border-slate-600 bg-cyan-500/20 relative">
                    <div className="absolute -bottom-2 left-1/2 -ml-1 h-3 w-2 bg-cyan-400 rounded-full animate-bounce" />
                  </div>

                  {/* Conical Flask */}
                  <div className="relative mt-2 flex h-36 w-32 flex-col items-center justify-end rounded-b-3xl border-4 border-slate-600 bg-slate-950 p-2">
                    <div
                      className={`w-full h-16 rounded-b-2xl transition-colors duration-300 ${getTitrationColor()}`}
                    />
                  </div>
                </div>

                <p className="text-center text-xs text-slate-400 max-w-md">
                  Observe the rapid color shift around <strong>50 mL</strong> where the hydrogen ions are completely neutralized by hydroxide ions!
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PHYSICS LAB */}
      {/* ========================================================================= */}
      {activeLab === "physics" && (
        <div className="space-y-5">
          {/* Sub tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-slate-800 pb-2 text-xs">
            {[
              { id: "projectile", label: "Motion & Projectile Simulator" },
              { id: "circuit", label: "Electricity & Circuit Builder" },
              { id: "optics", label: "Optics, Mirror & Lens Simulator" },
              { id: "waves", label: "Wave & Sound Simulator" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPhysicsSubTab(tab.id as any)}
                className={`rounded-lg px-3 py-1.5 font-medium whitespace-nowrap transition-colors ${
                  physicsSubTab === tab.id
                    ? "bg-amber-600 text-white font-semibold shadow"
                    : "bg-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 2.1: Projectile Motion */}
          {physicsSubTab === "projectile" && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Controls */}
              <div className="space-y-4 lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
                <h3 className="font-heading text-sm font-bold text-white">Kinematics Parameters</h3>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 font-semibold">
                    <span>Launch Angle:</span>
                    <span className="font-mono text-sky-400">{projAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="85"
                    value={projAngle}
                    onChange={(e) => setProjAngle(Number(e.target.value))}
                    className="w-full accent-sky-500 cursor-pointer mt-1"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 font-semibold">
                    <span>Initial Velocity (v₀):</span>
                    <span className="font-mono text-emerald-400">{projSpeed} m/s</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={projSpeed}
                    onChange={(e) => setProjSpeed(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer mt-1"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 font-semibold">
                    <span>Gravity (g):</span>
                    <span className="font-mono text-rose-400">{projGravity} m/s²</span>
                  </div>
                  <div className="flex gap-1.5 mt-1">
                    {[
                      { label: "Earth (9.8)", val: 9.8 },
                      { label: "Moon (1.6)", val: 1.6 },
                      { label: "Jupiter (24.8)", val: 24.8 },
                    ].map((g) => (
                      <button
                        key={g.label}
                        onClick={() => setProjGravity(g.val)}
                        className={`flex-1 rounded py-1 text-[10px] font-semibold ${
                          projGravity === g.val ? "bg-rose-600 text-white" : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Max Height (H):</span>
                    <span className="font-mono font-bold text-white">
                      {(((projSpeed * Math.sin((projAngle * Math.PI) / 180)) ** 2) / (2 * projGravity)).toFixed(2)} m
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Range (R):</span>
                    <span className="font-mono font-bold text-white">
                      {(((projSpeed ** 2) * Math.sin((2 * projAngle * Math.PI) / 180)) / projGravity).toFixed(2)} m
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Time of Flight (T):</span>
                    <span className="font-mono font-bold text-white">
                      {((2 * projSpeed * Math.sin((projAngle * Math.PI) / 180)) / projGravity).toFixed(2)} s
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setProjT(0);
                    setProjAnimating(true);
                    addXP(20, "Ran Projectile Simulation");
                  }}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-sky-600 py-2.5 text-xs font-bold text-white hover:bg-sky-500 shadow-md"
                >
                  <Play className="h-4 w-4 fill-white" />
                  <span>Launch Projectile</span>
                </button>
              </div>

              {/* Trajectory Canvas */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 shadow-sm lg:col-span-8 flex flex-col items-center justify-center">
                <canvas
                  ref={projCanvasRef}
                  width={500}
                  height={220}
                  className="w-full max-w-[500px] h-auto border border-slate-800 rounded-xl bg-slate-900"
                />
                <div className="mt-3 flex items-center justify-between w-full text-[11px] text-slate-400 px-2">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-sky-400" /> Ball Position
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-rose-500" /> Velocity Vector (v)
                  </span>
                  <span>Formula: y = x·tan(θ) - (g·x²)/(2v₀²cos²θ)</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2.2: Circuit Builder */}
          {physicsSubTab === "circuit" && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
                <h3 className="font-heading text-sm font-bold text-white">Circuit Parameters</h3>

                <div>
                  <label className="text-xs font-semibold text-slate-300">
                    Configuration:
                  </label>
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => setCircuitSeries(true)}
                      className={`flex-1 rounded-lg py-1.5 text-xs font-bold ${
                        circuitSeries ? "bg-amber-600 text-white" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      Series Circuit
                    </button>
                    <button
                      onClick={() => setCircuitSeries(false)}
                      className={`flex-1 rounded-lg py-1.5 text-xs font-bold ${
                        !circuitSeries ? "bg-amber-600 text-white" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      Parallel Circuit
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Battery Voltage (V):</span>
                    <span className="font-mono text-amber-400">{circuitVoltage} V</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="24"
                    value={circuitVoltage}
                    onChange={(e) => setCircuitVoltage(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer mt-1"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Resistor 1 (R₁):</span>
                    <span className="font-mono text-sky-400">{resistor1} Ω</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={resistor1}
                    onChange={(e) => setResistor1(Number(e.target.value))}
                    className="w-full accent-sky-500 cursor-pointer mt-1"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Resistor 2 (R₂):</span>
                    <span className="font-mono text-purple-400">{resistor2} Ω</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={resistor2}
                    onChange={(e) => setResistor2(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer mt-1"
                  />
                </div>

                <button
                  onClick={() => setCircuitSwitch(!circuitSwitch)}
                  className={`w-full rounded-xl py-2 text-xs font-bold transition-all ${
                    circuitSwitch
                      ? "bg-emerald-600 text-white shadow-emerald-500/20"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}
                >
                  Switch: {circuitSwitch ? "CLOSED (Current Flowing)" : "OPEN (Circuit Broken)"}
                </button>
              </div>

              {/* Circuit Live Visualizer */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm lg:col-span-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h4 className="font-heading text-sm font-bold text-white">Live Ohm's Law & Power Readings</h4>
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      V = I · R
                    </span>
                  </div>

                  {/* Calculations */}
                  {(() => {
                    const req = circuitSeries
                      ? resistor1 + resistor2
                      : (resistor1 * resistor2) / (resistor1 + resistor2);
                    const current = circuitSwitch ? circuitVoltage / req : 0;
                    const power = circuitSwitch ? circuitVoltage * current : 0;

                    return (
                      <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                          <span className="text-slate-400">Equivalent Resistance:</span>
                          <p className="font-mono text-lg font-bold text-sky-400 mt-1">{req.toFixed(2)} Ω</p>
                        </div>
                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                          <span className="text-slate-400">Total Current (I):</span>
                          <p className="font-mono text-lg font-bold text-emerald-400 mt-1">{current.toFixed(2)} A</p>
                        </div>
                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                          <span className="text-slate-400">Total Power (P):</span>
                          <p className="font-mono text-lg font-bold text-amber-400 mt-1">{power.toFixed(2)} W</p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Visual Light Bulbs Glow */}
                  <div className="my-8 flex items-center justify-center gap-12">
                    <div className="flex flex-col items-center">
                      <div
                        style={{
                          boxShadow: circuitSwitch ? `0 0 ${circuitVoltage * 2}px #facc15` : "none",
                          backgroundColor: circuitSwitch ? "#facc15" : "#334155",
                        }}
                        className="h-16 w-16 rounded-full transition-all duration-300 flex items-center justify-center text-slate-950 font-bold text-xs"
                      >
                        💡 Bulb 1
                      </div>
                      <span className="text-xs text-slate-400 mt-2">R₁ = {resistor1} Ω</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div
                        style={{
                          boxShadow: circuitSwitch ? `0 0 ${circuitVoltage * 2}px #facc15` : "none",
                          backgroundColor: circuitSwitch ? "#facc15" : "#334155",
                        }}
                        className="h-16 w-16 rounded-full transition-all duration-300 flex items-center justify-center text-slate-950 font-bold text-xs"
                      >
                        💡 Bulb 2
                      </div>
                      <span className="text-xs text-slate-400 mt-2">R₂ = {resistor2} Ω</span>
                    </div>
                  </div>
                </div>

                <p className="text-center text-xs text-slate-400 border-t border-slate-800 pt-3">
                  In {circuitSeries ? "Series" : "Parallel"}, current is{" "}
                  {circuitSeries ? "identical through all loads" : "split inversely according to each branch resistance"}.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. BIOLOGY LAB */}
      {/* ========================================================================= */}
      {activeLab === "biology" && (
        <div className="space-y-5">
          {/* Sub tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-slate-800 pb-2 text-xs">
            {[
              { id: "microscope", label: "Virtual Microscope & Cell Explorer" },
              { id: "dna", label: "DNA Transcription & Genetics" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setBioSubTab(tab.id as any)}
                className={`rounded-lg px-3 py-1.5 font-medium whitespace-nowrap transition-colors ${
                  bioSubTab === tab.id
                    ? "bg-emerald-600 text-white font-semibold shadow"
                    : "bg-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 3.1: Virtual Microscope */}
          {bioSubTab === "microscope" && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
                <h3 className="font-heading text-sm font-bold text-white">Microscope Controls</h3>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Specimen Slide:</label>
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => setCellType("plant")}
                      className={`flex-1 rounded-lg py-1.5 text-xs font-bold ${
                        cellType === "plant" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      🌱 Plant Cell (Onion Peel)
                    </button>
                    <button
                      onClick={() => setCellType("animal")}
                      className={`flex-1 rounded-lg py-1.5 text-xs font-bold ${
                        cellType === "animal" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      🧫 Animal Cell (Cheek Cell)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Objective Magnification:</label>
                  <div className="grid grid-cols-4 gap-1 mt-1">
                    {[40, 100, 400, 1000].map((mag) => (
                      <button
                        key={mag}
                        onClick={() => setMagnification(mag)}
                        className={`rounded py-1 text-xs font-bold ${
                          magnification === mag ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {mag}x
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Fine Focus Knob:</span>
                    <span className="font-mono text-emerald-400">{focusLevel}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={focusLevel}
                    onChange={(e) => setFocusLevel(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer mt-1"
                  />
                  <span className="text-[10px] text-slate-500">Adjust slider to 50% for razor-sharp clarity!</span>
                </div>

                {/* Organelle Inspector buttons */}
                <div className="border-t border-slate-800 pt-3">
                  <span className="text-xs font-semibold text-slate-300">Click Organelle to Inspect:</span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {["Nucleus", "Mitochondria", "Chloroplast", "Cell Wall", "Ribosome", "Vacuole"].map((org) => (
                      <button
                        key={org}
                        onClick={() => setSelectedOrganelle(org)}
                        className={`rounded-md px-2 py-1 text-xs font-medium ${
                          selectedOrganelle === org ? "bg-emerald-500 text-slate-950 font-bold" : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {org}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Microscope Viewport & Organelle Details */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm lg:col-span-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h4 className="font-heading text-sm font-bold text-white">
                      Microscopic Field of View ({magnification}x)
                    </h4>
                    <span className="text-xs font-semibold text-emerald-400">
                      {Math.abs(focusLevel - 50) < 5 ? "✅ Perfect Focus" : "⚠️ Out of Focus (Turn Knob)"}
                    </span>
                  </div>

                  {/* Circular Microscope Ocular Lens Graphic */}
                  <div className="my-4 flex items-center justify-center">
                    <div
                      style={{
                        filter: `blur(${Math.abs(focusLevel - 50) * 0.15}px)`,
                      }}
                      className="relative flex h-52 w-52 items-center justify-center rounded-full border-8 border-slate-800 bg-slate-950 overflow-hidden shadow-2xl transition-all"
                    >
                      {/* Cell Visual representation */}
                      <div className="relative h-44 w-44 rounded-3xl border-2 border-emerald-500/60 bg-emerald-950/20 p-2">
                        {/* Nucleus */}
                        <div className="absolute top-1/3 left-1/3 h-10 w-10 rounded-full bg-purple-600/80 border border-purple-400 flex items-center justify-center text-[8px] font-bold text-white shadow">
                          N
                        </div>

                        {/* Mitochondria */}
                        <div className="absolute top-4 right-4 h-6 w-9 rounded-full bg-amber-600/80 border border-amber-400 flex items-center justify-center text-[7px] font-bold text-white">
                          ATP
                        </div>

                        {/* Chloroplast (if plant) */}
                        {cellType === "plant" && (
                          <div className="absolute bottom-4 left-4 h-6 w-9 rounded-full bg-emerald-600/90 border border-emerald-400 flex items-center justify-center text-[7px] font-bold text-white">
                            Chl
                          </div>
                        )}

                        {/* Vacuole */}
                        <div className="absolute bottom-4 right-4 h-12 w-12 rounded-2xl bg-sky-600/40 border border-sky-400 flex items-center justify-center text-[8px] font-bold text-sky-200">
                          Vacuole
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Selected Organelle Card */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-xs">
                    <h5 className="font-bold text-emerald-300 text-sm">{selectedOrganelle}</h5>
                    <p className="text-slate-300 mt-1 leading-relaxed">
                      {selectedOrganelle === "Nucleus" &&
                        "The control center of the eukaryotic cell containing chromatin DNA and the nucleolus."}
                      {selectedOrganelle === "Mitochondria" &&
                        "The powerhouse of the cell generating ATP energy through aerobic cellular respiration and Krebs cycle."}
                      {selectedOrganelle === "Chloroplast" &&
                        "Present in plant cells; contains green chlorophyll pigment to conduct light-dependent photosynthesis."}
                      {selectedOrganelle === "Cell Wall" &&
                        "Rigid outer cellulose layer in plants providing structural rigidity and turgor pressure support."}
                      {selectedOrganelle === "Ribosome" &&
                        "Cellular protein factories translating mRNA codons into polypeptide chains."}
                      {selectedOrganelle === "Vacuole" &&
                        "Large central membrane-bound organelle storing water, nutrients, and maintaining osmotic turgidity."}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => addXP(15, `Mastered ${selectedOrganelle} Structure`)}
                  className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl bg-emerald-600 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Mark Organelle as Mastered (+15 XP)</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 3.2: DNA Transcriber */}
          {bioSubTab === "dna" && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm space-y-4">
              <div>
                <h3 className="font-heading text-base font-bold text-white">
                  DNA ➔ mRNA Transcription & Protein Translation
                </h3>
                <p className="text-xs text-slate-400">
                  Enter any DNA template sequence (A, T, G, C) to transcribe mRNA and decode the polypeptide amino acid chain
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={dnaInput}
                  onChange={(e) => setDnaInput(e.target.value.toUpperCase())}
                  placeholder="e.g. ATGCGATACTAG"
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 font-mono text-sm tracking-widest text-emerald-400 uppercase focus:outline-none"
                />
                <button
                  onClick={handleTranscribeDNA}
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-emerald-500"
                >
                  Transcribe & Translate
                </button>
              </div>

              {/* Translation Visualization Grid */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <span className="text-xs font-semibold text-slate-400">Transcribed mRNA Codons:</span>
                  <p className="font-mono text-base font-bold text-sky-400 mt-1 tracking-widest">
                    {transcribeResult.mrna || "N/A"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <span className="text-xs font-semibold text-slate-400">Synthesized Peptide Chain:</span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {transcribeResult.aminoAcids.map((aa, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-purple-500/20 border border-purple-500/40 px-2 py-0.5 text-xs font-mono font-bold text-purple-300"
                      >
                        {aa}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
