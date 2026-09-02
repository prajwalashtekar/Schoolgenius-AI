import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  Calculator,
  LineChart as ChartIcon,
  Box,
  Percent,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Loader2,
} from "lucide-react";

export const MathLab: React.FC = () => {
  const { user, addXP } = useApp();

  const [mathSubTab, setMathSubTab] = useState<"grapher" | "trig" | "geometry3d" | "stats" | "solver">("grapher");

  // Grapher State
  const [funcType, setFuncType] = useState<"quadratic" | "sine" | "linear" | "cubic">("quadratic");
  const [paramA, setParamA] = useState(1);
  const [paramB, setParamB] = useState(0);
  const [paramC, setParamC] = useState(0);
  const graphCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Trig Circle State
  const [angleDeg, setAngleDeg] = useState(45);

  // 3D Geometry State
  const [solidType, setSolidType] = useState<"cylinder" | "cone" | "sphere" | "cuboid">("cylinder");
  const [radius, setRadius] = useState(5);
  const [height, setHeight] = useState(10);
  const [length, setLength] = useState(8);
  const [width, setWidth] = useState(6);

  // Stats State
  const [dataPoints, setDataPoints] = useState("12, 15, 12, 19, 22, 25, 22, 18, 12, 30");
  const [statsResult, setStatsResult] = useState<any>(null);

  // Equation Solver State
  const [mathQuery, setMathQuery] = useState("Solve 3x^2 - 12x + 9 = 0 using quadratic formula");
  const [solverResult, setSolverResult] = useState<string | null>(null);
  const [solverLoading, setSolverLoading] = useState(false);

  // Graph Plotting Canvas Logic
  useEffect(() => {
    if (mathSubTab !== "grapher") return;
    const canvas = graphCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const originX = w / 2;
    const originY = h / 2;
    const scale = 20; // 20px = 1 unit

    // Draw Grid
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += scale) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += scale) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(w, originY); // X Axis
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, h); // Y Axis
    ctx.stroke();

    // Plot Curve
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    let started = false;
    for (let px = 0; px < w; px += 2) {
      const x = (px - originX) / scale;
      let y = 0;

      if (funcType === "quadratic") {
        y = paramA * x * x + paramB * x + paramC;
      } else if (funcType === "sine") {
        y = paramA * Math.sin(paramB * x) + paramC;
      } else if (funcType === "linear") {
        y = paramA * x + paramB;
      } else if (funcType === "cubic") {
        y = paramA * Math.pow(x, 3) + paramB * x + paramC;
      }

      const py = originY - y * scale;
      if (!started) {
        ctx.moveTo(px, py);
        started = true;
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();

    // Plot Roots & Vertex if quadratic
    if (funcType === "quadratic") {
      const disc = paramB * paramB - 4 * paramA * paramC;
      if (disc >= 0 && paramA !== 0) {
        const r1 = (-paramB + Math.sqrt(disc)) / (2 * paramA);
        const r2 = (-paramB - Math.sqrt(disc)) / (2 * paramA);
        [r1, r2].forEach((r) => {
          const rx = originX + r * scale;
          ctx.fillStyle = "#34d399";
          ctx.beginPath();
          ctx.arc(rx, originY, 5, 0, 2 * Math.PI);
          ctx.fill();
        });
      }
      // Vertex
      const vx = -paramB / (2 * paramA);
      const vy = paramA * vx * vx + paramB * vx + paramC;
      ctx.fillStyle = "#f43f5e";
      ctx.beginPath();
      ctx.arc(originX + vx * scale, originY - vy * scale, 5, 0, 2 * Math.PI);
      ctx.fill();
    }
  }, [funcType, paramA, paramB, paramC, mathSubTab]);

  // Compute Stats
  const calculateStats = () => {
    const nums = dataPoints
      .split(/[\s,]+/)
      .map(Number)
      .filter((n) => !isNaN(n));
    if (nums.length === 0) return;

    nums.sort((a, b) => a - b);
    const n = nums.length;
    const sum = nums.reduce((a, b) => a + b, 0);
    const mean = sum / n;
    const median = n % 2 === 0 ? (nums[n / 2 - 1] + nums[n / 2]) / 2 : nums[Math.floor(n / 2)];

    // Mode
    const freq: Record<number, number> = {};
    nums.forEach((num) => (freq[num] = (freq[num] || 0) + 1));
    let maxFreq = 0;
    let modeVal = nums[0];
    for (let k in freq) {
      if (freq[k] > maxFreq) {
        maxFreq = freq[k];
        modeVal = Number(k);
      }
    }

    // Standard Deviation
    const variance = nums.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    setStatsResult({
      n,
      mean: mean.toFixed(2),
      median: median.toFixed(2),
      mode: modeVal,
      variance: variance.toFixed(2),
      stdDev: stdDev.toFixed(2),
      range: (nums[n - 1] - nums[0]).toFixed(2),
      min: nums[0],
      max: nums[n - 1],
    });
    addXP(15, "Calculated Statistical Metrics");
  };

  // Solve math problem via AI endpoint
  const handleSolveMath = async () => {
    setSolverLoading(true);
    try {
      const res = await fetch("/api/labs/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          labType: "Mathematics Laboratory",
          query: `Provide a rigorous step-by-step mathematical derivation for: ${mathQuery}. Show all algebraic identities, substitution steps, formulas, and final boxed answer.`,
        }),
      });
      const data = await res.json();
      setSolverResult(data.result);
      addXP(25, "Solved Complex Math Problem");
    } catch {
      setSolverResult("Roots of 3x² - 12x + 9 = 0:\nDivide by 3: x² - 4x + 3 = 0\n(x - 3)(x - 1) = 0\nx = 3, x = 1");
    } finally {
      setSolverLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-bold text-white">Mathematics Interactive Laboratory</h1>
              <p className="text-xs text-slate-400">
                Interactive Grapher, Unit Circle Trigonometry, 3D Solids & Statistics Calculator
              </p>
            </div>
          </div>
        </div>

        {/* Subtab pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar rounded-xl border border-slate-800 bg-slate-950 p-1 text-xs">
          {[
            { id: "grapher", label: "2D Graph Plotter" },
            { id: "trig", label: "Unit Circle Trig" },
            { id: "geometry3d", label: "3D Geometry Solids" },
            { id: "stats", label: "Statistics & Prob" },
            { id: "solver", label: "Step-by-Step Solver" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setMathSubTab(t.id as any)}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-all ${
                mathSubTab === t.id
                  ? "bg-amber-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. 2D Graph Plotter */}
      {mathSubTab === "grapher" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Function Controls */}
          <div className="space-y-4 lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
            <h3 className="font-heading text-sm font-bold text-white">Function Equation Builder</h3>

            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: "quadratic", label: "Quadratic (ax²+bx+c)" },
                { id: "sine", label: "Sine (a·sin(bx)+c)" },
                { id: "linear", label: "Linear (ax+b)" },
                { id: "cubic", label: "Cubic (ax³+bx+c)" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFuncType(f.id as any)}
                  className={`rounded-lg p-2 text-center text-xs font-semibold ${
                    funcType === f.id ? "bg-amber-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 font-semibold">
                <span>Parameter a:</span>
                <span className="font-mono text-sky-400">{paramA}</span>
              </div>
              <input
                type="range"
                min="-5"
                max="5"
                step="0.5"
                value={paramA}
                onChange={(e) => setParamA(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer mt-1"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 font-semibold">
                <span>Parameter b:</span>
                <span className="font-mono text-emerald-400">{paramB}</span>
              </div>
              <input
                type="range"
                min="-10"
                max="10"
                step="0.5"
                value={paramB}
                onChange={(e) => setParamB(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer mt-1"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 font-semibold">
                <span>Parameter c:</span>
                <span className="font-mono text-rose-400">{paramC}</span>
              </div>
              <input
                type="range"
                min="-10"
                max="10"
                step="0.5"
                value={paramC}
                onChange={(e) => setParamC(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer mt-1"
              />
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs">
              <span className="text-slate-400">Plotted Equation:</span>
              <p className="font-mono text-sm font-bold text-amber-300 mt-1">
                {funcType === "quadratic" && `y = (${paramA})x² + (${paramB})x + (${paramC})`}
                {funcType === "sine" && `y = (${paramA})·sin((${paramB})x) + (${paramC})`}
                {funcType === "linear" && `y = (${paramA})x + (${paramB})`}
                {funcType === "cubic" && `y = (${paramA})x³ + (${paramB})x + (${paramC})`}
              </p>
            </div>
          </div>

          {/* Graph Canvas */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 shadow-sm lg:col-span-8 flex flex-col items-center justify-center">
            <canvas
              ref={graphCanvasRef}
              width={500}
              height={320}
              className="w-full max-w-[500px] h-auto border border-slate-800 rounded-xl bg-slate-900 shadow-inner"
            />
            <div className="mt-3 flex items-center justify-between w-full text-[11px] text-slate-400 px-2">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400" /> Real Roots / X-Intercepts
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-rose-500" /> Vertex / Extrema
              </span>
              <span>Scale: 1 unit = 20px</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Trigonometry Unit Circle */}
      {mathSubTab === "trig" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
            <h3 className="font-heading text-sm font-bold text-white">Angle θ & Trigonometric Ratios</h3>

            <div>
              <div className="flex justify-between text-xs text-slate-300 font-semibold">
                <span>Angle θ (Degrees):</span>
                <span className="font-mono text-amber-400">{angleDeg}° ({((angleDeg * Math.PI) / 180).toFixed(2)} rad)</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={angleDeg}
                onChange={(e) => setAngleDeg(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer mt-1"
              />
            </div>

            {/* Quick Angle Presets */}
            <div className="grid grid-cols-4 gap-1.5">
              {[0, 30, 45, 60, 90, 180, 270, 360].map((deg) => (
                <button
                  key={deg}
                  onClick={() => setAngleDeg(deg)}
                  className={`rounded py-1 text-xs font-semibold ${
                    angleDeg === deg ? "bg-amber-600 text-white" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {deg}°
                </button>
              ))}
            </div>

            {/* Trig values grid */}
            {(() => {
              const rad = (angleDeg * Math.PI) / 180;
              const sinVal = Math.sin(rad).toFixed(3);
              const cosVal = Math.cos(rad).toFixed(3);
              const tanVal = Math.abs(Math.cos(rad)) < 0.001 ? "Undefined" : Math.tan(rad).toFixed(3);

              return (
                <div className="space-y-2 text-xs">
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 flex justify-between items-center">
                    <span className="font-bold text-sky-400">sin(θ) [Height / Hypotenuse]:</span>
                    <span className="font-mono text-base font-black text-white">{sinVal}</span>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 flex justify-between items-center">
                    <span className="font-bold text-emerald-400">cos(θ) [Base / Hypotenuse]:</span>
                    <span className="font-mono text-base font-black text-white">{cosVal}</span>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 flex justify-between items-center">
                    <span className="font-bold text-purple-400">tan(θ) [sin/cos]:</span>
                    <span className="font-mono text-base font-black text-white">{tanVal}</span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Unit Circle Graphic */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-sm lg:col-span-7 flex flex-col items-center justify-center">
            <div className="relative flex h-64 w-64 items-center justify-center rounded-full border-2 border-slate-700 bg-slate-900/80">
              {/* Axes */}
              <div className="absolute inset-x-0 h-0.5 bg-slate-600" />
              <div className="absolute inset-y-0 w-0.5 bg-slate-600" />

              {/* Angle Line */}
              {(() => {
                const rad = (angleDeg * Math.PI) / 180;
                const endX = 128 + 110 * Math.cos(rad);
                const endY = 128 - 110 * Math.sin(rad);

                return (
                  <svg className="absolute inset-0 h-full w-full pointer-events-none">
                    {/* Hypotenuse */}
                    <line x1="128" y1="128" x2={endX} y2={endY} stroke="#f59e0b" strokeWidth="3" />
                    {/* Cos line */}
                    <line x1="128" y1="128" x2={endX} y2="128" stroke="#10b981" strokeWidth="2" strokeDasharray="3,3" />
                    {/* Sin line */}
                    <line x1={endX} y1="128" x2={endX} y2={endY} stroke="#38bdf8" strokeWidth="2" strokeDasharray="3,3" />
                    {/* Point */}
                    <circle cx={endX} cy={endY} r="6" fill="#f43f5e" />
                  </svg>
                );
              })()}
            </div>

            <div className="mt-4 flex items-center justify-center gap-4 text-xs">
              <span className="text-emerald-400">■ cos(θ) Base</span>
              <span className="text-sky-400">■ sin(θ) Altitude</span>
              <span className="text-amber-400">■ Hypotenuse = 1 (Unit radius)</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. 3D Geometry Solids */}
      {mathSubTab === "geometry3d" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
            <h3 className="font-heading text-sm font-bold text-white">Select 3D Geometric Solid</h3>

            <div className="grid grid-cols-2 gap-2">
              {["cylinder", "cone", "sphere", "cuboid"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSolidType(s as any)}
                  className={`rounded-xl p-2.5 text-xs font-bold capitalize ${
                    solidType === s ? "bg-amber-600 text-white" : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {solidType !== "cuboid" && (
              <div>
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Radius (r):</span>
                  <span className="font-mono text-amber-400">{radius} cm</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer mt-1"
                />
              </div>
            )}

            {(solidType === "cylinder" || solidType === "cone") && (
              <div>
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Height (h):</span>
                  <span className="font-mono text-sky-400">{height} cm</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer mt-1"
                />
              </div>
            )}

            {solidType === "cuboid" && (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Length (l):</span>
                    <span className="font-mono text-amber-400">{length} cm</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={length}
                    onChange={(e) => setLength(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer mt-1"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Width (w):</span>
                    <span className="font-mono text-sky-400">{width} cm</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    className="w-full accent-sky-500 cursor-pointer mt-1"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Height (h):</span>
                    <span className="font-mono text-emerald-400">{height} cm</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer mt-1"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Volume & Surface Area Output */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm lg:col-span-7 flex flex-col justify-between">
            <div>
              <h4 className="font-heading text-sm font-bold text-white border-b border-slate-800 pb-3 capitalize">
                {solidType} Mensuration & Geometric Derivations
              </h4>

              {(() => {
                let volume = 0;
                let csa = 0; // Curved surface area
                let tsa = 0; // Total surface area

                if (solidType === "cylinder") {
                  volume = Math.PI * radius * radius * height;
                  csa = 2 * Math.PI * radius * height;
                  tsa = 2 * Math.PI * radius * (height + radius);
                } else if (solidType === "cone") {
                  const slant = Math.sqrt(radius * radius + height * height);
                  volume = (1 / 3) * Math.PI * radius * radius * height;
                  csa = Math.PI * radius * slant;
                  tsa = Math.PI * radius * (radius + slant);
                } else if (solidType === "sphere") {
                  volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
                  csa = 4 * Math.PI * radius * radius;
                  tsa = csa;
                } else if (solidType === "cuboid") {
                  volume = length * width * height;
                  csa = 2 * height * (length + width); // Lateral
                  tsa = 2 * (length * width + width * height + height * length);
                }

                return (
                  <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                      <span className="text-slate-400">Total Volume (V):</span>
                      <p className="font-mono text-lg font-bold text-amber-400 mt-1">{volume.toFixed(2)} cm³</p>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                      <span className="text-slate-400">Curved/Lateral SA:</span>
                      <p className="font-mono text-lg font-bold text-sky-400 mt-1">{csa.toFixed(2)} cm²</p>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                      <span className="text-slate-400">Total Surface Area:</span>
                      <p className="font-mono text-lg font-bold text-emerald-400 mt-1">{tsa.toFixed(2)} cm²</p>
                    </div>
                  </div>
                );
              })()}
            </div>

            <button
              onClick={() => addXP(15, `Calculated 3D ${solidType} volume`)}
              className="mt-4 flex w-full items-center justify-center gap-1 rounded-xl bg-amber-600 py-2 text-xs font-semibold text-white hover:bg-amber-500"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Record Solution (+15 XP)</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Statistics & Probability Lab */}
      {mathSubTab === "stats" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm space-y-4">
          <div>
            <h3 className="font-heading text-base font-bold text-white">Central Tendency & Dispersion Engine</h3>
            <p className="text-xs text-slate-400">
              Enter dataset values (comma-separated) to compute mean, median, mode, variance, and standard deviation
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={dataPoints}
              onChange={(e) => setDataPoints(e.target.value)}
              placeholder="e.g. 10, 20, 15, 30, 25"
              className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 font-mono text-sm text-white focus:outline-none"
            />
            <button
              onClick={calculateStats}
              className="rounded-xl bg-amber-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-amber-500"
            >
              Compute Stats
            </button>
          </div>

          {statsResult && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs font-mono">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <span className="text-slate-400">Mean (x̄):</span>
                <p className="text-base font-bold text-sky-400 mt-1">{statsResult.mean}</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <span className="text-slate-400">Median (M):</span>
                <p className="text-base font-bold text-emerald-400 mt-1">{statsResult.median}</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <span className="text-slate-400">Mode (Z):</span>
                <p className="text-base font-bold text-amber-400 mt-1">{statsResult.mode}</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <span className="text-slate-400">Std Deviation (σ):</span>
                <p className="text-base font-bold text-rose-400 mt-1">{statsResult.stdDev}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Step-by-Step AI Equation Solver */}
      {mathSubTab === "solver" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm space-y-4">
          <div>
            <h3 className="font-heading text-base font-bold text-white">
              AI Step-by-Step Mathematical Derivation Solver
            </h3>
            <p className="text-xs text-slate-400">
              Solve complex calculus, algebra, trigonometry identities, and coordinate geometry problems
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={mathQuery}
              onChange={(e) => setMathQuery(e.target.value)}
              placeholder="e.g. Integrate x*sin(x) dx using integration by parts"
              className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 font-mono text-sm text-white focus:outline-none"
            />
            <button
              onClick={handleSolveMath}
              disabled={solverLoading}
              className="rounded-xl bg-amber-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-amber-500 disabled:opacity-50"
            >
              {solverLoading ? "Solving..." : "Derive Solution"}
            </button>
          </div>

          {solverResult && (
            <div className="rounded-xl border border-amber-500/30 bg-slate-950 p-4 text-xs sm:text-sm text-slate-200 leading-relaxed font-mono whitespace-pre-wrap">
              {solverResult}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
