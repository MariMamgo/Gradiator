
export type UserRole = "student" | "grader";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
