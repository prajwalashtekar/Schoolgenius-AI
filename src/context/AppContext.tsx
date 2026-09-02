import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, GradeLevel, BoardType, SubjectType, MistakeItem, SavedNote, StudyGoal } from "../types";
import { DEFAULT_BADGES } from "../data/curriculumData";
import confetti from "canvas-confetti";
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection,
  onSnapshot,
  deleteDoc,
  addDoc,
  FirebaseUser
} from "../lib/firebase";

interface AppContextType {
  user: UserProfile;
  currentUser: FirebaseUser | null;
  authLoading: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (e: string, p: string) => Promise<void>;
  signupWithEmail: (e: string, p: string, name: string, grade: GradeLevel, board: BoardType) => Promise<void>;
  logout: () => Promise<void>;
  
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedSubject: SubjectType;
  setSelectedSubject: (subject: SubjectType) => void;
  updateGrade: (grade: GradeLevel) => void;
  updateBoard: (board: BoardType) => void;
  addXP: (amount: number, reason?: string) => void;
  addMistake: (mistake: Omit<MistakeItem, "id" | "dateAdded" | "resolved">) => Promise<void>;
  resolveMistake: (id: string) => Promise<void>;
  deleteMistake: (id: string) => Promise<void>;
  saveNote: (note: Omit<SavedNote, "id" | "createdAt">) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  toggleGoal: (id: string) => Promise<void>;
  addGoal: (goal: Omit<StudyGoal, "id" | "completed">) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  goals: StudyGoal[];
  
  isWhiteboardOpen: boolean;
  setIsWhiteboardOpen: (open: boolean) => void;
  isVoiceVivaOpen: boolean;
  setIsVoiceVivaOpen: (open: boolean) => void;
  isFocusModeActive: boolean;
  setIsFocusModeActive: (active: boolean) => void;
  speakText: (text: string) => void;
  stopSpeech: () => void;
  isSpeaking: boolean;
}

const STORAGE_KEY = "schoolgenius_user_profile_v2";

const initialGoals: StudyGoal[] = [
  { id: "g1", title: "Complete Newton's 2nd Law simulation in Physics Lab", subject: "Physics", durationMinutes: 20, completed: true, dueDate: "Today" },
  { id: "g2", title: "Solve 5 Trigonometric Identity questions", subject: "Mathematics", durationMinutes: 25, completed: false, dueDate: "Today" },
  { id: "g3", title: "Review Periodic Trends & Electron Affinity flashcards", subject: "Chemistry", durationMinutes: 15, completed: false, dueDate: "Tomorrow" },
];

const defaultUser: UserProfile = {
  name: "Arjun Sharma",
  grade: "10",
  board: "CBSE",
  targetExam: "Board Exam 2026 / NTSE / Olympiad",
  avatar: "🧑‍🎓",
  xp: 1450,
  level: 4,
  streakDays: 7,
  lastActiveDate: new Date().toISOString(),
  completedGoals: ["g1"],
  badges: DEFAULT_BADGES,
  mistakeBank: [
    {
      id: "m1",
      question: "What happens to the focal length of a convex lens when immersed in water?",
      studentAnswer: "Remains constant because shape doesn't change",
      correctAnswer: "Focal length increases",
      explanation: "By Lens Maker's formula 1/f = (n_lens/n_medium - 1)(1/R1 - 1/R2). As refractive index relative to water is lower than air, power decreases and focal length increases.",
      subject: "Physics",
      topic: "Optics & Refraction",
      dateAdded: new Date(Date.now() - 86400000).toISOString(),
      resolved: false,
    },
  ],
  savedNotes: [],
  flashcardProgress: {},
};

