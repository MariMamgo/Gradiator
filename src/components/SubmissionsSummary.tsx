
import React from "react";
import { Assignment, Submission } from "@/types/education";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CheckCircle, Clock, AlertCircle, Flag } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface SubmissionsSummaryProps {
  assignment: Assignment;
}

const SubmissionsSummary: React.FC<SubmissionsSummaryProps> = ({ assignment }) => {
  const totalSubmissions = assignment.submissions?.length || 0;
  const gradedSubmissions = assignment.submissions?.filter(s => s.status === "graded").length || 0;
  const pendingSubmissions = totalSubmissions - gradedSubmissions;
  const completionPercentage = totalSubmissions > 0 
    ? Math.round((gradedSubmissions / totalSubmissions) * 100) 
    : 0;
  
  const appealsCount = assignment.submissions?.filter(s => s.appeal).length || 0;
  
  const getAverageGrade = () => {
    if (!assignment.submissions || assignment.submissions.length === 0) return "N/A";
    
    const grades = assignment.submissions
      .filter(s => s.status === "graded" && s.grade !== undefined)
      .map(s => s.grade as number);
    
    if (grades.length === 0) return "N/A";
    
    const average = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
    return average.toFixed(1);
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{assignment.title}</CardTitle>
            <CardDescription>
              Due: {format(new Date(assignment.dueDate), "PPP")}
            </CardDescription>
          </div>
          <Badge variant={assignment.status === "graded" ? "outline" : "secondary"}>
            {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm">Grading Progress</span>
              <span className="text-sm font-medium">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-muted rounded-md p-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Submissions</span>
              </div>
              <p className="text-2xl font-bold mt-1">{totalSubmissions}</p>
              {pendingSubmissions > 0 && (
                <p className="text-xs text-muted-foreground">
                  {pendingSubmissions} pending
                </p>
              )}
            </div>
            
            <div className="bg-muted rounded-md p-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Avg. Grade</span>
              </div>
              <p className="text-2xl font-bold mt-1">{getAverageGrade()}</p>
              <p className="text-xs text-muted-foreground">
                of {assignment.maxGrade} points
              </p>
            </div>
          </div>
          
          {appealsCount > 0 && (
            <div className="bg-amber-50 p-3 rounded-md text-sm border border-amber-200">
              <div className="flex items-center gap-2 font-medium text-amber-700">
                <Flag className="h-4 w-4" />
                <span>
                  {appealsCount} Appeal{appealsCount !== 1 ? 's' : ''} Pending
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubmissionsSummary;
