import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  GraduationCap,
  Compass,
  Award,
  Sparkles,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Target,
} from "lucide-react";

export const CareerExplorer: React.FC = () => {
  const { user, addXP } = useApp();

  const [selectedStream, setSelectedStream] = useState<"pcm" | "pcb" | "commerce" | "humanities">("pcm");

  const streams = [
    {
      id: "pcm",
      title: "Science (PCM / MPC)",
      subjects: "Physics, Chemistry, Mathematics, Computer Science / IP",
      careers: ["Software & AI Engineer", "Aerospace & Drone Tech", "Robotics & Mechatronics", "Data Scientist", "Architect", "Defence (NDA Navy/Airforce)"],
      exams: ["JEE Main & Advanced", "BITSAT", "NDA", "CUET-UG", "IISER IAT", "VITEEE"],
    },
    {
      id: "pcb",
      title: "Science (PCB / BiPC)",
      subjects: "Physics, Chemistry, Biology, Biotechnology / Psychology",
      careers: ["Doctor (MBBS / BDS)", "Biotechnology & Geneticist", "Neuroscientist", "Pharmacist", "Agricultural Scientist", "Forensic Expert"],
      exams: ["NEET-UG", "CUET-UG Biology", "AIIMS Nursing", "ICAR AIEEA", "IISER IAT"],
    },
    {
      id: "commerce",
      title: "Commerce & Finance",
      subjects: "Accountancy, Economics, Business Studies, Applied Math",
      careers: ["Chartered Accountant (CA)", "Investment Banker", "Actuarial Scientist", "Corporate Lawyer", "Fintech Product Manager", "CFA / CPA"],
      exams: ["CA Foundation", "CUET-UG (SRCC/St. Stephens)", "IPMAT (IIM Indore/Rohtak)", "CLAT"],
    },
    {
      id: "humanities",
      title: "Humanities & Liberal Arts",
      subjects: "History, Political Science, Psychology, Sociology, Economics",
      careers: ["Civil Services (IAS / IFS / IPS)", "Corporate & Constitutional Lawyer", "Diplomat & International Relations", "Journalist & Media Creator", "Urban Planner", "Economist"],
      exams: ["UPSC CSE (Long Term)", "CLAT (NLU)", "CUET-UG", "NID / NIFT", "TISS BAT"],
    },
  ];

  const currentStreamData = streams.find((s) => s.id === selectedStream)!;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-500/20 text-pink-400">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-bold text-white">Career, Stream & Entrance Exam Guide</h1>
              <p className="text-xs text-slate-400">
                Grade 9–12 Stream selection • National Competitive Exams • Scholarships & Olympiads
              </p>
            </div>
          </div>
        </div>

        <span className="rounded-full bg-pink-500/20 px-3 py-1 text-xs font-bold text-pink-300">
          Grade {user.grade} Roadmap
        </span>
      </div>

      {/* Stream Tabs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {streams.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedStream(s.id as any)}
            className={`rounded-2xl border p-4 text-left transition-all ${
              selectedStream === s.id
                ? "border-pink-500 bg-pink-950/30 text-white shadow-md shadow-pink-500/10"
                : "border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700"
            }`}
          >
            <h4 className="font-heading text-sm font-bold text-white">{s.title}</h4>
            <p className="text-[11px] text-slate-400 mt-1 truncate">{s.subjects}</p>
          </button>
        ))}
      </div>

      {/* Stream Detailed Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Careers */}
        <div className="space-y-4 lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Target className="h-5 w-5 text-pink-400" />
            <h3 className="font-heading text-base font-bold text-white">Top High-Impact Future Careers</h3>
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {currentStreamData.careers.map((career, i) => (
              <div key={i} className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="font-medium">{career}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Entrance Exams */}
        <div className="space-y-4 lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Award className="h-5 w-5 text-amber-400" />
            <h3 className="font-heading text-base font-bold text-white">Target National Entrance Exams</h3>
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {currentStreamData.exams.map((exam, i) => (
              <div key={i} className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs">
                <span className="font-bold text-amber-300">{exam}</span>
                <p className="text-[11px] text-slate-400 mt-0.5">National Level Competitive Pathway</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