// Helper for streak calculation
function calculateUpdatedStreak(lastActiveIso: string | undefined, currentStreak: number): { streak: number; isNewDay: boolean } {
  if (!lastActiveIso) {
    return { streak: 1, isNewDay: true };
  }
  const last = new Date(lastActiveIso);
  const now = new Date();
  
  const lastDateStr = `${last.getFullYear()}-${last.getMonth()}-${last.getDate()}`;
  const todayDateStr = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  
  if (lastDateStr === todayDateStr) {
    return { streak: Math.max(1, currentStreak), isNewDay: false };
  }

  // Calculate day difference
  const oneDay = 1000 * 60 * 60 * 24;
  const startOfLast = new Date(last.getFullYear(), last.getMonth(), last.getDate()).getTime();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const diffDays = Math.round((startOfToday - startOfLast) / oneDay);

  if (diffDays === 1) {
    return { streak: currentStreak + 1, isNewDay: true };
  } else {
    // Missed a day or more, reset streak to 1
    return { streak: 1, isNewDay: true };
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const local = localStorage.getItem(STORAGE_KEY);
      if (local) {
        return JSON.parse(local);
      }
    } catch {
      // fallback
    }
    return defaultUser;
  });

  const [activeTab, setActiveTab] = useState<string>("HOME");
  const [selectedSubject, setSelectedSubject] = useState<SubjectType>("Physics");
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [isVoiceVivaOpen, setIsVoiceVivaOpen] = useState(false);
  const [isFocusModeActive, setIsFocusModeActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [goals, setGoals] = useState<StudyGoal[]>(initialGoals);

  // 1. Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setCurrentUser(fbUser);
      setAuthLoading(false);

      if (fbUser) {
        // Sync user profile document from Firestore
        const userRef = doc(db, "users", fbUser.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          const cloudData = docSnap.data() as Partial<UserProfile>;
          const { streak, isNewDay } = calculateUpdatedStreak(cloudData.lastActiveDate, cloudData.streakDays || 1);
          
          const merged: UserProfile = {
            ...defaultUser,
            ...cloudData,
            name: cloudData.name || fbUser.displayName || "Student",
            email: fbUser.email || "",
            streakDays: streak,
            lastActiveDate: new Date().toISOString(),
            userId: fbUser.uid,
          };
          
          setUser(merged);

          // Update streak & lastActive in cloud if it's a new day
          if (isNewDay) {
            await updateDoc(userRef, {
              streakDays: streak,
              lastActiveDate: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }).catch(console.error);
          }
        } else {
          // Create initial user doc in Firestore
          const initialCloudUser: UserProfile = {
            ...user,
            name: fbUser.displayName || user.name || "Student",
            email: fbUser.email || "",
            userId: fbUser.uid,
            streakDays: Math.max(1, user.streakDays || 1),
            lastActiveDate: new Date().toISOString(),
          };

          await setDoc(userRef, {
            ...initialCloudUser,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          setUser(initialCloudUser);
        }
      } else {
        // User is not logged in - check if we should prompt to login / choose guest
        try {
          const choiceMade = sessionStorage.getItem("schoolgenius_guest_choice_made");
          if (!choiceMade) {
            setIsAuthModalOpen(true);
          }
        } catch {
          // fallback
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Real-time Firestore Subscriptions for Notes, Mistakes, Goals when logged in
  useEffect(() => {
    if (!currentUser) return;

    // Notes collection listener
    const notesRef = collection(db, "users", currentUser.uid, "notes");
    const unsubNotes = onSnapshot(notesRef, (snapshot) => {
      const cloudNotes: SavedNote[] = [];
      snapshot.forEach((docSnap) => {
        cloudNotes.push({ id: docSnap.id, ...docSnap.data() } as SavedNote);
      });
      setUser((prev) => ({ ...prev, savedNotes: cloudNotes }));
    });

    // Mistakes collection listener
    const mistakesRef = collection(db, "users", currentUser.uid, "mistakes");
    const unsubMistakes = onSnapshot(mistakesRef, (snapshot) => {
      const cloudMistakes: MistakeItem[] = [];
      snapshot.forEach((docSnap) => {
        cloudMistakes.push({ id: docSnap.id, ...docSnap.data() } as MistakeItem);
      });
      setUser((prev) => ({ ...prev, mistakeBank: cloudMistakes }));
    });

    // Goals collection listener
    const goalsRef = collection(db, "users", currentUser.uid, "goals");
    const unsubGoals = onSnapshot(goalsRef, (snapshot) => {
      if (!snapshot.empty) {
        const cloudGoals: StudyGoal[] = [];
        snapshot.forEach((docSnap) => {
          cloudGoals.push({ id: docSnap.id, ...docSnap.data() } as StudyGoal);
        });
        setGoals(cloudGoals);
      }
    });

    return () => {
      unsubNotes();
      unsubMistakes();
      unsubGoals();
    };
  }, [currentUser]);

  // 3. Local storage fallback caching
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn("Storage error:", e);
    }
  }, [user]);

  // Auth Operations
  const loginWithGoogle = async () => {
    setAuthLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } finally {
      setAuthLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setAuthLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } finally {
      setAuthLoading(false);
    }
  };

  const signupWithEmail = async (
    email: string, 
    pass: string, 
    name: string, 
    grade: GradeLevel, 
    board: BoardType
  ) => {
    setAuthLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, pass);
      const fbUser = userCred.user;
      
      const newProfile: UserProfile = {
        ...defaultUser,
        name,
        email,
        grade,
        board,
        userId: fbUser.uid,
        streakDays: 1,
        lastActiveDate: new Date().toISOString(),
      };

      const userRef = doc(db, "users", fbUser.uid);
      await setDoc(userRef, {
        ...newProfile,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setUser(newProfile);
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
  };

  // XP & Level calculations with Firestore sync
  const addXP = async (amount: number, reason?: string) => {
    setUser((prev) => {
      const newXP = prev.xp + amount;
      const newLevel = Math.floor(newXP / 400) + 1;
      const leveledUp = newLevel > prev.level;

      if (leveledUp) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      const updated = {
        ...prev,
        xp: newXP,
        level: newLevel,
      };

      // Sync to cloud if user is logged in
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        updateDoc(userRef, {
          xp: newXP,
          level: newLevel,
          updatedAt: new Date().toISOString(),
        }).catch(console.error);
      }

      return updated;
    });
  };

  const updateGrade = async (grade: GradeLevel) => {
    setUser((prev) => ({ ...prev, grade }));
    if (currentUser) {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, { grade, updatedAt: new Date().toISOString() }).catch(console.error);
    }
  };

  const updateBoard = async (board: BoardType) => {
    setUser((prev) => ({ ...prev, board }));
    if (currentUser) {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, { board, updatedAt: new Date().toISOString() }).catch(console.error);
    }
  };

  // Mistake Bank CRUD with Firestore Cloud Support
  const addMistake = async (mistake: Omit<MistakeItem, "id" | "dateAdded" | "resolved">) => {
    const newMistakeData = {
      ...mistake,
      dateAdded: new Date().toISOString(),
      resolved: false,
    };

    if (currentUser) {
      const mistakesRef = collection(db, "users", currentUser.uid, "mistakes");
      await addDoc(mistakesRef, {
        ...newMistakeData,
        userId: currentUser.uid,
      });
    } else {
      const localItem: MistakeItem = {
        ...newMistakeData,
        id: "mistake_" + Date.now(),
      };
      setUser((prev) => ({
        ...prev,
        mistakeBank: [localItem, ...prev.mistakeBank],
      }));
    }
  };

  const resolveMistake = async (id: string) => {
    if (currentUser) {
      const docRef = doc(db, "users", currentUser.uid, "mistakes", id);
      await updateDoc(docRef, { resolved: true }).catch(console.error);
    } else {
      setUser((prev) => ({
        ...prev,
        mistakeBank: prev.mistakeBank.map((m) => (m.id === id ? { ...m, resolved: true } : m)),
      }));
    }
    addXP(50, "Mistake Resolved & Mastered");
  };

  const deleteMistake = async (id: string) => {
    if (currentUser) {
      const docRef = doc(db, "users", currentUser.uid, "mistakes", id);
      await deleteDoc(docRef).catch(console.error);
    } else {
      setUser((prev) => ({
        ...prev,
        mistakeBank: prev.mistakeBank.filter((m) => m.id !== id),
      }));
    }
  };

  // Saved Notes CRUD with Firestore Cloud Support
  const saveNote = async (note: Omit<SavedNote, "id" | "createdAt">) => {
    const noteData = {
      ...note,
      createdAt: new Date().toISOString(),
    };

    if (currentUser) {
      const notesRef = collection(db, "users", currentUser.uid, "notes");
      await addDoc(notesRef, {
        ...noteData,
        userId: currentUser.uid,
      });
    } else {
      const newNote: SavedNote = {
        ...noteData,
        id: "note_" + Date.now(),
      };
      setUser((prev) => ({
        ...prev,
        savedNotes: [newNote, ...prev.savedNotes],
      }));
    }
    addXP(25, "Saved Revision Note");
  };

  const deleteNote = async (id: string) => {
    if (currentUser) {
      const noteRef = doc(db, "users", currentUser.uid, "notes", id);
      await deleteDoc(noteRef).catch(console.error);
    } else {
      setUser((prev) => ({
        ...prev,
        savedNotes: prev.savedNotes.filter((n) => n.id !== id),
      }));
    }
  };

  // Goals CRUD with Firestore Cloud Support
  const toggleGoal = async (id: string) => {
    const target = goals.find((g) => g.id === id);
    if (!target) return;
    const newCompleted = !target.completed;

    if (currentUser) {
      const goalRef = doc(db, "users", currentUser.uid, "goals", id);
      await updateDoc(goalRef, { completed: newCompleted }).catch(console.error);
    } else {
      setGoals((prev) =>
        prev.map((g) => (g.id === id ? { ...g, completed: newCompleted } : g))
      );
    }
    if (newCompleted) addXP(30, "Completed Daily Goal");
  };

  const addGoal = async (goal: Omit<StudyGoal, "id" | "completed">) => {
    const goalData = {
      ...goal,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    if (currentUser) {
      const goalsRef = collection(db, "users", currentUser.uid, "goals");
      await addDoc(goalsRef, {
        ...goalData,
        userId: currentUser.uid,
      });
    } else {
      const newGoal: StudyGoal = {
        ...goalData,
        id: "goal_" + Date.now(),
      };
      setGoals((prev) => [newGoal, ...prev]);
    }
  };

  const deleteGoal = async (id: string) => {
    if (currentUser) {
      const goalRef = doc(db, "users", currentUser.uid, "goals", id);
      await deleteDoc(goalRef).catch(console.error);
    } else {
      setGoals((prev) => prev.filter((g) => g.id !== id));
    }
  };

  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[#*`_~]/g, "").replace(/\(.*?\)/g, "").slice(0, 500);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        currentUser,
        authLoading,
        isAuthModalOpen,
        setIsAuthModalOpen,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        logout,
        activeTab,
        setActiveTab,
        selectedSubject,
        setSelectedSubject,
        updateGrade,
        updateBoard,
        addXP,
        addMistake,
        resolveMistake,
        deleteMistake,
        saveNote,
        deleteNote,
        toggleGoal,
        addGoal,
        deleteGoal,
        goals,
        isWhiteboardOpen,
        setIsWhiteboardOpen,
        isVoiceVivaOpen,
        setIsVoiceVivaOpen,
        isFocusModeActive,
        setIsFocusModeActive,
        speakText,
        stopSpeech,
        isSpeaking,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
