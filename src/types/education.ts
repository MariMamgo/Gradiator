
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
