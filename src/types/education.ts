
export interface Subject {
  id: string;
  title: string;
  description: string;
  code: string;
  imageUrl?: string;
}

export interface Assignment {
  id: string;
  title: string;
  subjectId: string;
  description: string;
  dueDate: string;
  type: "homework" | "exam" | "quiz";
  status: "upcoming" | "submitted" | "graded";
  grade?: number;
  feedback?: string;
  maxGrade: number;
  criteria?: string;
  files?: string[];
  submissions?: Submission[];
  appealDeadline?: string;
  hasAppeal?: boolean;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  files: string[];
  submittedAt: string;
  status: "submitted" | "graded";
  grade?: number;
  feedback?: string;
  appeal?: Appeal;
}

export interface Appeal {
  id: string;
  submissionId: string;
  reason: string;
  status: "pending" | "reviewed";
  createdAt: string;
  reviewedAt?: string;
  originalGrade: number;
}

export interface Material {
  id: string;
  title: string;
  subjectId: string;
  description: string;
  type: "document" | "video" | "presentation" | "other";
  fileUrl: string;
  dateAdded: string;
}
