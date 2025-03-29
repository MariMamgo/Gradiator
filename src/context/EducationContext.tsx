
import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  Subject, 
  Assignment, 
  Material, 
  Submission, 
  AppealStatus 
} from "@/types/education";
import { useToast } from "@/components/ui/use-toast";
import { databaseService } from "@/services/DatabaseService";

interface EducationContextType {
  subjects: Subject[];
  assignments: Assignment[];
  materials: Material[];
  addAssignment: (assignment: Omit<Assignment, "id">) => Promise<void>;
  updateAssignment: (assignment: Assignment) => Promise<void>;
  submitAssignment: (assignmentId: string, files: string[], userId: string, userName: string) => Promise<void>;
  submitAppeal: (submissionId: string, reason: string) => Promise<void>;
  reviewAppeal: (submissionId: string, newGrade: number, feedback: string) => Promise<void>;
  addMaterial: (material: Omit<Material, "id">) => Promise<void>;
  getSubjectById: (id: string) => Subject | undefined;
  getAssignmentsForSubject: (subjectId: string) => Assignment[];
  getMaterialsForSubject: (subjectId: string) => Material[];
  getSubmissionById: (submissionId: string) => Submission | undefined;
  getSubmissionsForAssignment: (assignmentId: string) => Submission[];
  gradeSubmission: (submissionId: string, grade: number, feedback: string) => Promise<void>;
  refreshData: () => Promise<void>;
  loading: boolean;
}

const EducationContext = createContext<EducationContextType>({
  subjects: [],
  assignments: [],
  materials: [],
  addAssignment: async () => {},
  updateAssignment: async () => {},
  submitAssignment: async () => {},
  submitAppeal: async () => {},
  reviewAppeal: async () => {},
  addMaterial: async () => {},
  getSubjectById: () => undefined,
  getAssignmentsForSubject: () => [],
  getMaterialsForSubject: () => [],
  getSubmissionById: () => undefined,
  getSubmissionsForAssignment: () => [],
  gradeSubmission: async () => {},
  refreshData: async () => {},
  loading: false,
});

export const EducationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const refreshData = async () => {
    setLoading(true);
    try {
      const [fetchedSubjects, fetchedAssignments, fetchedMaterials] = await Promise.all([
        databaseService.getSubjects(),
        databaseService.getAssignments(),
        databaseService.getMaterials()
      ]);
      
      setSubjects(fetchedSubjects);
      setAssignments(fetchedAssignments);
      setMaterials(fetchedMaterials);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load data. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addAssignment = async (assignmentData: Omit<Assignment, "id">) => {
    try {
      const newAssignment: Assignment = {
        ...assignmentData,
        id: "", // Will be set by the database service
        submissions: [],
        appealDeadline: new Date(new Date(assignmentData.dueDate).getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      };
      
      await databaseService.saveAssignment(newAssignment);
      await refreshData();
      
      toast({
        title: "Assignment Created",
        description: "The assignment has been successfully created.",
      });
    } catch (error) {
      console.error("Error adding assignment:", error);
      toast({
        title: "Error",
        description: "Failed to create assignment.",
        variant: "destructive"
      });
    }
  };

  const updateAssignment = async (updatedAssignment: Assignment) => {
    try {
      await databaseService.saveAssignment(updatedAssignment);
      await refreshData();
      
      toast({
        title: "Assignment Updated",
        description: "The assignment has been successfully updated.",
      });
    } catch (error) {
      console.error("Error updating assignment:", error);
      toast({
        title: "Error",
        description: "Failed to update assignment.",
        variant: "destructive"
      });
    }
  };

  const submitAssignment = async (assignmentId: string, files: string[], userId: string, userName: string) => {
    try {
      const submission: Omit<Submission, "id"> = {
        assignmentId,
        studentId: userId,
        studentName: userName,
        files,
        submittedAt: new Date().toISOString(),
        status: "submitted",
      };
      
      await databaseService.submitAssignment(assignmentId, submission);
      await refreshData();
      
      toast({
        title: "Assignment Submitted",
        description: "Your assignment has been successfully submitted.",
      });
    } catch (error) {
      console.error("Error submitting assignment:", error);
      toast({
        title: "Error",
        description: "Failed to submit assignment.",
        variant: "destructive"
      });
    }
  };
  
  const submitAppeal = async (submissionId: string, reason: string) => {
    try {
      await databaseService.submitAppeal(submissionId, reason);
      await refreshData();
      
      toast({
        title: "Appeal Submitted",
        description: "Your appeal has been successfully submitted.",
      });
    } catch (error) {
      console.error("Error submitting appeal:", error);
      toast({
        title: "Error",
        description: "Failed to submit appeal.",
        variant: "destructive"
      });
    }
  };
  
  const reviewAppeal = async (submissionId: string, newGrade: number, feedback: string) => {
    try {
      await databaseService.reviewAppeal(submissionId, newGrade, feedback);
      await refreshData();
      
      toast({
        title: "Appeal Reviewed",
        description: "The appeal has been successfully reviewed.",
      });
    } catch (error) {
      console.error("Error reviewing appeal:", error);
      toast({
        title: "Error",
        description: "Failed to review appeal.",
        variant: "destructive"
      });
    }
  };

  const addMaterial = async (materialData: Omit<Material, "id">) => {
    try {
      const newMaterial: Material = {
        ...materialData,
        id: "", // Will be set by the database service
      };
      
      await databaseService.saveMaterial(newMaterial);
      await refreshData();
      
      toast({
        title: "Material Added",
        description: "The class material has been successfully added.",
      });
    } catch (error) {
      console.error("Error adding material:", error);
      toast({
        title: "Error",
        description: "Failed to add material.",
        variant: "destructive"
      });
    }
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
  
  const gradeSubmission = async (submissionId: string, grade: number, feedback: string) => {
    try {
      await databaseService.gradeSubmission(submissionId, grade, feedback);
      await refreshData();
      
      toast({
        title: "Submission Graded",
        description: "The submission has been successfully graded.",
      });
    } catch (error) {
      console.error("Error grading submission:", error);
      toast({
        title: "Error",
        description: "Failed to grade submission.",
        variant: "destructive"
      });
    }
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
        refreshData,
        loading
      }}
    >
      {children}
    </EducationContext.Provider>
  );
};

export const useEducation = () => useContext(EducationContext);
