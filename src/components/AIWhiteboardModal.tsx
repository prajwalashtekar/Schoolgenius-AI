import React, { useRef, useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  X,
  Pen,
  Highlighter,
  Eraser,
  Square,
  Circle,
  Minus,
  Sparkles,
  Download,
  RotateCcw,
  Grid,
  Bot,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export const AIWhiteboardModal: React.FC = () => {
  const { isWhiteboardOpen, setIsWhiteboardOpen, user, addXP } = useApp();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tool, setTool] = useState<"pen" | "highlighter" | "eraser" | "rect" | "circle" | "line">("pen");
  const [color, setColor] = useState("#38bdf8");
  const [lineWidth, setLineWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [aiSolving, setAiSolving] = useState(false);
  const [aiSolution, setAiSolution] = useState<string | null>(null);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [snapshot, setSnapshot] = useState<ImageData | null>(null);

  useEffect(() => {
    if (!isWhiteboardOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio || 1200;
      canvas.height = rect.height * window.devicePixelRatio || 700;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [isWhiteboardOpen]);

  if (!isWhiteboardOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    setIsDrawing(true);
    setStartPos({ x, y });
    setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));

    ctx.beginPath();
    ctx.moveTo(x, y);

    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = lineWidth * 4;
    } else if (tool === "highlighter") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color + "66"; // 40% opacity
      ctx.lineWidth = lineWidth * 3;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (tool === "pen" || tool === "highlighter" || tool === "eraser") {
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (snapshot && startPos) {
      // Shape tools
      ctx.putImageData(snapshot, 0, 0);
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;

      if (tool === "rect") {
        ctx.strokeRect(startPos.x, startPos.y, x - startPos.x, y - startPos.y);
      } else if (tool === "circle") {
        const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2));
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (tool === "line") {
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setStartPos(null);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setAiSolution(null);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `SchoolGenius_Whiteboard_${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
    addXP(10, "Exported Whiteboard Notes");
  };

  const solveWithAI = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setAiSolving(true);
    setAiSolution(null);

    try {
      const dataUrl = canvas.toDataURL("image/png");
      const res = await fetch("/api/homework/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: dataUrl,
          grade: user.grade,
          subject: "Science & Mathematics",
          question: "Solve the equations, diagrams, or scientific problems drawn on this whiteboard.",
        }),
      });

      const data = await res.json();
      if (data.solution) {
        setAiSolution(data.solution);
        addXP(40, "Solved Whiteboard Problem with AI");
      } else {
        setAiSolution("I couldn't detect clear writing. Try writing equations in dark ink or larger letters!");
      }
    } catch (e: any) {
      setAiSolution("Error analyzing whiteboard: " + (e.message || "Please check connection."));
    } finally {
      setAiSolving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-2 backdrop-blur-md sm:p-4 animate-in fade-in duration-200">
      <div className="relative flex h-full max-h-[95vh] w-full max-w-6xl flex-col rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Whiteboard Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
              <Pen className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-heading text-sm font-bold text-white flex items-center gap-2">
                AI Interactive Whiteboard
                <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-sky-300">
                  Grade {user.grade}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Draw diagrams, write math formulas, and ask AI to solve or hint</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={solveWithAI}
              disabled={aiSolving}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-sky-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 hover:opacity-95 active:scale-95 disabled:opacity-50"
            >
              {aiSolving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 text-amber-300" />}
              <span>{aiSolving ? "Analyzing Canvas..." : "AI Solve Canvas"}</span>
            </button>

            <button
              onClick={downloadCanvas}
              title="Save Image"
              className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-300 hover:bg-slate-700"
            >
              <Download className="h-4 w-4" />
            </button>

            <button
              onClick={clearCanvas}
              title="Clear Canvas"
              className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-300 hover:bg-slate-700"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            <button
              onClick={() => setIsWhiteboardOpen(false)}
              className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-400 hover:bg-rose-500 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Toolbar & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900 px-4 py-2 text-xs">
          {/* Tool selector */}
          <div className="flex items-center gap-1">
            {[
              { id: "pen", label: "Pen", icon: Pen },
              { id: "highlighter", label: "Highlighter", icon: Highlighter },
              { id: "eraser", label: "Eraser", icon: Eraser },
              { id: "rect", label: "Box", icon: Square },
              { id: "circle", label: "Circle", icon: Circle },
              { id: "line", label: "Line", icon: Minus },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTool(t.id as any)}
                  className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    tool === t.id
                      ? "bg-indigo-600 text-white font-semibold"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Color palette */}
          <div className="flex items-center gap-1.5">
            {["#38bdf8", "#818cf8", "#34d399", "#fbbf24", "#f87171", "#f472b6", "#ffffff"].map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`h-5 w-5 rounded-full ring-2 transition-transform ${
                  color === c ? "ring-white scale-110" : "ring-transparent hover:scale-105"
                }`}
              />
            ))}
          </div>

          {/* Line width and Grid toggle */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-400">
              <span>Size:</span>
              <input
                type="range"
                min="1"
                max="16"
                value={lineWidth}
                onChange={(e) => setLineWidth(Number(e.target.value))}
                className="h-1.5 w-16 accent-indigo-500 cursor-pointer"
              />
            </div>

            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium border ${
                showGrid
                  ? "border-sky-500/40 bg-sky-500/20 text-sky-300"
                  : "border-slate-800 bg-slate-800 text-slate-400"
              }`}
            >
              <Grid className="h-3 w-3" />
              <span>Grid</span>
            </button>
          </div>
        </div>

        {/* Canvas Body with Grid */}
        <div className="relative flex-1 bg-slate-950 overflow-hidden">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className={`h-full w-full cursor-crosshair touch-none ${
              showGrid
                ? "bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px]"
                : "bg-slate-950"
            }`}
          />

          {/* AI Solution Overlay Sidebar */}
          {aiSolution && (
            <div className="absolute top-3 right-3 max-w-md w-full max-h-[85%] rounded-xl border border-indigo-500/40 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-md overflow-y-auto z-10 animate-in slide-in-from-right-4">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                  <Bot className="h-4 w-4" />
                  <span>AI Solution & Analysis</span>
                </div>
                <button
                  onClick={() => setAiSolution(null)}
                  className="rounded p-1 text-slate-400 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="prose prose-invert prose-sm text-xs leading-relaxed text-slate-200 whitespace-pre-wrap">
                {aiSolution}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
