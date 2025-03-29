import React, { createContext, useContext, useState } from "react";
import { 
  Subject, 
  Assignment, 
  Material, 
  Submission, 
  Appeal, 
  AssignmentStatus, 
  SubmissionStatus, 
  AppealStatus 
} from "@/types/education";
import { useToast } from "@/components/ui/use-toast";
import { toast } from "@/components/ui/use-toast";
import { User } from "@/types/auth";

// Mock data
const MOCK_SUBJECTS: Subject[] = [
  {
    id: "1",
    title: "Introduction to Computer Science",
    description: "Fundamental concepts of computer science and programming",
    code: "CS101",
    imageUrl: "/placeholder.svg"
  },
  {
    id: "2",
    title: "Data Structures",
    description: "Advanced data structures and algorithms",
    code: "CS202",
    imageUrl: "/placeholder.svg"
  },
  {
    id: "3",
    title: "Web Development",
    description: "Building modern web applications",
    code: "CS303",
    imageUrl: "/placeholder.svg"
  },
  {
    id: "4",
    title: "Mathematics for Computer Science",
    description: "Mathematical foundations for CS students",
    code: "MATH215",
    imageUrl: "/placeholder.svg"
  },
];

const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: "1",
    title: "Algorithm Analysis",
    subjectId: "2",
    description: "Analyze the time and space complexity of common algorithms",
    dueDate: "2023-12-15",
    type: "homework",
    status: "upcoming",
    maxGrade: 100,
    criteria: "Correct analysis: 70%, Clarity: 30%",
    submissions: []
  },
  {
    id: "2",
    title: "HTML/CSS Project",
    subjectId: "3",
    description: "Build a responsive website with HTML and CSS",
    dueDate: "2023-12-10",
    type: "homework",
    status: "graded",
    grade: 92,
    feedback: "Excellent work on the responsive design. Consider adding more accessibility features.",
    maxGrade: 100,
    criteria: "Functionality: 40%, Design: 30%, Code quality: 30%",
    submissions: [
      {
        id: "s1",
        assignmentId: "2",
        studentId: "student1",
        studentName: "John Doe",
        files: ["/placeholder.svg"],
        submittedAt: "2023-12-08",
        status: "graded",
        grade: 92,
        feedback: "Excellent work on the responsive design. Consider adding more accessibility features."
      }
    ],
    appealDeadline: "2023-12-15"
  },
  {
    id: "3",
    title: "Midterm Exam",
    subjectId: "1",
    description: "Covers topics from weeks 1-7",
    dueDate: "2023-11-05",
    type: "exam",
    status: "graded",
    grade: 85,
    feedback: "Good understanding of core concepts. Review section 3.",
    maxGrade: 100,
    submissions: [
      {
        id: "s2",
        assignmentId: "3",
        studentId: "student1",
        studentName: "John Doe",
        files: ["/placeholder.svg"],
        submittedAt: "2023-11-05",
        status: "graded",
        grade: 85,
        feedback: "Good understanding of core concepts. Review section 3."
      }
    ],
    appealDeadline: "2023-11-10"
  },
];

const MOCK_MATERIALS: Material[] = [
  {
    id: "1",
    title: "Introduction to Algorithms",
    subjectId: "2",
    description: "Slides covering basic algorithmic concepts",
    type: "presentation",
    fileUrl: "/placeholder.svg",
    dateAdded: "2023-09-15"
  },
  {
    id: "2",
    title: "HTML Basics",
    subjectId: "3",
    description: "Guide to HTML elements and structure",
    type: "document",
    fileUrl: "/placeholder.svg",
    dateAdded: "2023-09-10"
  },
];

