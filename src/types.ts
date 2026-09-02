export type GradeLevel =
  | "1" | "2" | "3" | "4" | "5" | "6"
  | "7" | "8" | "9" | "10" | "11" | "12";

export type BoardType = "CBSE" | "ICSE" | "State Board" | "International / Cambridge";

export type SubjectType =
  | "Mathematics"
  | "Physics"
  | "Chemistry"
  | "Biology"
  | "Social Science"
  | "English"
  | "Hindi"
  | "Marathi"
  | "Computer Science";

export interface UserProfile {
  userId?: string;
  name: string;
  email?: string;
  grade: GradeLevel;
  board: BoardType;
  targetExam: string;
  avatar: string;
  xp: number;
  level: number;
  streakDays: number;
  lastActiveDate: string;
  completedGoals: string[];
  badges: Badge[];
  mistakeBank: MistakeItem[];
  savedNotes: SavedNote[];
  flashcardProgress: Record<string, number>; // cardId -> box level (1-5)
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  category: "lab" | "quiz" | "streak" | "revision" | "master";
}

export interface MistakeItem {
  id: string;
  question: string;
  studentAnswer: string;
  correctAnswer: string;
  explanation: string;
  subject: SubjectType;
  topic: string;
  dateAdded: string;
  resolved: boolean;
}

export interface SavedNote {
  id: string;
  title: string;
  subject: SubjectType;
  content: string;
  createdAt: string;
  type: "one-pager" | "mind-map" | "formula" | "doubt-solution";
}

export interface ExamQuestion {
  id: string;
  type: "mcq" | "assertion_reason" | "assertion-reason" | "case_based" | "short_answer" | "hots";
  question: string;
  passage?: string;
  options?: string[];
  correctAnswer: string;
  marks: number;
  explanation: string;
  rubric?: string;
  difficulty: "Easy" | "Medium" | "Hard" | "HOTS";
  topic?: string;
}

export interface ChemicalElement {
  number: number;
  symbol: string;
  name: string;
  atomicMass: string;
  category: "nonmetal" | "noble" | "alkali" | "alkaline" | "metalloid" | "halogen" | "transition" | "post-transition" | "lanthanide" | "actinide";
  electronConfig: string;
  electronegativity?: number;
  density?: string;
  meltingPoint?: string;
  boilingPoint?: string;
  discoveredBy?: string;
  summary: string;
  shells: number[];
}

export interface StudyGoal {
  id: string;
  title: string;
  subject: SubjectType;
  durationMinutes: number;
  completed: boolean;
  dueDate: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  subject: SubjectType;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
}
