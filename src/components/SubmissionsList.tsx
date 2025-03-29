
import React from "react";
import { useNavigate } from "react-router-dom";
import { Submission, Assignment } from "@/types/education";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Clock, CheckCircle, FileText, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubmissionsListProps {
  submissions: Submission[];
  assignments: Assignment[];
  title?: string;
  emptyMessage?: string;
  viewSubmissionDetails?: (submission: Submission) => void;
}

const SubmissionsList = ({
  submissions,
  assignments,
  title = "Your Submissions",
  emptyMessage = "No submissions found",
  viewSubmissionDetails
}: SubmissionsListProps) => {
  const navigate = useNavigate();

  // Get assignment details for each submission
  const submissionsWithAssignments = submissions.map(submission => {
    const assignment = assignments.find(a => a.id === submission.assignmentId);
    return { submission, assignment };
  });

  const handleViewSubmission = (submission: Submission) => {
    if (viewSubmissionDetails) {
      viewSubmissionDetails(submission);
    } else {
      navigate(`/subject/${submission.assignmentId.split('-')[0]}`);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{title}</h3>
      
      {submissionsWithAssignments.length === 0 ? (
        <div className="text-center py-8 bg-muted rounded-md">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {submissionsWithAssignments.map(({ submission, assignment }) => (
            <Card key={submission.id} className={submission.appeal ? "border-amber-200" : ""}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{assignment?.title || "Unknown Assignment"}</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      Submitted: {format(new Date(submission.submittedAt), "PPP")}
                    </div>
                  </div>
                  <Badge variant={submission.status === "graded" ? "outline" : "secondary"} 
                         className={submission.status === "graded" ? "bg-green-100" : ""}>
                    {submission.status === "graded" ? "Graded" : "Pending"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-2">
                  {submission.status === "graded" && submission.grade !== undefined ? (
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium">
                        Grade: {submission.grade}/{assignment?.maxGrade || 100}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-600">
                        Waiting for grading
                      </span>
                    </div>
                  )}
                  
                  {submission.appeal && (
                    <div className="bg-amber-50 p-2 rounded-md text-sm border border-amber-200 mb-2">
                      <div className="flex items-center gap-2 font-medium text-amber-700">
                        <Flag className="h-4 w-4" />
                        <span>
                          Appeal {submission.appeal.status === "pending" ? "Pending" : "Reviewed"}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {submission.feedback && (
                    <div className="bg-muted p-2 rounded-md text-sm mb-2">
                      <p className="font-medium mb-1">Feedback:</p>
                      <p>{submission.feedback}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {submission.files.length} {submission.files.length === 1 ? "file" : "files"}
                    </span>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleViewSubmission(submission)}>
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubmissionsList;
