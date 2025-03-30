
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import AIGrader from './AIGrader';
import { Submission } from '@/types/education';
import { useEducation } from '@/context/EducationContext';
import { useToast } from '@/hooks/use-toast';

interface ManualGradingProps {
  submissionId: string;
}

const ManualGrading: React.FC<ManualGradingProps> = ({ submissionId }) => {
  const { getSubmissionById, gradeSubmission } = useEducation();
  const submission = getSubmissionById(submissionId);
  const { toast } = useToast();
  
  const [manualGrade, setManualGrade] = useState<number>(submission?.grade || 0);
  const [feedback, setFeedback] = useState<string>(submission?.feedback || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!submission) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div>Submission not found</div>
        </CardContent>
      </Card>
    );
  }

  const handleGradingComplete = (result: { score: number, feedback: string }) => {
    setManualGrade(result.score);
    setFeedback(result.feedback);
  };

  const handleSubmitGrade = async () => {
    if (!manualGrade) {
      toast({
        title: "Missing Grade",
        description: "Please provide a grade",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await gradeSubmission(submissionId, manualGrade, feedback);
      toast({
        title: "Success",
        description: "Submission graded successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to grade submission",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Grade Submission</CardTitle>
        <CardDescription>
          Assignment: {submission.assignmentId} | Student: {submission.studentName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="files">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="files">Submission Files</TabsTrigger>
            <TabsTrigger value="ai-grader">AI Grader</TabsTrigger>
            <TabsTrigger value="manual">Manual Grading</TabsTrigger>
          </TabsList>
          
          <TabsContent value="files" className="space-y-4 pt-4">
            <h3 className="text-lg font-medium">Submitted Files</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {submission.files && submission.files.map((file, index) => (
                <div key={index} className="border rounded-md p-4">
                  <a href={file} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex flex-col items-center">
                    <img src={file} alt={`Submission ${index + 1}`} className="max-h-40 object-contain mb-2" />
                    <span>View File {index + 1}</span>
                  </a>
                </div>
              ))}
              {(!submission.files || submission.files.length === 0) && (
                <div className="text-center col-span-2 py-8 text-gray-500">No files submitted</div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="ai-grader" className="pt-4">
            <AIGrader onGradingComplete={handleGradingComplete} />
          </TabsContent>
          
          <TabsContent value="manual" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="grade">Grade (out of 100)</Label>
                <Input
                  id="grade"
                  type="number"
                  min="0"
                  max="100"
                  value={manualGrade}
                  onChange={(e) => setManualGrade(Number(e.target.value))}
                />
              </div>
              
              <div>
                <Label htmlFor="feedback">Feedback</Label>
                <Textarea
                  id="feedback"
                  rows={5}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide feedback on the submission..."
                />
              </div>
              
              <Separator />
              
              <Button 
                onClick={handleSubmitGrade} 
                disabled={isSubmitting} 
                className="w-full"
              >
                {isSubmitting ? "Submitting..." : "Submit Grade"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ManualGrading;
