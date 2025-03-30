import { Subject, Assignment, Material, Submission, Appeal } from "@/types/education";
import { User } from "@/types/auth";
import { apiService } from "./ApiService";
import { toast } from "@/hooks/use-toast";

// This service serves as an adapter between the frontend and the FastAPI backend
// with fallback to localStorage when the API is unavailable
class DatabaseService {
  private storagePrefix = "gradiator_";
  private useLocalStorage = true; // Default to localStorage for offline functionality

  constructor() {
    // Check if API is available
    this.checkApiAvailability();
  }

  // Check if the API is available and set useLocalStorage accordingly
  private async checkApiAvailability() {
    try {
      const response = await fetch("http://localhost:8000", { 
        method: "GET",
        headers: { "Content-Type": "application/json" },
        // Short timeout to quickly determine if the API is available
        signal: AbortSignal.timeout(3000)
      });
      
      if (response.ok) {
        console.log("API is available. Using API for data persistence.");
        this.useLocalStorage = false;
      } else {
        console.warn("API returned an error. Falling back to localStorage.");
        this.useLocalStorage = true;
        toast({
          title: "Backend Unavailable",
          description: "Using local storage for data persistence. Start the backend server for full functionality.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.warn("API unavailable. Falling back to localStorage:", error);
      this.useLocalStorage = true;
      toast({
        title: "Backend Unavailable",
        description: "Using local storage for data persistence. Start the backend server for full functionality.",
        variant: "destructive"
      });
    }
  }

  // User management
  async getUsers(): Promise<User[]> {
    if (this.useLocalStorage) {
      return this.getItem("users", []);
    } else {
      try {
        return await apiService.getUsers();
      } catch (error) {
        console.error("Error fetching users from API, falling back to localStorage:", error);
        return this.getItem("users", []);
      }
    }
  }

  async getUserById(id: string): Promise<User | undefined> {
    if (this.useLocalStorage) {
      const users = await this.getUsers();
      return users.find(user => user.id === id);
    } else {
      try {
        return await apiService.getUserById(id);
      } catch (error) {
        console.error("Error fetching user from API, falling back to localStorage:", error);
        const users = await this.getItem("users", []);
        return users.find(user => user.id === id);
      }
    }
  }

  async saveUser(user: User): Promise<User> {
    if (this.useLocalStorage) {
      const users = await this.getUsers();
      const existingUserIndex = users.findIndex(u => u.id === user.id);
      
      if (existingUserIndex >= 0) {
        users[existingUserIndex] = user;
      } else {
        // If new user, generate ID
        if (!user.id) {
          user.id = Date.now().toString();
        }
        users.push(user);
      }
      
      await this.setItem("users", users);
      return user;
    } else {
      try {
        return await apiService.saveUser(user);
      } catch (error) {
        console.error("Error saving user to API, falling back to localStorage:", error);
        return this.saveUser(user);
      }
    }
  }

  // Subject management
  async getSubjects(): Promise<Subject[]> {
    if (this.useLocalStorage) {
      return this.getItem("subjects", []);
    } else {
      try {
        return await apiService.getSubjects();
      } catch (error) {
        console.error("Error fetching subjects from API, falling back to localStorage:", error);
        return this.getItem("subjects", []);
      }
    }
  }

  async getSubjectById(id: string): Promise<Subject | undefined> {
    if (this.useLocalStorage) {
      const subjects = await this.getSubjects();
      return subjects.find(subject => subject.id === id);
    } else {
      try {
        return await apiService.getSubjectById(id);
      } catch (error) {
        console.error("Error fetching subject from API, falling back to localStorage:", error);
        const subjects = await this.getItem("subjects", []);
        return subjects.find(subject => subject.id === id);
      }
    }
  }

  async saveSubject(subject: Subject): Promise<Subject> {
    if (this.useLocalStorage) {
      const subjects = await this.getSubjects();
      const existingIndex = subjects.findIndex(s => s.id === subject.id);
      
      if (existingIndex >= 0) {
        subjects[existingIndex] = subject;
      } else {
        // If new subject, generate ID
        if (!subject.id) {
          subject.id = Date.now().toString();
        }
        subjects.push(subject);
      }
      
      await this.setItem("subjects", subjects);
      return subject;
    } else {
      try {
        return await apiService.saveSubject(subject);
      } catch (error) {
        console.error("Error saving subject to API, falling back to localStorage:", error);
        this.useLocalStorage = true;
        return this.saveSubject(subject);
      }
    }
  }

  // Assignment management
  async getAssignments(): Promise<Assignment[]> {
    if (this.useLocalStorage) {
      return this.getItem("assignments", []);
    } else {
      try {
        return await apiService.getAssignments();
      } catch (error) {
        console.error("Error fetching assignments from API, falling back to localStorage:", error);
        return this.getItem("assignments", []);
      }
    }
  }

  async getAssignmentById(id: string): Promise<Assignment | undefined> {
    if (this.useLocalStorage) {
      const assignments = await this.getAssignments();
      return assignments.find(assignment => assignment.id === id);
    } else {
      try {
        return await apiService.getAssignmentById(id);
      } catch (error) {
        console.error("Error fetching assignment from API, falling back to localStorage:", error);
        const assignments = await this.getItem("assignments", []);
        return assignments.find(assignment => assignment.id === id);
      }
    }
  }

  async getAssignmentsForSubject(subjectId: string): Promise<Assignment[]> {
    if (this.useLocalStorage) {
      const assignments = await this.getAssignments();
      return assignments.filter(assignment => assignment.subjectId === subjectId);
    } else {
      try {
        return await apiService.getAssignmentsForSubject(subjectId);
      } catch (error) {
        console.error("Error fetching assignments for subject from API, falling back to localStorage:", error);
        const assignments = await this.getItem("assignments", []);
        return assignments.filter(assignment => assignment.subjectId === subjectId);
      }
    }
  }

  async saveAssignment(assignment: Assignment, taskFile?: File): Promise<Assignment> {
    if (this.useLocalStorage) {
      const assignments = await this.getAssignments();
      const existingIndex = assignments.findIndex(a => a.id === assignment.id);
      
      if (existingIndex >= 0) {
        assignments[existingIndex] = assignment;
      } else {
        // If new assignment, generate ID
        if (!assignment.id) {
          assignment.id = Date.now().toString();
        }
        assignments.push(assignment);
      }
      
      await this.setItem("assignments", assignments);
      return assignment;
    } else {
      try {
        return await apiService.saveAssignment(assignment, taskFile);
      } catch (error) {
        console.error("Error saving assignment to API, falling back to localStorage:", error);
        this.useLocalStorage = true;
        return this.saveAssignment(assignment);
      }
    }
  }

  // Material management
  async getMaterials(): Promise<Material[]> {
    if (this.useLocalStorage) {
      return this.getItem("materials", []);
    } else {
      try {
        return await apiService.getMaterials();
      } catch (error) {
        console.error("Error fetching materials from API, falling back to localStorage:", error);
        return this.getItem("materials", []);
      }
    }
  }

  async getMaterialById(id: string): Promise<Material | undefined> {
    if (this.useLocalStorage) {
      const materials = await this.getMaterials();
      return materials.find(material => material.id === id);
    } else {
      try {
        return await apiService.getMaterialById(id);
      } catch (error) {
        console.error("Error fetching material from API, falling back to localStorage:", error);
        const materials = await this.getItem("materials", []);
        return materials.find(material => material.id === id);
      }
    }
  }

  async getMaterialsForSubject(subjectId: string): Promise<Material[]> {
    if (this.useLocalStorage) {
      const materials = await this.getMaterials();
      return materials.filter(material => material.subjectId === subjectId);
    } else {
      try {
        return await apiService.getMaterialsForSubject(subjectId);
      } catch (error) {
        console.error("Error fetching materials for subject from API, falling back to localStorage:", error);
        const materials = await this.getItem("materials", []);
        return materials.filter(material => material.subjectId === subjectId);
      }
    }
  }

  async saveMaterial(material: Material, file?: File): Promise<Material> {
    if (this.useLocalStorage) {
      const materials = await this.getMaterials();
      const existingIndex = materials.findIndex(m => m.id === material.id);
      
      if (existingIndex >= 0) {
        materials[existingIndex] = material;
      } else {
        // If new material, generate ID
        if (!material.id) {
          material.id = Date.now().toString();
        }
        materials.push(material);
      }
      
      await this.setItem("materials", materials);
      return material;
    } else {
      try {
        if (!file && !material.id) {
          throw new Error("File is required for new materials");
        }
        
        if (material.id) {
          return await apiService.updateMaterial(material);
        } else {
          return await apiService.saveMaterial(material, file!);
        }
      } catch (error) {
        console.error("Error saving material to API, falling back to localStorage:", error);
        this.useLocalStorage = true;
        return this.saveMaterial(material);
      }
    }
  }

  // Submission management
  async getSubmissionById(id: string): Promise<Submission | undefined> {
    if (this.useLocalStorage) {
      const assignments = await this.getAssignments();
      for (const assignment of assignments) {
        if (!assignment.submissions) continue;
        const submission = assignment.submissions.find(s => s.id === id);
        if (submission) return submission;
      }
      return undefined;
    } else {
      try {
        return await apiService.getSubmissionById(id);
      } catch (error) {
        console.error("Error fetching submission from API, falling back to localStorage:", error);
        const assignments = await this.getItem("assignments", []);
        for (const assignment of assignments) {
          if (!assignment.submissions) continue;
          const submission = assignment.submissions.find(s => s.id === id);
          if (submission) return submission;
        }
        return undefined;
      }
    }
  }

  async getSubmissionsForAssignment(assignmentId: string): Promise<Submission[]> {
    if (this.useLocalStorage) {
      const assignment = await this.getAssignmentById(assignmentId);
      return assignment?.submissions || [];
    } else {
      try {
        return await apiService.getSubmissionsForAssignment(assignmentId);
      } catch (error) {
        console.error("Error fetching submissions for assignment from API, falling back to localStorage:", error);
        const assignment = await this.getAssignmentById(assignmentId);
        return assignment?.submissions || [];
      }
    }
  }

  async getSubmissionsByStudent(studentId: string): Promise<Submission[]> {
    if (this.useLocalStorage) {
      const assignments = await this.getAssignments();
      const submissions: Submission[] = [];
      
      for (const assignment of assignments) {
        if (!assignment.submissions) continue;
        const studentSubmissions = assignment.submissions.filter(s => s.studentId === studentId);
        submissions.push(...studentSubmissions);
      }
      
      return submissions;
    } else {
      try {
        return await apiService.getSubmissionsByStudent(studentId);
      } catch (error) {
        console.error("Error fetching submissions by student from API, falling back to localStorage:", error);
        const assignments = await this.getItem("assignments", []);
        const submissions: Submission[] = [];
        
        for (const assignment of assignments) {
          if (!assignment.submissions) continue;
          const studentSubmissions = assignment.submissions.filter(s => s.studentId === studentId);
          submissions.push(...studentSubmissions);
        }
        
        return submissions;
      }
    }
  }

  async submitAssignment(assignmentId: string, submission: Omit<Submission, "id">): Promise<Submission> {
    if (this.useLocalStorage) {
      const assignments = await this.getAssignments();
      const assignmentIndex = assignments.findIndex(a => a.id === assignmentId);
      
      if (assignmentIndex === -1) {
        throw new Error(`Assignment with ID ${assignmentId} not found`);
      }
      
      const newSubmission: Submission = {
        ...submission,
        id: `s${Date.now()}`,
      };
      
      const assignment = assignments[assignmentIndex];
      assignment.status = "submitted";
      
      if (!assignment.submissions) {
        assignment.submissions = [];
      }
      
      assignment.submissions.push(newSubmission);
      await this.setItem("assignments", assignments);
      
      return newSubmission;
    } else {
      try {
        // Convert string file URLs to actual File objects (if using backend API)
        if (Array.isArray(submission.files) && submission.files.length > 0 && typeof submission.files[0] === 'string') {
          console.warn("Cannot convert string file URLs to File objects for API submission");
          throw new Error("Direct file submission not implemented for API mode");
        }
        
        return await apiService.submitAssignment(
          assignmentId, 
          submission.files as unknown as File[], 
          submission.studentId, 
          submission.studentName
        );
      } catch (error) {
        console.error("Error submitting assignment to API, falling back to localStorage:", error);
        this.useLocalStorage = true;
        return this.submitAssignment(assignmentId, submission);
      }
    }
  }

  async gradeSubmission(submissionId: string, grade: number, feedback: string): Promise<Submission> {
    if (this.useLocalStorage) {
      const assignments = await this.getAssignments();
      let updatedSubmission: Submission | undefined;
      
      const updatedAssignments = assignments.map(assignment => {
        if (!assignment.submissions) return assignment;
        
        const submissionIndex = assignment.submissions.findIndex(s => s.id === submissionId);
        if (submissionIndex === -1) return assignment;
        
        const updatedSubmissions = [...assignment.submissions];
        
        updatedSubmissions[submissionIndex] = {
          ...updatedSubmissions[submissionIndex],
          status: "graded",
          grade,
          feedback
        };
        
        updatedSubmission = updatedSubmissions[submissionIndex];
        
        return {
          ...assignment,
          status: "graded",
          submissions: updatedSubmissions
        };
      });
      
      await this.setItem("assignments", updatedAssignments);
      
      if (!updatedSubmission) {
        throw new Error(`Submission with ID ${submissionId} not found`);
      }
      
      return updatedSubmission;
    } else {
      try {
        return await apiService.gradeSubmission(submissionId, grade, feedback);
      } catch (error) {
        console.error("Error grading submission on API, falling back to localStorage:", error);
        this.useLocalStorage = true;
        return this.gradeSubmission(submissionId, grade, feedback);
      }
    }
  }

  // Appeal management
  async submitAppeal(submissionId: string, reason: string): Promise<Appeal> {
    if (this.useLocalStorage) {
      const assignments = await this.getAssignments();
      let createdAppeal: Appeal | undefined;
      
      const updatedAssignments = assignments.map(assignment => {
        if (!assignment.submissions) return assignment;
        
        const submissionIndex = assignment.submissions.findIndex(s => s.id === submissionId);
        if (submissionIndex === -1) return assignment;
        
        const submission = assignment.submissions[submissionIndex];
        
        if (!submission.grade) return assignment;
        
        const appeal: Appeal = {
          id: `a${Date.now()}`,
          submissionId,
          reason,
          status: "pending",
          createdAt: new Date().toISOString(),
          originalGrade: submission.grade
        };
        
        createdAppeal = appeal;
        
        const updatedSubmissions = [...assignment.submissions];
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
      
      await this.setItem("assignments", updatedAssignments);
      
      if (!createdAppeal) {
        throw new Error(`Could not create appeal for submission ${submissionId}`);
      }
      
      return createdAppeal;
    } else {
      try {
        return await apiService.submitAppeal(submissionId, reason);
      } catch (error) {
        console.error("Error submitting appeal to API, falling back to localStorage:", error);
        this.useLocalStorage = true;
        return this.submitAppeal(submissionId, reason);
      }
    }
  }

  async reviewAppeal(submissionId: string, newGrade: number, feedback: string): Promise<Submission> {
    if (this.useLocalStorage) {
      const assignments = await this.getAssignments();
      let updatedSubmission: Submission | undefined;
      
      const updatedAssignments = assignments.map(assignment => {
        if (!assignment.submissions) return assignment;
        
        const submissionIndex = assignment.submissions.findIndex(s => s.id === submissionId);
        if (submissionIndex === -1) return assignment;
        
        const submission = assignment.submissions[submissionIndex];
        
        if (!submission.appeal) return assignment;
        
        const updatedSubmissions = [...assignment.submissions];
        updatedSubmissions[submissionIndex] = {
          ...submission,
          grade: newGrade,
          feedback,
          appeal: {
            ...submission.appeal,
            status: "reviewed",
            reviewedAt: new Date().toISOString()
          }
        };
        
        updatedSubmission = updatedSubmissions[submissionIndex];
        
        const allAppealsReviewed = updatedSubmissions.every(s => 
          !s.appeal || s.appeal.status === "reviewed"
        );
        
        return {
          ...assignment,
          submissions: updatedSubmissions,
          hasAppeal: !allAppealsReviewed
        };
      });
      
      await this.setItem("assignments", updatedAssignments);
      
      if (!updatedSubmission) {
        throw new Error(`Submission with ID ${submissionId} not found`);
      }
      
      return updatedSubmission;
    } else {
      try {
        return await apiService.reviewAppeal(submissionId, newGrade, feedback);
      } catch (error) {
        console.error("Error reviewing appeal on API, falling back to localStorage:", error);
        this.useLocalStorage = true;
        return this.reviewAppeal(submissionId, newGrade, feedback);
      }
    }
  }

  // AI Grading
  async gradeHomework(taskFile: File, solutionFile: File, criteria: string): Promise<{ score: number, feedback: string }> {
    try {
      if (this.useLocalStorage) {
        // Generate a random score between 70 and 100 as a fallback
        const randomScore = Math.floor(Math.random() * 31) + 70;
        return {
          score: randomScore,
          feedback: "This is an auto-generated grade. For accurate AI grading, please run the FastAPI backend server."
        };
      }
      
      return await apiService.gradeHomework(taskFile, solutionFile, criteria);
    } catch (error) {
      console.error("Error using AI grading service:", error);
      // Fall back to random grading if API fails
      const randomScore = Math.floor(Math.random() * 31) + 70;
      return {
        score: randomScore,
        feedback: "AI grading service is unavailable. This is a randomly generated score. Please try again later or start the FastAPI backend."
      };
    }
  }

  // Helper methods to interact with localStorage
  private async getItem<T>(key: string, defaultValue: T): Promise<T> {
    const storedValue = localStorage.getItem(this.storagePrefix + key);
    if (!storedValue) {
      return defaultValue;
    }
    try {
      return JSON.parse(storedValue) as T;
    } catch (error) {
      console.error(`Error parsing JSON for key ${key}:`, error);
      return defaultValue;
    }
  }

  private async setItem<T>(key: string, value: T): Promise<void> {
    try {
      localStorage.setItem(this.storagePrefix + key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error storing data for key ${key}:`, error);
      throw error;
    }
  }

  // Initialize with sample data if empty
  async initializeIfEmpty(): Promise<void> {
    if (this.useLocalStorage) {
      const subjects = await this.getSubjects();
      if (subjects.length === 0) {
        // Import initial data
        const { MOCK_SUBJECTS, MOCK_ASSIGNMENTS, MOCK_MATERIALS } = await import('@/data/mockData');
        
        await this.setItem("subjects", MOCK_SUBJECTS);
        await this.setItem("assignments", MOCK_ASSIGNMENTS);
        await this.setItem("materials", MOCK_MATERIALS);
        
        console.log("Initialized localStorage with sample data");
      }
    }
    // If using API, no need to initialize as the server will handle it
  }
}

// Singleton instance
export const databaseService = new DatabaseService();
