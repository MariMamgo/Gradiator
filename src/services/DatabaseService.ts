
import { Subject, Assignment, Material, Submission, Appeal } from "@/types/education";
import { User } from "@/types/auth";
import { apiService } from "./ApiService";

// This service now serves as an adapter between the frontend and the FastAPI backend
class DatabaseService {
  private storagePrefix = "gradiator_";
  private useLocalStorage = false; // Set to true for local storage, false for API

  // User management
  async getUsers(): Promise<User[]> {
    if (this.useLocalStorage) {
      return this.getItem("users", []);
    } else {
      return apiService.getUsers();
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
        console.error("Error fetching user:", error);
        return undefined;
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
        users.push(user);
      }
      
      await this.setItem("users", users);
      return user;
    } else {
      return apiService.saveUser(user);
    }
  }

  // Subject management
  async getSubjects(): Promise<Subject[]> {
    if (this.useLocalStorage) {
      return this.getItem("subjects", []);
    } else {
      return apiService.getSubjects();
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
        console.error("Error fetching subject:", error);
        return undefined;
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
      return apiService.saveSubject(subject);
    }
  }

  // Assignment management
  async getAssignments(): Promise<Assignment[]> {
    if (this.useLocalStorage) {
      return this.getItem("assignments", []);
    } else {
      return apiService.getAssignments();
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
        console.error("Error fetching assignment:", error);
        return undefined;
      }
    }
  }

  async getAssignmentsForSubject(subjectId: string): Promise<Assignment[]> {
    if (this.useLocalStorage) {
      const assignments = await this.getAssignments();
      return assignments.filter(assignment => assignment.subjectId === subjectId);
    } else {
      return apiService.getAssignmentsForSubject(subjectId);
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
      return apiService.saveAssignment(assignment, taskFile);
    }
  }

  // Material management
  async getMaterials(): Promise<Material[]> {
    if (this.useLocalStorage) {
      return this.getItem("materials", []);
    } else {
      return apiService.getMaterials();
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
        console.error("Error fetching material:", error);
        return undefined;
      }
    }
  }

  async getMaterialsForSubject(subjectId: string): Promise<Material[]> {
    if (this.useLocalStorage) {
      const materials = await this.getMaterials();
      return materials.filter(material => material.subjectId === subjectId);
    } else {
      return apiService.getMaterialsForSubject(subjectId);
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
      if (!file && !material.id) {
        throw new Error("File is required for new materials");
      }
      
      if (material.id) {
        // TODO: Handle material updates with file changes
        return material;
      } else {
        return apiService.saveMaterial(material, file!);
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
        console.error("Error fetching submission:", error);
        return undefined;
      }
    }
  }

  async getSubmissionsForAssignment(assignmentId: string): Promise<Submission[]> {
    if (this.useLocalStorage) {
      const assignment = await this.getAssignmentById(assignmentId);
      return assignment?.submissions || [];
    } else {
      return apiService.getSubmissionsForAssignment(assignmentId);
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
      return apiService.getSubmissionsByStudent(studentId);
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
      // Convert string file URLs to actual File objects (if using backend API)
      // This is a simplified example - actual implementation would depend on how files are handled
      if (Array.isArray(submission.files) && submission.files.length > 0 && typeof submission.files[0] === 'string') {
        console.warn("Cannot convert string file URLs to File objects for API submission");
        // In a real app, you'd need to have access to the actual File objects or upload them separately
        throw new Error("Direct file submission not implemented for API mode");
      }
      
      // For simplicity in this example, we're assuming submission.files contains File objects
      return apiService.submitAssignment(
        assignmentId, 
        submission.files as unknown as File[], 
        submission.studentId, 
        submission.studentName
      );
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
      return apiService.gradeSubmission(submissionId, grade, feedback);
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
      return apiService.submitAppeal(submissionId, reason);
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
      return apiService.reviewAppeal(submissionId, newGrade, feedback);
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
      }
    }
    // If using API, no need to initialize as the server will handle it
  }
}

// Singleton instance
export const databaseService = new DatabaseService();
