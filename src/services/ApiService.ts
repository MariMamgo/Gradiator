
import { Assignment, Material, Subject, Submission, Appeal } from "@/types/education";
import { User } from "@/types/auth";

const API_URL = "http://localhost:8000";

class ApiService {
  // User endpoints
  async getUsers(): Promise<User[]> {
    const response = await fetch(`${API_URL}/api/users`);
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }
    return response.json();
  }

  async getUserById(id: string): Promise<User> {
    const response = await fetch(`${API_URL}/api/users/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }
    return response.json();
  }

  async saveUser(user: User): Promise<User> {
    const method = user.id ? "PUT" : "POST";
    const url = user.id ? `${API_URL}/api/users/${user.id}` : `${API_URL}/api/users`;
    
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save user: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Subject endpoints
  async getSubjects(): Promise<Subject[]> {
    const response = await fetch(`${API_URL}/api/subjects`);
    if (!response.ok) {
      throw new Error(`Failed to fetch subjects: ${response.statusText}`);
    }
    return response.json();
  }

  async getSubjectById(id: string): Promise<Subject> {
    const response = await fetch(`${API_URL}/api/subjects/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch subject: ${response.statusText}`);
    }
    return response.json();
  }

  async saveSubject(subject: Subject): Promise<Subject> {
    const method = subject.id ? "PUT" : "POST";
    const url = subject.id ? `${API_URL}/api/subjects/${subject.id}` : `${API_URL}/api/subjects`;
    
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subject),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save subject: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Assignment endpoints
  async getAssignments(): Promise<Assignment[]> {
    const response = await fetch(`${API_URL}/api/assignments`);
    if (!response.ok) {
      throw new Error(`Failed to fetch assignments: ${response.statusText}`);
    }
    return response.json();
  }

  async getAssignmentById(id: string): Promise<Assignment> {
    const response = await fetch(`${API_URL}/api/assignments/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch assignment: ${response.statusText}`);
    }
    return response.json();
  }

  async getAssignmentsForSubject(subjectId: string): Promise<Assignment[]> {
    const response = await fetch(`${API_URL}/api/subjects/${subjectId}/assignments`);
    if (!response.ok) {
      throw new Error(`Failed to fetch assignments for subject: ${response.statusText}`);
    }
    return response.json();
  }

  async saveAssignment(assignment: Assignment, taskFile?: File): Promise<Assignment> {
    const formData = new FormData();
    
    if (assignment.id) {
      // If assignment exists, use PUT method with JSON
      const response = await fetch(`${API_URL}/api/assignments/${assignment.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assignment),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update assignment: ${response.statusText}`);
      }
      
      return response.json();
    } else {
      // If new assignment, use POST method with FormData
      formData.append("title", assignment.title);
      formData.append("subject_id", assignment.subjectId);
      formData.append("description", assignment.description);
      formData.append("due_date", assignment.dueDate);
      formData.append("assignment_type", assignment.type);
      formData.append("max_grade", assignment.maxGrade.toString());
      
      if (assignment.criteria) {
        formData.append("criteria", assignment.criteria);
      }
      
      if (taskFile) {
        formData.append("task_file", taskFile);
      }
      
      const response = await fetch(`${API_URL}/api/assignments`, {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create assignment: ${response.statusText}`);
      }
      
      return response.json();
    }
  }

  // Material endpoints
  async getMaterials(): Promise<Material[]> {
    const response = await fetch(`${API_URL}/api/materials`);
    if (!response.ok) {
      throw new Error(`Failed to fetch materials: ${response.statusText}`);
    }
    return response.json();
  }

  async getMaterialById(id: string): Promise<Material> {
    const response = await fetch(`${API_URL}/api/materials/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch material: ${response.statusText}`);
    }
    return response.json();
  }

  async getMaterialsForSubject(subjectId: string): Promise<Material[]> {
    const response = await fetch(`${API_URL}/api/subjects/${subjectId}/materials`);
    if (!response.ok) {
      throw new Error(`Failed to fetch materials for subject: ${response.statusText}`);
    }
    return response.json();
  }

  async saveMaterial(material: Omit<Material, "id">, file: File): Promise<Material> {
    const formData = new FormData();
    formData.append("title", material.title);
    formData.append("subject_id", material.subjectId);
    formData.append("description", material.description);
    formData.append("material_type", material.type);
    formData.append("file", file);
    
    const response = await fetch(`${API_URL}/api/materials`, {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save material: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Submission endpoints
  async getSubmissionById(id: string): Promise<Submission> {
    const response = await fetch(`${API_URL}/api/submissions/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch submission: ${response.statusText}`);
    }
    return response.json();
  }

  async getSubmissionsForAssignment(assignmentId: string): Promise<Submission[]> {
    const response = await fetch(`${API_URL}/api/assignments/${assignmentId}/submissions`);
    if (!response.ok) {
      throw new Error(`Failed to fetch submissions for assignment: ${response.statusText}`);
    }
    return response.json();
  }

  async getSubmissionsByStudent(studentId: string): Promise<Submission[]> {
    const response = await fetch(`${API_URL}/api/students/${studentId}/submissions`);
    if (!response.ok) {
      throw new Error(`Failed to fetch submissions for student: ${response.statusText}`);
    }
    return response.json();
  }

  async submitAssignment(assignmentId: string, files: File[], userId: string, userName: string): Promise<Submission> {
    const formData = new FormData();
    formData.append("student_id", userId);
    formData.append("student_name", userName);
    
    for (const file of files) {
      formData.append("files", file);
    }
    
    const response = await fetch(`${API_URL}/api/assignments/${assignmentId}/submit`, {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Failed to submit assignment: ${response.statusText}`);
    }
    
    return response.json();
  }

  async gradeSubmission(submissionId: string, grade: number, feedback: string): Promise<Submission> {
    const response = await fetch(`${API_URL}/api/submissions/${submissionId}/grade`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ grade, feedback }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to grade submission: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Appeal endpoints
  async submitAppeal(submissionId: string, reason: string): Promise<Appeal> {
    const response = await fetch(`${API_URL}/api/submissions/${submissionId}/appeal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to submit appeal: ${response.statusText}`);
    }
    
    return response.json();
  }

  async reviewAppeal(submissionId: string, newGrade: number, feedback: string): Promise<Submission> {
    const response = await fetch(`${API_URL}/api/submissions/${submissionId}/review-appeal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ grade: newGrade, feedback }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to review appeal: ${response.statusText}`);
    }
    
    return response.json();
  }

  // AI Grading endpoint
  async gradeHomework(taskFile: File, solutionFile: File, criteria: string): Promise<{ score: number, feedback: string }> {
    const formData = new FormData();
    formData.append("task_file", taskFile);
    formData.append("solution_file", solutionFile);
    formData.append("criteria", criteria);
    
    const response = await fetch(`${API_URL}/api/grade`, {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail?.error || `Failed to grade homework: ${response.statusText}`);
    }
    
    return response.json();
  }
}

// Singleton instance
export const apiService = new ApiService();
