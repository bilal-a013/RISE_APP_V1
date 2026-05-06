export type Rating = 1 | 2 | 3 | 4 | 5;

export type Tutor = {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
};

export type ChildProfile = {
  id: string;
  tutorKey: string;
  tutorId?: string;
  fullName: string;
  preferredName?: string;
  age?: number;
  pronouns?: "he/him" | "she/her" | "they/them" | "prefer-not-to-say" | string;
  yearGroup: string;
  school?: string;
  subjects: string[];
  examBoard?: string;
  currentWorkingLevel: string;
  targetLevel: string;
  mainGoals?: string;
  confidenceLevel?: number;
  strengths?: string[];
  struggles?: string[];
  currentTopics?: string[];
  learningStyle?: string;
  parentName: string;
  parentEmail: string;
  parentPhone?: string;
  preferredReportMethod?: "email" | "whatsapp" | "pdf" | "copy";
  currentHomework?: string;
  upcomingTestDate?: string;
  longTermGoal?: string;
  sessionFrequency?: string;
  tutorNotes?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
};

export type UnderstandingToday = "lots-of-help" | "guided" | "mostly-independent" | "secure";
export type HomeworkStatus = "not-set" | "set-today" | "reviewed-today" | "incomplete" | "completed";
export type ReportTone = "balanced" | "encouraging" | "direct" | "detailed";

export type SessionLog = {
  id: string;
  childId: string;
  tutorId: string;
  sessionDate: string;
  subject?: string;
  topic: string;
  quickNotes: string;
  sessionFocus: string[];
  understandingToday: UnderstandingToday;
  effortEngagement: Rating;
  keySkillWorkedOn: string;
  homeworkStatus: HomeworkStatus;
  homeworkDetails?: string;
  nextLessonFocus: string[];
  specificNextFocus?: string;
  progressRating: Rating;
  confidenceRating: Rating;
  reportTone: ReportTone;
  includeInReport: {
    progressRating: boolean;
    confidenceRating: boolean;
    homework: boolean;
    nextSteps: boolean;
    previousSessionComparison: boolean;
  };
  parentReport?: ParentReport;
  internalTutorNote?: string;
  createdAt: string;
};

export type ParentReport = {
  id: string;
  childId: string;
  sessionLogId: string;
  title: string;
  todayFocus: string;
  whatWentWell: string[];
  stillNeedsSupport: string;
  confidenceUnderstanding: string;
  homeworkAssigned: string;
  nextSessionFocus: string;
  progressSnapshot: {
    progressRating: number;
    progressLabel: string;
    confidenceRating: number;
    confidenceLabel: string;
    currentWorkingLevel: string;
    targetLevel: string;
    previousSessionComparison: string;
  };
  tutorSummary: string;
  generatedAt: string;
};

export type RiseStore = {
  tutor: Tutor;
  children: ChildProfile[];
  sessions: SessionLog[];
  reports: ParentReport[];
};

export type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  created_at: string | null;
};

export type StudentRow = {
  id: string;
  tutor_id: string;
  full_name: string;
  preferred_name: string | null;
  age: number | null;
  year_group: string | null;
  pronouns: string | null;
  school: string | null;
  subjects: string[] | null;
  exam_board: string | null;
  current_grade: string | null;
  target_grade: string | null;
  goals: string | null;
  strengths: string[] | null;
  struggles: string[] | null;
  parent_name: string | null;
  parent_email: string | null;
  parent_phone: string | null;
  tutor_key: string;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type SessionRow = {
  id: string;
  student_id: string;
  tutor_id: string;
  session_date: string;
  subject: string | null;
  topic: string | null;
  summary: string | null;
  strengths: string[] | null;
  struggles: string[] | null;
  homework: string | null;
  next_steps: string | null;
  created_at: string | null;
};

export type ReportRow = {
  id: string;
  student_id: string;
  tutor_id: string;
  session_id: string | null;
  title: string;
  body: string | null;
  sent_status: string | null;
  sent_to: string | null;
  sent_at: string | null;
  created_at: string | null;
};

export type ParentReplyRow = {
  id: string;
  student_id: string;
  report_id: string | null;
  parent_email: string | null;
  subject: string | null;
  body: string | null;
  received_at: string | null;
  gmail_thread_id: string | null;
};
