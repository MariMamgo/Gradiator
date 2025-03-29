
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "@/types/auth";

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string, role: UserRole) => void;
  register: (name: string, email: string, password: string, role: UserRole) => void;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  login: () => {},
  register: () => {},
  logout: () => {},
  isLoading: false,
  error: null,
});

// Mock user data for demo purposes
const MOCK_USERS: User[] = [
  {
    id: "1",
    name: "John Student",
    email: "student@example.com",
    role: "student",
  },
  {
    id: "2",
    name: "Jane Grader",
    email: "grader@example.com",
    role: "grader",
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check local storage for existing session
    const storedUser = localStorage.getItem("eduUser");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    setError(null);
    
    // Mock authentication
    setTimeout(() => {
      const user = MOCK_USERS.find(
        (u) => u.email === email && u.role === role
      );
      
      if (user) {
        setCurrentUser(user);
        localStorage.setItem("eduUser", JSON.stringify(user));
      } else {
        setError("Invalid credentials or user not found");
      }
      
      setIsLoading(false);
    }, 1000);
  };

  const register = (name: string, email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    setError(null);
    
    // Mock registration
    setTimeout(() => {
      const existingUser = MOCK_USERS.find((u) => u.email === email);
      
      if (existingUser) {
        setError("User with this email already exists");
      } else {
        const newUser: User = {
          id: (MOCK_USERS.length + 1).toString(),
          name,
          email,
          role,
        };
        
        MOCK_USERS.push(newUser);
        setCurrentUser(newUser);
        localStorage.setItem("eduUser", JSON.stringify(newUser));
      }
      
      setIsLoading(false);
    }, 1000);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("eduUser");
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        register,
        logout,
        isLoading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
