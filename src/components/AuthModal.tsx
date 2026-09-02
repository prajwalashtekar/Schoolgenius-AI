import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  LogIn, 
  UserPlus, 
  X, 
  Mail, 
  Lock, 
  User, 
  Sparkles, 
  AlertCircle, 
  Loader2, 
  CheckCircle2,
  Cloud,
  CloudOff,
  ShieldAlert,
  Flame,
  ArrowRight,
  UserX
} from "lucide-react";
import { GradeLevel, BoardType } from "../types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginWithGoogle, loginWithEmail, signupWithEmail, authLoading } = useApp();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [grade, setGrade] = useState<GradeLevel>("10");
  const [board, setBoard] = useState<BoardType>("CBSE");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleContinueAsGuest = () => {
    try {
      sessionStorage.setItem("schoolgenius_guest_choice_made", "true");
    } catch {
      // ignore
    }
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Please fill in both email and password.");
      return;
    }

    if (mode === "signup" && !name.trim()) {
      setError("Please enter your name.");
      return;
    }

    try {
      if (mode === "login") {
        await loginWithEmail(email, password);
      } else {
        await signupWithEmail(email, password, name, grade, board);
      }
      try {
        sessionStorage.setItem("schoolgenius_guest_choice_made", "true");
      } catch {}
      onClose();
    } catch (err: any) {
      console.error("Auth error:", err);
      let msg = err.message || "Authentication failed. Please check your credentials.";
      if (msg.includes("auth/invalid-credential") || msg.includes("auth/wrong-password") || msg.includes("auth/user-not-found")) {
        msg = "Invalid email or password.";
      } else if (msg.includes("auth/email-already-in-use")) {
        msg = "An account with this email already exists. Try logging in!";
      } else if (msg.includes("auth/weak-password")) {
        msg = "Password should be at least 6 characters.";
      }
      setError(msg);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      await loginWithGoogle();
      try {
        sessionStorage.setItem("schoolgenius_guest_choice_made", "true");
      } catch {}
      onClose();
    } catch (err: any) {
      console.error("Google Auth error:", err);
      setError(err.message || "Failed to sign in with Google.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
        {/* Close / Guest Dismiss Button */}
        <button
          onClick={handleContinueAsGuest}
          className="absolute top-5 right-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          title="Dismiss / Continue as Guest"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Brand & Value Proposition Header */}
        <div className="text-center mb-5">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-2xl shadow-lg shadow-indigo-600/30">
            G
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            {mode === "login" ? "Sign In to SchoolGenius" : "Create Your Student Account"}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Sync your study streaks, AI doubt solutions, and mistake bank securely in the Cloud Database.
          </p>
        </div>

        {/* Cloud Benefits Highlight */}
        <div className="grid grid-cols-3 gap-2 mb-4 bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 text-[11px] text-slate-600 font-medium">
          <div className="flex flex-col items-center text-center p-1">
            <Cloud className="h-4 w-4 text-indigo-600 mb-1" />
            <span className="font-bold text-slate-800">Cloud Backup</span>
            <span className="text-[10px] text-slate-400">Never lose notes</span>
          </div>
          <div className="flex flex-col items-center text-center p-1 border-x border-slate-200">
            <Flame className="h-4 w-4 text-orange-500 mb-1" />
            <span className="font-bold text-slate-800">Daily Streak</span>
            <span className="text-[10px] text-slate-400">Track 7+ day streak</span>
          </div>
          <div className="flex flex-col items-center text-center p-1">
            <Sparkles className="h-4 w-4 text-emerald-600 mb-1" />
            <span className="font-bold text-slate-800">Mistake Bank</span>
            <span className="text-[10px] text-slate-400">Spaced revision</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Google One-Click Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={authLoading}
          type="button"
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 py-2.5 px-4 text-xs sm:text-sm font-bold text-slate-700 shadow-2xs active:scale-98 transition-all disabled:opacity-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative my-4 flex items-center justify-center">
          <div className="w-full border-t border-slate-200"></div>
          <span className="absolute bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Or with email
          </span>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signup" && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Student Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          {mode === "signup" && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Grade
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as GradeLevel)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none cursor-pointer"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                    <option key={g} value={g.toString()}>
                      Grade {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Board
                </label>
                <select
                  value={board}
                  onChange={(e) => setBoard(e.target.value as BoardType)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none cursor-pointer"
                >
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE</option>
                  <option value="State Board">State Board</option>
                  <option value="International / Cambridge">Cambridge/IB</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={authLoading}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-600/30 active:scale-98 transition-all disabled:opacity-50"
          >
            {authLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : mode === "login" ? (
              <LogIn className="h-4 w-4" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            <span>{mode === "login" ? "Sign In & Sync Cloud" : "Create Account & Sync Cloud"}</span>
          </button>
        </form>

        {/* Toggle Mode Link */}
        <div className="mt-3 text-center text-xs text-slate-500">
          {mode === "login" ? (
            <p>
              New student?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError(null);
                }}
                className="font-bold text-indigo-600 hover:underline"
              >
                Create account
              </button>
            </p>
          ) : (
            <p>
              Already registered?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className="font-bold text-indigo-600 hover:underline"
              >
                Sign in here
              </button>
            </p>
          )}
        </div>

        {/* Explicit Guest Mode Notice & Dismissal */}
        <div className="mt-5 border-t border-slate-200/90 pt-4 space-y-2.5">
          <div className="flex items-start gap-2.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 p-3 text-[11px] text-amber-900 leading-relaxed">
            <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-950">Guest Storage Notice: </span>
              If you continue without logging in, your data (study streak, notes, homework questions, and mistake bank) will <span className="font-bold underline">NOT be stored in the cloud database</span> and will be lost if your browser cache is cleared.
            </div>
          </div>

          <button
            type="button"
            onClick={handleContinueAsGuest}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 py-2.5 text-xs font-bold text-slate-700 transition-colors"
          >
            <UserX className="h-4 w-4 text-slate-500" />
            <span>Continue as Guest (Skip Cloud Storage)</span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
