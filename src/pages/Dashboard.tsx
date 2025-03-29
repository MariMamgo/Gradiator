
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEducation } from "@/context/EducationContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Book, Bookmark, FileText, LogOut, User } from "lucide-react";
import Navbar from "@/components/Navbar";

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const { subjects } = useEducation();
  const navigate = useNavigate();

  if (!currentUser) {
    navigate("/");
    return null;
  }

  const handleSubjectClick = (subjectId: string) => {
    navigate(`/subject/${subjectId}`);
  };

  return (
    <div className="min-h-screen bg-edu-background">
      <Navbar />

      <div className="edu-container">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>
                      {currentUser.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{currentUser.name}</CardTitle>
                    <CardDescription>
                      {currentUser.role === "student" ? "Student" : "Grader"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User size={18} />
                    <span>{currentUser.email}</span>
                  </div>
                  {currentUser.role === "student" && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Book size={18} />
                      <span>{subjects.length} Enrolled Subjects</span>
                    </div>
                  )}
                  {currentUser.role === "grader" && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText size={18} />
                      <span>{subjects.length} Teaching Subjects</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="page-header">
              {currentUser.role === "student" 
                ? "My Subjects" 
                : "Teaching Subjects"}
            </div>

            <div className="card-grid">
              {subjects.map((subject) => (
                <Card 
                  key={subject.id} 
                  className="card-hover overflow-hidden cursor-pointer"
                  onClick={() => handleSubjectClick(subject.id)}
                >
                  <div className="h-32 bg-edu-primary/20 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Book className="h-10 w-10 text-edu-primary" />
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{subject.title}</CardTitle>
                        <CardDescription className="text-xs">{subject.code}</CardDescription>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Bookmark className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {subject.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
