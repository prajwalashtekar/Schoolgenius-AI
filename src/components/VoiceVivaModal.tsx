import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  User,
  Loader2,
  Trophy,
  Award,
  RefreshCw,
} from "lucide-react";

export const VoiceVivaModal: React.FC = () => {
  const { isVoiceVivaOpen, setIsVoiceVivaOpen, user, addXP, speakText, stopSpeech, isSpeaking } = useApp();
  const [topic, setTopic] = useState("Newton's Laws & Friction");
  const [subject, setSubject] = useState("Physics");
  const [messages, setMessages] = useState<Array<{ role: "examiner" | "student"; text: string }>>([
    {
      role: "examiner",
      text: "Greetings Arjun! Welcome to your Grade 10 Oral Viva exam. Let's begin with a fundamental question: Can you explain Newton's Third Law of Motion and give one everyday example where it applies?",
    },
  ]);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = true;
        recog.lang = "en-US";

        recog.onresult = (event: any) => {
          let current = "";
          for (let i = 0; i < event.results.length; i++) {
            current += event.results[i][0].transcript;
          }
          setTranscript(current);
        };

        recog.onend = () => {
          setIsListening(false);
        };

        recog.onerror = () => {
          setIsListening(false);
        };

        setRecognition(recog);
      }
    }
  }, []);

  if (!isVoiceVivaOpen) return null;

  const toggleListening = () => {
    if (!recognition) {
      alert("Speech recognition is not supported in this browser. You can type your answer in the text box!");
      return;
    }
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      recognition.start();
      setIsListening(true);
    }
  };

  const handleSendAnswer = async (textToSend?: string) => {
    const studentText = textToSend || transcript;
    if (!studentText.trim()) return;

    const newMsgs = [...messages, { role: "student" as const, text: studentText }];
    setMessages(newMsgs);
    setTranscript("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade: user.grade,
          subject,
          mode: "viva",
          concept: topic,
          message: studentText,
          history: newMsgs.map((m) => ({
            role: m.role === "student" ? "user" : "model",
            content: m.text,
          })),
        }),
      });

      const data = await res.json();
      const examinerReply = data.text || "Good answer! Let's move to the next question.";
      setMessages((prev) => [...prev, { role: "examiner", text: examinerReply }]);
      speakText(examinerReply);
      addXP(25, "Answered Oral Viva Question");
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "examiner", text: "Great effort. Let's delve deeper into how momentum is conserved in this scenario." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetViva = () => {
    setMessages([
      {
        role: "examiner",
        text: `Welcome! We are testing your knowledge in ${subject} (${topic}). Please answer verbally or in the input box.`,
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-2 backdrop-blur-md sm:p-4 animate-in fade-in duration-200">
      <div className="relative flex h-full max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <Mic className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-heading text-sm font-bold text-white flex items-center gap-2">
                Oral Viva Simulator & Voice Coach
                <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                  Live AI Examiner
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Practise board oral questions, spoken clarity, and viva confidence</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetViva}
              title="Restart Viva"
              className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-300 hover:bg-slate-700"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                stopSpeech();
                setIsVoiceVivaOpen(false);
              }}
              className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-400 hover:bg-rose-500 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Topic Selector */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 bg-slate-950/50 px-4 py-2 text-xs">
          <span className="text-slate-400">Topic:</span>
          {["Laws of Motion", "Chemical Reactions", "Cell Biology", "Trigonometry", "Indian Constitution"].map((t) => (
            <button
              key={t}
              onClick={() => {
                setTopic(t);
                setMessages([
                  {
                    role: "examiner",
                    text: `Excellent. Let's start the viva on ${t}. What is the fundamental concept behind ${t}?`,
                  },
                ]);
              }}
              className={`rounded-md px-2.5 py-1 transition-all ${
                topic === t ? "bg-emerald-600 text-white font-semibold" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Dialogue Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-900/60">
          {messages.map((m, idx) => {
            const isExaminer = m.role === "examiner";
            return (
              <div
                key={idx}
                className={`flex items-start gap-2.5 ${isExaminer ? "justify-start" : "justify-end"}`}
              >
                {isExaminer && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-3 text-xs leading-relaxed sm:text-sm ${
                    isExaminer
                      ? "bg-slate-800/90 text-slate-100 border border-slate-700/60"
                      : "bg-emerald-600 text-white font-medium"
                  }`}
                >
                  <p>{m.text}</p>
                  {isExaminer && (
                    <div className="mt-2 flex items-center justify-end">
                      <button
                        onClick={() => speakText(m.text)}
                        className="flex items-center gap-1 text-[11px] text-sky-400 hover:underline"
                      >
                        <Volume2 className="h-3 w-3" />
                        <span>Read Aloud</span>
                      </button>
                    </div>
                  )}
                </div>
                {!isExaminer && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white shadow">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 p-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Examiner is evaluating your answer and preparing next question...</span>
            </div>
          )}
        </div>

        {/* Voice & Input Controls */}
        <div className="border-t border-slate-800 bg-slate-950/80 p-3">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleListening}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all shadow ${
                isListening
                  ? "bg-rose-500 text-white animate-pulse ring-4 ring-rose-500/30"
                  : "bg-emerald-600 text-white hover:bg-emerald-500"
              }`}
              title={isListening ? "Stop listening" : "Click and speak your answer"}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>

            <input
              type="text"
              placeholder={isListening ? "Listening to your voice..." : "Type your viva answer or click mic to speak..."}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendAnswer()}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />

            <button
              onClick={() => handleSendAnswer()}
              disabled={isLoading || !transcript.trim()}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white transition-opacity hover:bg-emerald-500 disabled:opacity-50"
            >
              Submit Answer
            </button>
          </div>
          {isListening && (
            <p className="mt-1.5 text-center text-[11px] text-rose-400 animate-pulse">
              🎙️ Recording voice... Speak clearly into your microphone!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
