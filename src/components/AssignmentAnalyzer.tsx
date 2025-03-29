
import React, { useState } from "react";
import { Assignment, Submission } from "@/types/education";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowDownUp, Lightbulb, BarChart3 } from "lucide-react";

interface AssignmentAnalyzerProps {
  assignment: Assignment;
}

const AssignmentAnalyzer: React.FC<AssignmentAnalyzerProps> = ({ assignment }) => {
  const [open, setOpen] = useState(false);

  // Only analyze if there are submissions with grades
  const hasGradedSubmissions = assignment.submissions && 
    assignment.submissions.length > 0 && 
    assignment.submissions.some(s => s.grade !== undefined);

  if (!hasGradedSubmissions) {
    return null;
  }

  const submissions = assignment.submissions || [];
  const gradedSubmissions = submissions.filter(s => s.status === "graded" && s.grade !== undefined);
  
  // Calculate statistics
  const totalSubmissions = gradedSubmissions.length;
  const averageGrade = totalSubmissions > 0 
    ? gradedSubmissions.reduce((sum, s) => sum + (s.grade || 0), 0) / totalSubmissions 
    : 0;
  
  // Calculate grade distribution
  const gradeRanges = [
    { name: '0-50', count: 0 },
    { name: '51-60', count: 0 },
    { name: '61-70', count: 0 },
    { name: '71-80', count: 0 },
    { name: '81-90', count: 0 },
    { name: '91-100', count: 0 },
  ];

  gradedSubmissions.forEach(submission => {
    const grade = submission.grade || 0;
    if (grade <= 50) gradeRanges[0].count++;
    else if (grade <= 60) gradeRanges[1].count++;
    else if (grade <= 70) gradeRanges[2].count++;
    else if (grade <= 80) gradeRanges[3].count++;
    else if (grade <= 90) gradeRanges[4].count++;
    else gradeRanges[5].count++;
  });

  // Generate analysis
  const generateAnalysis = () => {
    // Difficulty assessment
    let difficultyAssessment = "moderate";
    let recommendedDifficulty = "maintain current difficulty";
    
    if (averageGrade > 90) {
      difficultyAssessment = "too easy";
      recommendedDifficulty = "increase difficulty for future assignments";
    } else if (averageGrade < 60) {
      difficultyAssessment = "too difficult";
      recommendedDifficulty = "decrease difficulty for future assignments";
    }

    // Identify problematic areas based on feedback patterns
    const commonFeedbackPatterns = [];
    const feedbackWords = gradedSubmissions
      .map(s => s.feedback?.toLowerCase() || "")
      .join(" ")
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    const wordCounts: Record<string, number> = {};
    feedbackWords.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });

    // Find common issue words in feedback
    const issueWords = ["improve", "review", "misunderstood", "incorrect", "error", "missing", "lacks"];
    issueWords.forEach(word => {
      if (wordCounts[word] && wordCounts[word] >= 2) {
        commonFeedbackPatterns.push(word);
      }
    });

    // Appeals analysis
    const appealsCount = gradedSubmissions.filter(s => s.appeal).length;
    const appealPercentage = totalSubmissions > 0 ? (appealsCount / totalSubmissions) * 100 : 0;
    
    return {
      difficultyAssessment,
      recommendedDifficulty,
      commonFeedbackPatterns,
      appealPercentage,
      passingRate: totalSubmissions > 0 
        ? (gradedSubmissions.filter(s => (s.grade || 0) >= 60).length / totalSubmissions) * 100 
        : 0,
    };
  };

  const analysis = generateAnalysis();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <BarChart3 className="h-4 w-4" />
          Analyze Results
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Assignment Analysis</DialogTitle>
          <DialogDescription>
            Analysis of performance and recommendations for "{assignment.title}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Grade Distribution</CardTitle>
              <CardDescription>How students performed across grade ranges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gradeRanges}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                Insights & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-1">Statistics:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Average Grade: {averageGrade.toFixed(1)}</li>
                  <li>Passing Rate: {analysis.passingRate.toFixed(1)}%</li>
                  <li>Appeal Rate: {analysis.appealPercentage.toFixed(1)}%</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-1">Difficulty Assessment:</h4>
                <p>This assignment appears to be <span className="font-medium">{analysis.difficultyAssessment}</span>. 
                Recommendation: {analysis.recommendedDifficulty}.</p>
              </div>
              
              {analysis.commonFeedbackPatterns.length > 0 && (
                <div>
                  <h4 className="font-medium mb-1">Common Issues:</h4>
                  <p>Students frequently struggled with concepts related to: 
                    <span className="font-medium"> {analysis.commonFeedbackPatterns.join(", ")}</span>
                  </p>
                </div>
              )}
              
              <div>
                <h4 className="font-medium mb-1">Recommendations:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {averageGrade < 70 && (
                    <li>Consider reviewing the material related to this assignment in class</li>
                  )}
                  {analysis.appealPercentage > 10 && (
                    <li>Clarify grading criteria as there was a high appeal rate</li>
                  )}
                  {analysis.commonFeedbackPatterns.length > 0 && (
                    <li>Focus on improving explanations around: {analysis.commonFeedbackPatterns.join(", ")}</li>
                  )}
                  <li>
                    {averageGrade > 85 
                      ? "Consider increasing the challenge level in future assignments" 
                      : averageGrade < 65 
                        ? "Consider providing additional learning resources before similar assignments" 
                        : "Current difficulty level appears appropriate"
                    }
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentAnalyzer;
