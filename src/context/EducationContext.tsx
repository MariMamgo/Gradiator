
import React, { createContext, useContext, useState } from "react";
import { Subject, Assignment, Material } from "@/types/education";
import { useToast } from "@/components/ui/use-toast";

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
    criteria: "Correct analysis: 70%, Clarity: 30%"
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
    criteria: "Functionality: 40%, Design: 30%, Code quality: 30%"
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
    maxGrade: 100
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
  submitAssignment: (assignmentId: string, files: string[]) => void;
  addMaterial: (material: Omit<Material, "id">) => void;
  getSubjectById: (id: string) => Subject | undefined;
  getAssignmentsForSubject: (subjectId: string) => Assignment[];
  getMaterialsForSubject: (subjectId: string) => Material[];
}

const EducationContext = createContext<EducationContextType>({
  subjects: [],
  assignments: [],
  materials: [],
  addAssignment: () => {},
  updateAssignment: () => {},
  submitAssignment: () => {},
  addMaterial: () => {},
  getSubjectById: () => undefined,
  getAssignmentsForSubject: () => [],
  getMaterialsForSubject: () => [],
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

  const submitAssignment = (assignmentId: string, files: string[]) => {
    setAssignments(
      assignments.map((a) =>
        a.id === assignmentId
          ? { ...a, status: "submitted", files }
          : a
      )
    );
    
    toast({
      title: "Assignment Submitted",
      description: "Your assignment has been successfully submitted.",
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

  return (
    <EducationContext.Provider
      value={{
        subjects,
        assignments,
        materials,
        addAssignment,
        updateAssignment,
        submitAssignment,
        addMaterial,
        getSubjectById,
        getAssignmentsForSubject,
        getMaterialsForSubject,
      }}
    >
      {children}
    </EducationContext.Provider>
  );
};

export const useEducation = () => useContext(EducationContext);
