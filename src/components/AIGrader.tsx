
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { databaseService } from "@/services/DatabaseService";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";

interface AIGraderProps {
  assignmentId?: string;
  criteria?: string;
  onGradingComplete?: (result: { score: number, feedback: string }) => void;
}

const AIGrader: React.FC<AIGraderProps> = ({ 
  assignmentId,
  criteria: initialCriteria = "",
  onGradingComplete 
}) => {
  const [taskFile, setTaskFile] = useState<File | null>(null);
  const [solutionFile, setSolutionFile] = useState<File | null>(null);
  const [criteria, setCriteria] = useState<string>(initialCriteria);
  const [isGrading, setIsGrading] = useState<boolean>(false);
  const [gradingResult, setGradingResult] = useState<{ score: number, feedback: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleTaskFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setTaskFile(e.target.files[0]);
    }
  };

  const handleSolutionFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSolutionFile(e.target.files[0]);
    }
  };

  const handleGrade = async () => {
    if (!taskFile || !solutionFile || !criteria) {
      toast({
        title: "Missing Information",
        description: "Please provide task file, solution file, and grading criteria",
        variant: "destructive"
      });
      return;
    }

    setIsGrading(true);
    setError(null);
    setGradingResult(null);

    try {
      const result = await databaseService.gradeHomework(taskFile, solutionFile, criteria);
      setGradingResult(result);
      
      if (onGradingComplete) {
        onGradingComplete(result);
      }
      
      toast({
        title: "Grading Complete",
        description: `Score: ${result.score}/100`,
      });
    } catch (err) {
      console.error("Grading error:", err);
      setError(err instanceof Error ? err.message : "Failed to grade submission");
      toast({
        title: "Grading Failed",
        description: err instanceof Error ? err.message : "Failed to grade submission",
        variant: "destructive"
      });
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>AI Grader</CardTitle>
        <CardDescription>
          Upload the task description and student's solution to automatically grade the submission
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="task-file">Task File (Question/Assignment)</Label>
          <div className="flex items-center gap-2">
            <Input
              id="task-file"
              type="file"
              onChange={handleTaskFileChange}
              accept="image/*, application/pdf"
            />
            {taskFile && <CheckCircle className="h-5 w-5 text-green-500" />}
          </div>
          <p className="text-sm text-gray-500">Upload a PDF or image file of the assignment task</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="solution-file">Student Solution</Label>
          <div className="flex items-center gap-2">
            <Input
              id="solution-file"
              type="file"
              onChange={handleSolutionFileChange}
              accept="image/*, application/pdf"
            />
            {solutionFile && <CheckCircle className="h-5 w-5 text-green-500" />}
          </div>
          <p className="text-sm text-gray-500">Upload a PDF or image file of the student's solution</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="criteria">Grading Criteria</Label>
          <Textarea
            id="criteria"
            placeholder="Enter grading criteria here..."
            value={criteria}
            onChange={(e) => setCriteria(e.target.value)}
            rows={5}
          />
          <p className="text-sm text-gray-500">
            Specify how the assignment should be graded, e.g., "Correct answer: 50 points, Clear explanation: 30 points, Proper formatting: 20 points"
          </p>
        </div>

        {isGrading && (
          <div className="space-y-2 py-2">
            <Label>Grading in progress...</Label>
            <Progress value={undefined} className="h-2" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {gradingResult && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-green-900">Grading Result</h3>
              <div className="text-lg font-bold text-green-700">{gradingResult.score}/100</div>
            </div>
            <Separator />
            <div className="text-sm text-green-800 pt-2">{gradingResult.feedback}</div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleGrade} 
          disabled={!taskFile || !solutionFile || !criteria || isGrading}
          className="w-full"
        >
          {isGrading ? (
            <>Grading...</>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" /> Grade Submission
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AIGrader;
