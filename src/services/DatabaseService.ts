
import { Subject, Assignment, Material, Submission, Appeal } from "@/types/education";
import { User } from "@/types/auth";

// This is a mock implementation that uses localStorage
// In a real application, this would connect to a backend API
class DatabaseService {
  private storagePrefix = "gradiator_";

  // User management
  async getUsers(): Promise<User[]> {
    return this.getItem("users", []);
  }

  async getUserById(id: string): Promise<User | undefined> {
    const users = await this.getUsers();
    return users.find(user => user.id === id);
  }

  async saveUser(user: User): Promise<User> {
    const users = await this.getUsers();
    const existingUserIndex = users.findIndex(u => u.id === user.id);
    
    if (existingUserIndex >= 0) {
      users[existingUserIndex] = user;
    } else {
      users.push(user);
    }
    
    await this.setItem("users", users);
    return user;
  }

  // Subject management
  async getSubjects(): Promise<Subject[]> {
    return this.getItem("subjects", []);
  }

  async getSubjectById(id: string): Promise<Subject | undefined> {
    const subjects = await this.getSubjects();
    return subjects.find(subject => subject.id === id);
  }

  async saveSubject(subject: Subject): Promise<Subject> {
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
  }

  // Assignment management
  async getAssignments(): Promise<Assignment[]> {
    return this.getItem("assignments", []);
  }

  async getAssignmentById(id: string): Promise<Assignment | undefined> {
    const assignments = await this.getAssignments();
    return assignments.find(assignment => assignment.id === id);
  }

  async getAssignmentsForSubject(subjectId: string): Promise<Assignment[]> {
    const assignments = await this.getAssignments();
    return assignments.filter(assignment => assignment.subjectId === subjectId);
  }

  async saveAssignment(assignment: Assignment): Promise<Assignment> {
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
  }

  // Material management
  async getMaterials(): Promise<Material[]> {
    return this.getItem("materials", []);
  }

  async getMaterialById(id: string): Promise<Material | undefined> {
    const materials = await this.getMaterials();
    return materials.find(material => material.id === id);
  }

  async getMaterialsForSubject(subjectId: string): Promise<Material[]> {
    const materials = await this.getMaterials();
    return materials.filter(material => material.subjectId === subjectId);
  }

  async saveMaterial(material: Material): Promise<Material> {
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
  }

  // Submission management
  async getSubmissionById(id: string): Promise<Submission | undefined> {
    const assignments = await this.getAssignments();
    for (const assignment of assignments) {
      if (!assignment.submissions) continue;
      const submission = assignment.submissions.find(s => s.id === id);
      if (submission) return submission;
    }
    return undefined;
  }

  async getSubmissionsForAssignment(assignmentId: string): Promise<Submission[]> {
    const assignment = await this.getAssignmentById(assignmentId);
    return assignment?.submissions || [];
  }

  async getSubmissionsByStudent(studentId: string): Promise<Submission[]> {
    const assignments = await this.getAssignments();
    const submissions: Submission[] = [];
    
    for (const assignment of assignments) {
      if (!assignment.submissions) continue;
      const studentSubmissions = assignment.submissions.filter(s => s.studentId === studentId);
      submissions.push(...studentSubmissions);
    }
    
    return submissions;
  }

  async submitAssignment(assignmentId: string, submission: Omit<Submission, "id">): Promise<Submission> {
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
  }

  async gradeSubmission(submissionId: string, grade: number, feedback: string): Promise<Submission> {
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
  }

  // Appeal management
  async submitAppeal(submissionId: string, reason: string): Promise<Appeal> {
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
  }

  async reviewAppeal(submissionId: string, newGrade: number, feedback: string): Promise<Submission> {
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
    const subjects = await this.getSubjects();
    if (subjects.length === 0) {
      // Import initial data
      const { MOCK_SUBJECTS, MOCK_ASSIGNMENTS, MOCK_MATERIALS } = await import('@/data/mockData');
      
      await this.setItem("subjects", MOCK_SUBJECTS);
      await this.setItem("assignments", MOCK_ASSIGNMENTS);
      await this.setItem("materials", MOCK_MATERIALS);
    }
  }
}

// Singleton instance
export const databaseService = new DatabaseService();