interface EducationContextType {
  subjects: Subject[];
  assignments: Assignment[];
  materials: Material[];
  addAssignment: (assignment: Omit<Assignment, "id">) => void;
  updateAssignment: (assignment: Assignment) => void;
  submitAssignment: (assignmentId: string, files: string[], userId: string, userName: string) => void;
  submitAppeal: (submissionId: string, reason: string) => void;
  reviewAppeal: (submissionId: string, newGrade: number, feedback: string) => void;
  addMaterial: (material: Omit<Material, "id">) => void;
  getSubjectById: (id: string) => Subject | undefined;
  getAssignmentsForSubject: (subjectId: string) => Assignment[];
  getMaterialsForSubject: (subjectId: string) => Material[];
  getSubmissionById: (submissionId: string) => Submission | undefined;
  getSubmissionsForAssignment: (assignmentId: string) => Submission[];
  gradeSubmission: (submissionId: string, grade: number, feedback: string) => void;
}

const EducationContext = createContext<EducationContextType>({
  subjects: [],
  assignments: [],
  materials: [],
  addAssignment: () => {},
  updateAssignment: () => {},
  submitAssignment: () => {},
  submitAppeal: () => {},
  reviewAppeal: () => {},
  addMaterial: () => {},
  getSubjectById: () => undefined,
  getAssignmentsForSubject: () => [],
  getMaterialsForSubject: () => [],
  getSubmissionById: () => undefined,
  getSubmissionsForAssignment: () => [],
  gradeSubmission: () => {},
});

