export type PortalType = 'student' | 'teacher' | 'admin';

export type StudentTab = 'home' | 'lessons' | 'progress' | 'profile' | 'learning';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export interface LessonPart {
  title: string;
  content: string;
  imageUrl?: string;
  icon?: string;
}

export interface LessonQuiz {
  question: string;
  options: string[]; // Option text lines
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export interface Lesson {
  id: string;
  title: string;
  category: 'LS1 English' | 'LS1 Filipino' | 'LS2 Science' | 'LS3 Mathematics' | 'LS4 Life Skills' | 'LS5 Culture & Society' | 'LS6 Digital Literacy';
  level: number;
  duration: string;
  description: string;
  progress: number; // percentage
  assetUrl: string;
  rewardText: string;
  isActive?: boolean;
  bucketUrl?: string; // Supabase/Firebase file storage URI
  assignedTo?: string; // Student name or group
  uploadedBy?: string; // Who added this lesson
  uploadedByEmail?: string; // Teacher's email address
  sectionId?: string;  // Target section assigned to this lesson
  parts?: LessonPart[];
  quiz?: LessonQuiz;
  quizzes?: LessonQuiz[];
}

export interface UserEnrollment {
  id: string;
  name: string;
  email: string;
  role: 'Student' | 'Teacher' | 'Admin';
  program: string;
  joined: string;
  status: 'Active' | 'Pending';
  initials: string;
  colorScheme: string; // e.g. blue, green, amber
}

export interface StudentAlert {
  id: string;
  title: string;
  description: string;
  type: 'pending' | 'post' | 'milestone';
  icon: string;
}

export interface StudentInsight {
  id: string;
  name: string;
  avatarUrl: string;
  subject: string;
  status: string;
  statusType: 'struggling' | 'mastered';
  score: number;
}

export interface UserAccount {
  email: string;
  role: PortalType;
  name: string;
  label: string;
  desc: string;
  avatar: string;
  password?: string;
  section?: string;
  sections?: string[];
  gradeLevel?: number; // 1–6
  subjects?: string[];
  /** Instructor-only: multiple sections this teacher is assigned to handle */
  assignedSections?: string[];
  /** Instructor-only: multiple grade levels this teacher handles (stored as strings, e.g. "Grade 3") */
  handledGradeLevels?: string[];
}

export interface AttendanceRecord {
  id: string;
  subject: string;
  section: string;
  date: string; // YYYY-MM-DD
  records: Record<string, 'present' | 'absent' | 'late'>; // email -> status
  lastUpdated?: any;
}

export interface StudentGrade {
  id: string;
  studentEmail: string;
  studentName: string;
  subject: string;
  section: string;
  score: number; // 0-100
}

