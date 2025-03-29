
export interface Subject {
  id: string;
  title: string;
  description: string;
  code: string;
  imageUrl?: string;
}

export type AssignmentStatus = "upcoming" | "submitted" | "graded";
export type AssignmentType = "homework" | "exam" | "quiz";

export interface Assignment {
  id: string;
  title: string;
  subjectId: string;
  description: string;
  dueDate: string;
  type: AssignmentType;
  status: AssignmentStatus;
  grade?: number;
  feedback?: string;
  maxGrade: number;
  criteria?: string;
  files?: string[];
  submissions?: Submission[];
  appealDeadline?: string;
  hasAppeal?: boolean;
}

export type SubmissionStatus = "submitted" | "graded";

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  files: string[];
  submittedAt: string;
  status: SubmissionStatus;
  grade?: number;
  feedback?: string;
  appeal?: Appeal;
}

export type AppealStatus = "pending" | "reviewed";

export interface Appeal {
  id: string;
  submissionId: string;
  reason: string;
  status: AppealStatus;
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