export const EducationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subjects, setSubjects] = useState<Subject[]>(MOCK_SUBJECTS);
  const [assignments, setAssignments] = useState<Assignment[]>(MOCK_ASSIGNMENTS);
  const [materials, setMaterials] = useState<Material[]>(MOCK_MATERIALS);
  const { toast } = useToast();

  const addAssignment = (assignmentData: Omit<Assignment, "id">) => {
    const newAssignment: Assignment = {
      ...assignmentData,
      id: (assignments.length + 1).toString(),
      submissions: [],
      appealDeadline: new Date(new Date(assignmentData.dueDate).getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    };
    
    setAssignments([...assignments, newAssignment]);
    toast({
      title: "Assignment Created",
      description: "The assignment has been successfully created.",
    });
  };

  const updateAssignment = (updatedAssignment: Assignment) => {
    setAssignments(
      assignments.map((a) =>
        a.id === updatedAssignment.id ? updatedAssignment : a
      )
    );
    
    toast({
      title: "Assignment Updated",
      description: "The assignment has been successfully updated.",
    });
  };

  const submitAssignment = (assignmentId: string, files: string[], userId: string, userName: string) => {
    const updatedAssignments = assignments.map(assignment => {
      if (assignment.id === assignmentId) {
        const newSubmission: Submission = {
          id: `s${Date.now()}`,
          assignmentId,
          studentId: userId,
          studentName: userName,
          files,
          submittedAt: new Date().toISOString(),
          status: "submitted" as SubmissionStatus,
          grade: 0,
          feedback: ""
        };
        
        return {
          ...assignment,
          status: "submitted" as AssignmentStatus,
          submissions: [...(assignment.submissions || []), newSubmission]
        };
      }
      return assignment;
    });
    
    setAssignments(updatedAssignments);
    
    toast({
      title: "Assignment Submitted",
      description: "Your assignment has been successfully submitted.",
    });
  };
  
  const submitAppeal = (submissionId: string, reason: string) => {
    const updatedAssignments = assignments.map(assignment => {
      if (!assignment.submissions) return assignment;
      
      const submissionIndex = assignment.submissions.findIndex(s => s.id === submissionId);
      if (submissionIndex === -1) return assignment;
      
      const updatedSubmissions = [...assignment.submissions];
      const submission = updatedSubmissions[submissionIndex];
      
      if (!submission.grade) return assignment;
      
      const appeal: Appeal = {
        id: `a${Date.now()}`,
        submissionId,
        reason,
        status: "pending",
        createdAt: new Date().toISOString(),
        originalGrade: submission.grade
      };
      
      updatedSubmissions[submissionIndex] = {
        ...submission,
        appeal
      };
      
      return {
        ...assignment,
        submissions: updatedSubmissions,
        hasAppeal: true
      };
    });
    
    setAssignments(updatedAssignments);
    
    toast({
      title: "Appeal Submitted",
      description: "Your appeal has been successfully submitted.",
    });
  };
  
  const reviewAppeal = (submissionId: string, newGrade: number, feedback: string) => {
    const updatedAssignments = assignments.map(assignment => {
      if (!assignment.submissions) return assignment;
      
      const submissionIndex = assignment.submissions.findIndex(s => s.id === submissionId);
      if (submissionIndex === -1) return assignment;
      
      const updatedSubmissions = [...assignment.submissions];
      const submission = updatedSubmissions[submissionIndex];
      
      if (!submission.appeal) return assignment;
      
      updatedSubmissions[submissionIndex] = {
        ...submission,
        grade: newGrade,
        feedback,
        appeal: {
          ...submission.appeal,
          status: "reviewed" as AppealStatus,
          reviewedAt: new Date().toISOString()
        }
      };
      
      const allAppealsReviewed = updatedSubmissions.every(s => !s.appeal || s.appeal.status === "reviewed");
      
      return {
        ...assignment,
        submissions: updatedSubmissions,
        hasAppeal: !allAppealsReviewed
      };
    });
    
    setAssignments(updatedAssignments);
    
    toast({
      title: "Appeal Reviewed",
      description: "The appeal has been successfully reviewed.",
    });
  };

  const addMaterial = (materialData: Omit<Material, "id">) => {
    const newMaterial: Material = {
      ...materialData,
      id: (materials.length + 1).toString(),
    };
    
    setMaterials([...materials, newMaterial]);
    toast({
      title: "Material Added",
      description: "The class material has been successfully added.",
    });
  };

  const getSubjectById = (id: string) => {
    return subjects.find((s) => s.id === id);
  };

  const getAssignmentsForSubject = (subjectId: string) => {
    return assignments.filter((a) => a.subjectId === subjectId);
  };

  const getMaterialsForSubject = (subjectId: string) => {
    return materials.filter((m) => m.subjectId === subjectId);
  };
  
  const getSubmissionById = (submissionId: string) => {
    for (const assignment of assignments) {
      if (!assignment.submissions) continue;
      const submission = assignment.submissions.find(s => s.id === submissionId);
      if (submission) return submission;
    }
    return undefined;
  };
  
  const getSubmissionsForAssignment = (assignmentId: string) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    return assignment?.submissions || [];
  };
  
  const gradeSubmission = (submissionId: string, grade: number, feedback: string) => {
    const updatedAssignments = assignments.map(assignment => {
      if (!assignment.submissions) return assignment;
      
      const submissionIndex = assignment.submissions.findIndex(s => s.id === submissionId);
      if (submissionIndex === -1) return assignment;
      
      const updatedSubmissions = [...assignment.submissions];
      
      updatedSubmissions[submissionIndex] = {
        ...updatedSubmissions[submissionIndex],
        status: "graded" as SubmissionStatus,
        grade,
        feedback
      };
      
      return {
        ...assignment,
        status: "graded" as AssignmentStatus,
        submissions: updatedSubmissions
      };
    });
    
    setAssignments(updatedAssignments);
    
    toast({
      title: "Submission Graded",
      description: "The submission has been successfully graded.",
    });
  };

  return (
    <EducationContext.Provider
      value={{
        subjects,
        assignments,
        materials,
        addAssignment,
        updateAssignment,
        submitAssignment,
        submitAppeal,
        reviewAppeal,
        addMaterial,
        getSubjectById,
        getAssignmentsForSubject,
        getMaterialsForSubject,
        getSubmissionById,
        getSubmissionsForAssignment,
        gradeSubmission,
      }}
    >
      {children}
    </EducationContext.Provider>
  );
};

export const useEducation = () => useContext(EducationContext);
