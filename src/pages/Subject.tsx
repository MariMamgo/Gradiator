import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEducation } from "@/context/EducationContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format, isAfter, parseISO } from "date-fns";
import { File, Upload, Book, CheckCircle, Clock, Plus, FileText, AlertCircle, Bell, Flag } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Assignment, Submission } from "@/types/education";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import AssignmentAnalyzer from "@/components/AssignmentAnalyzer";
import SubmissionsList from "@/components/SubmissionsList";
import MaterialsList from "@/components/MaterialsList";

const Subject = () => {
  const { subjectId } = useParams();
  const { currentUser } = useAuth();
  const { 
    getSubjectById, 
    getAssignmentsForSubject, 
    getMaterialsForSubject, 
    submitAssignment, 
    addAssignment, 
    addMaterial,
    getSubmissionsForAssignment,
    gradeSubmission,
    submitAppeal,
    reviewAppeal,
    loading,
    refreshData
  } = useEducation();
  const navigate = useNavigate();
  
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [currentAssignmentId, setCurrentAssignmentId] = useState<string>("");
  const [showAddAssignmentDialog, setShowAddAssignmentDialog] = useState(false);
  const [showAddMaterialDialog, setShowAddMaterialDialog] = useState(false);
  const [showSubmissionsDialog, setShowSubmissionsDialog] = useState(false);
  const [showSubmissionDetailsDialog, setShowSubmissionDetailsDialog] = useState(false);
  const [showAppealDialog, setShowAppealDialog] = useState(false);
  const [showReviewAppealDialog, setShowReviewAppealDialog] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [appealReason, setAppealReason] = useState("");
  const [newGrade, setNewGrade] = useState(0);
  const [newFeedback, setNewFeedback] = useState("");
  
  if (loading) {
    return (
      <div className="min-h-screen bg-edu-background">
        <Navbar />
        <div className="edu-container flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">Loading subject details...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!currentUser) {
    navigate("/");
    return null;
  }
  
  if (!subjectId) {
    navigate("/dashboard");
    return null;
  }
  
  const subject = getSubjectById(subjectId);
  if (!subject) {
    navigate("/dashboard");
    return null;
  }
  
  const assignments = getAssignmentsForSubject(subjectId);
  const materials = getMaterialsForSubject(subjectId);
  
  const upcomingAssignments = assignments.filter(a => a.status === "upcoming");
  const submittedAssignments = assignments.filter(a => a.status === "submitted");
  const gradedAssignments = assignments.filter(a => a.status === "graded");
  
  const examQuizzes = assignments.filter(a => a.type === "exam" || a.type === "quiz");
  const homeworks = assignments.filter(a => a.type === "homework");

  const isAppealable = (assignment: Assignment) => {
    if (!assignment.appealDeadline || !assignment.grade) return false;
    const now = new Date();
    const deadline = parseISO(assignment.appealDeadline);
    return isAfter(deadline, now);
  };
  
  const handleSubmitAssignment = () => {
    if (!currentAssignmentId || !currentUser) return;
    
    submitAssignment(
      currentAssignmentId, 
      ["uploaded-file.pdf"], 
      currentUser.id, 
      currentUser.name
    );
    setShowUploadDialog(false);
    setUploadingFiles([]);
  };
  
  const handleAddAssignment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const newAssignment: Omit<Assignment, "id"> = {
      title: formData.get("title") as string,
      subjectId,
      description: formData.get("description") as string,
      dueDate: formData.get("dueDate") as string,
      type: formData.get("type") as "homework" | "exam" | "quiz",
      status: "upcoming",
      maxGrade: parseInt(formData.get("maxGrade") as string),
      criteria: formData.get("criteria") as string,
      submissions: []
    };
    
    addAssignment(newAssignment);
    setShowAddAssignmentDialog(false);
  };
  
  const handleAddMaterial = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    addMaterial({
      title: formData.get("title") as string,
      subjectId,
      description: formData.get("description") as string,
      type: formData.get("type") as "document" | "video" | "presentation" | "other",
      fileUrl: "/placeholder.svg",
      dateAdded: new Date().toISOString(),
    });
    
    setShowAddMaterialDialog(false);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadingFiles(Array.from(e.target.files));
    }
  };

  const handleViewSubmissions = (assignmentId: string) => {
    setCurrentAssignmentId(assignmentId);
    setShowSubmissionsDialog(true);
  };
  
  const handleViewSubmissionDetails = (submission: Submission) => {
    setSelectedSubmission(submission);
    setShowSubmissionDetailsDialog(true);
    setShowSubmissionsDialog(false);
  };
  
  const handleGradeSubmission = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSubmission) return;
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const grade = parseInt(formData.get("grade") as string);
    const feedback = formData.get("feedback") as string;
    
    gradeSubmission(selectedSubmission.id, grade, feedback);
    setShowSubmissionDetailsDialog(false);
  };
  
  const handleAppeal = (submission: Submission) => {
    setSelectedSubmission(submission);
    setShowAppealDialog(true);
  };
  
  const handleSubmitAppeal = () => {
    if (!selectedSubmission) return;
    
    submitAppeal(selectedSubmission.id, appealReason);
    setShowAppealDialog(false);
    setAppealReason("");
  };
  
  const handleReviewAppeal = (submission: Submission) => {
    setSelectedSubmission(submission);
    setNewGrade(submission.grade || 0);
    setNewFeedback(submission.feedback || "");
    setShowReviewAppealDialog(true);
  };
  
  const handleSubmitReviewAppeal = () => {
    if (!selectedSubmission) return;
    
    reviewAppeal(selectedSubmission.id, newGrade, newFeedback);
    setShowReviewAppealDialog(false);
  };
  
  return (
    <div className="min-h-screen bg-edu-background">
      <Navbar />
      
      <div className="edu-container">
        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </Button>
        </div>
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-edu-dark">
            {subject.title}
            {currentUser.role === "grader" && assignments.some(a => a.hasAppeal) && (
              <Badge variant="destructive" className="ml-2">
                <Bell className="h-3 w-3 mr-1" />
                Appeals
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground">{subject.code} • {subject.description}</p>
        </div>
        
        {currentUser.role === "student" ? (
          <Tabs defaultValue="homeworks">
            <TabsList className="mb-6">
              <TabsTrigger value="homeworks">Homeworks</TabsTrigger>
              <TabsTrigger value="exams">Exams & Quizzes</TabsTrigger>
              <TabsTrigger value="materials">Materials</TabsTrigger>
            </TabsList>
            
            <TabsContent value="homeworks">
              <Tabs defaultValue="upcoming">
                <TabsList className="mb-4">
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="submitted">Submitted</TabsTrigger>
                  <TabsTrigger value="graded">Graded</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upcoming">
                  <div className="grid gap-4">
                    {upcomingAssignments
                      .filter(a => a.type === "homework")
                      .map((assignment) => (
                        <Card key={assignment.id}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle>{assignment.title}</CardTitle>
                                <CardDescription>
                                  Due: {format(new Date(assignment.dueDate), "PPP")}
                                </CardDescription>
                              </div>
                              <Badge>{assignment.type}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm mb-4">{assignment.description}</p>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  Max Grade: {assignment.maxGrade}
                                </span>
                              </div>
                              <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                                <DialogTrigger asChild>
                                  <Button
                                    onClick={() => setCurrentAssignmentId(assignment.id)}
                                    size="sm"
                                  >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Submit
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Submit Assignment</DialogTitle>
                                    <DialogDescription>
                                      Upload your completed assignment as a PDF or image file.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="grid gap-4 py-4">
                                    <Label htmlFor="file-upload">Files</Label>
                                    <Input
                                      id="file-upload"
                                      type="file"
                                      multiple
                                      onChange={handleFileChange}
                                    />
                                    {uploadingFiles.length > 0 && (
                                      <div className="bg-muted p-2 rounded-md">
                                        <p className="font-medium text-sm mb-1">Selected files:</p>
                                        {uploadingFiles.map((file, index) => (
                                          <div key={index} className="flex items-center gap-2 text-sm">
                                            <File className="h-4 w-4" />
                                            <span>{file.name}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    <Textarea
                                      placeholder="Add any comments about your submission (optional)"
                                    />
                                  </div>
                                  <DialogFooter>
                                    <Button
                                      variant="outline"
                                      onClick={() => setShowUploadDialog(false)}
                                    >
                                      Cancel
                                    </Button>
                                    <Button onClick={handleSubmitAssignment}>
                                      Submit Assignment
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    
                    {upcomingAssignments.filter(a => a.type === "homework").length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No upcoming assignments.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="submitted">
                  <SubmissionsList 
                    submissions={assignments
                      .filter(a => a.type === "homework" && a.status === "submitted")
                      .flatMap(a => a.submissions || [])
                      .filter(s => s.studentId === currentUser.id)}
                    assignments={assignments}
                    title="Your Submitted Homework"
                    emptyMessage="You haven't submitted any homework yet."
                  />
                </TabsContent>
                
                <TabsContent value="graded">
                  <SubmissionsList 
                    submissions={assignments
                      .filter(a => a.type === "homework" && a.status === "graded")
                      .flatMap(a => a.submissions || [])
                      .filter(s => s.studentId === currentUser.id)}
                    assignments={assignments}
                    title="Your Graded Homework"
                    emptyMessage="You don't have any graded homework yet."
                  />
                </TabsContent>
              </Tabs>
            </TabsContent>
            
            <TabsContent value="exams">
              <SubmissionsList 
                submissions={assignments
                  .filter(a => (a.type === "exam" || a.type === "quiz"))
                  .flatMap(a => a.submissions || [])
                  .filter(s => s.studentId === currentUser.id)}
                assignments={assignments}
                title="Your Exams & Quizzes"
                emptyMessage="You don't have any exams or quizzes yet."
              />
              
              {examQuizzes.filter(a => a.status === "upcoming").length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Upcoming Exams & Quizzes</h3>
                  <div className="grid gap-4">
                    {examQuizzes.filter(a => a.status === "upcoming").map((assignment) => (
                      <Card key={assignment.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle>{assignment.title}</CardTitle>
                              <CardDescription>
                                {assignment.status === "upcoming"
                                  ? `Due: ${format(new Date(assignment.dueDate), "PPP")}`
                                  : `Date: ${format(new Date(assignment.dueDate), "PPP")}`}
                              </CardDescription>
                            </div>
                            <Badge>
                              {assignment.type.charAt(0).toUpperCase() + assignment.type.slice(1)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm mb-4">{assignment.description}</p>
                          {assignment.status === "submitted" && (
                            <div className="flex items-center gap-2 text-sm text-blue-600">
                              <Clock className="h-4 w-4" />
                              <span>Submitted, waiting for grading</span>
                            </div>
                          )}
                          {assignment.status === "graded" && assignment.grade !== undefined && (
                            <div className="mb-4">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="font-medium">
                                  Grade: {assignment.grade}/{assignment.maxGrade}
                                </span>
                              </div>
                              {assignment.feedback && (
                                <div className="bg-muted p-3 rounded-md text-sm mb-3">
                                  <p className="font-medium mb-1">Feedback:</p>
                                  <p>{assignment.feedback}</p>
                                </div>
                              )}
                              {isAppealable(assignment) && assignment.submissions && assignment.submissions.length > 0 && (
                                <Dialog open={showAppealDialog} onOpenChange={setShowAppealDialog}>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleAppeal(assignment.submissions![0])}
                                    >
                                      <Flag className="h-4 w-4 mr-2 text-red-500" />
                                      Appeal Grade
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Appeal Grade</DialogTitle>
                                      <DialogDescription>
                                        Explain why you believe your grade should be reconsidered.
                                        Appeals can be submitted within 5 days of grading.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                      <div>
                                        <Label htmlFor="appeal-reason">Reason for Appeal</Label>
                                        <Textarea
                                          id="appeal-reason"
                                          placeholder="Explain which parts of your work were incorrectly graded and why"
                                          value={appealReason}
                                          onChange={(e) => setAppealReason(e.target.value)}
                                          className="mt-2"
                                          rows={5}
                                        />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => setShowAppealDialog(false)}>
                                        Cancel
                                      </Button>
                                      <Button onClick={handleSubmitAppeal} disabled={!appealReason.trim()}>
                                        Submit Appeal
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              )}
                              {assignment.submissions && assignment.submissions.length > 0 && 
                                assignment.submissions[0].appeal && (
                                <div className="mt-3 bg-amber-50 p-3 rounded-md text-sm border border-amber-200">
                                  <div className="flex items-center gap-2 font-medium text-amber-700 mb-1">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>
                                      Appeal {assignment.submissions[0].appeal.status === "pending" 
                                        ? "Pending" 
                                        : "Reviewed"}
                                    </span>
                                  </div>
                                  {assignment.submissions[0].appeal.status === "reviewed" && (
                                    <p className="text-amber-700">
                                      Your appeal has been reviewed and your grade has been updated.
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                          {assignment.status === "upcoming" && (
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  Max Grade: {assignment.maxGrade}
                                </span>
                              </div>
                              <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                                <DialogTrigger asChild>
                                  <Button
                                    onClick={() => setCurrentAssignmentId(assignment.id)}
                                    size="sm"
                                  >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Submit
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Submit {assignment.type}</DialogTitle>
                                    <DialogDescription>
                                      Upload your completed {assignment.type} as a PDF or image file.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="grid gap-4 py-4">
                                    <Label htmlFor="file-upload">Files</Label>
                                    <Input
                                      id="file-upload"
                                      type="file"
                                      multiple
                                      onChange={handleFileChange}
                                    />
                                    {uploadingFiles.length > 0 && (
                                      <div className="bg-muted p-2 rounded-md">
                                        <p className="font-medium text-sm mb-1">Selected files:</p>
                                        {uploadingFiles.map((file, index) => (
                                          <div key={index} className="flex items-center gap-2 text-sm">
                                            <File className="h-4 w-4" />
                                            <span>{file.name}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <DialogFooter>
                                    <Button
                                      variant="outline"
                                      onClick={() => setShowUploadDialog(false)}
                                    >
                                      Cancel
                                    </Button>
                                    <Button onClick={handleSubmitAssignment}>
                                      Submit {assignment.type}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="materials">
              <MaterialsList 
                materials={materials}
                title="Class Materials"
                emptyMessage="No materials available for this subject yet."
              />
            </TabsContent>
          </Tabs>
        ) : (
          <Tabs defaultValue="materials">
            <TabsList className="mb-6">
              <TabsTrigger value="materials">Class Materials</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
            </TabsList>
            
            <TabsContent value="materials">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Class Materials</h2>
                <Dialog open={showAddMaterialDialog} onOpenChange={setShowAddMaterialDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Material
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Class Material</DialogTitle>
                      <DialogDescription>
                        Upload a new material for students to access.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddMaterial}>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="title" className="text-right">
                            Title
                          </Label>
                          <Input
                            id="title"
                            name="title"
                            className="col-span-3"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="description" className="text-right">
                            Description
                          </Label>
                          <Textarea
                            id="description"
                            name="description"
                            className="col-span-3"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="type" className="text-right">
                            Type
                          </Label>
                          <select
                            id="type"
                            name="type"
                            className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            required
                          >
                            <option value="document">Document</option>
                            <option value="video">Video</option>
                            <option value="presentation">Presentation</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="file" className="text-right">
                            File
                          </Label>
                          <Input
                            id="file"
                            type="file"
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Add Material</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              
              <MaterialsList 
                materials={materials}
                title="Class Materials"
                emptyMessage="No materials uploaded yet."
              />
              
              {materials.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No materials uploaded yet.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setShowAddMaterialDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Material
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="assignments">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Assignments</h2>
                <Dialog open={showAddAssignmentDialog} onOpenChange={setShowAddAssignmentDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Assignment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Assignment</DialogTitle>
                      <DialogDescription>
                        Create a new assignment, quiz, or exam for students.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddAssignment}>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="title" className="text-right">
                            Title
                          </Label>
                          <Input
                            id="title"
                            name="title"
                            className="col-span-3"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="description" className="text-right">
                            Description
                          </Label>
                          <Textarea
                            id="description"
                            name="description"
                            className="col-span-3"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="type" className="text-right">
                            Type
                          </Label>
                          <select
                            id="type"
                            name="type"
                            className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            required
                          >
                            <option value="homework">Homework</option>
                            <option value="quiz">Quiz</option>
                            <option value="exam">Exam</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="dueDate" className="text-right">
                            Due Date
                          </Label>
                          <Input
                            id="dueDate"
                            name="dueDate"
                            type="date"
                            className="col-span-3"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="maxGrade" className="text-right">
                            Max Grade
                          </Label>
                          <Input
                            id="maxGrade"
                            name="maxGrade"
                            type="number"
                            min="1"
                            className="col-span-3"
                            defaultValue="100"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="criteria" className="text-right">
                            Grading Criteria
                          </Label>
                          <Textarea
                            id="criteria"
                            name="criteria"
                            className="col-span-3"
                            placeholder="E.g., Correctness: 70%, Presentation: 30%"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="file" className="text-right">
                            Attachment
                          </Label>
                          <Input
                            id="file"
                            type="file"
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Create Assignment</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              
              <Tabs defaultValue="upcoming">
                <TabsList className="mb-4">
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="submitted">Submitted</TabsTrigger>
                  <TabsTrigger value="graded">Graded</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upcoming">
                  <div className="grid gap-4">
                    {upcomingAssignments.map((assignment) => (
                      <Card key={assignment.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle>{assignment.title}</CardTitle>
                              <CardDescription>
                                Due: {format(new Date(assignment.dueDate), "PPP")}
                              </CardDescription>
                            </div>
                            <Badge>
                              {assignment.type.charAt(0).toUpperCase() + assignment.type.slice(1)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm mb-4">{assignment.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>Max Grade: {assignment.maxGrade}</span>
                            </div>
                            <div>
                              {assignment.criteria && (
                                <span>Criteria: {assignment.criteria}</span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {upcomingAssignments.length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No upcoming assignments.</p>
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => setShowAddAssignmentDialog(true)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Your First Assignment
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="submitted">
                  <SubmissionsList 
                    submissions={assignments
                      .filter(a => a.status === "submitted")
                      .flatMap(a => a.submissions || [])}
                    assignments={assignments}
                    title="Submitted Assignments"
                    emptyMessage="No submitted assignments yet."
                    viewSubmissionDetails={handleViewSubmissionDetails}
                  />
                </TabsContent>
                
                <TabsContent value="graded">
                  <div className="grid gap-4">
                    {gradedAssignments.map((assignment) => (
                      <Card key={assignment.id} className={assignment.hasAppeal ? "border-amber-300" : ""}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="flex items-center">
                                {assignment.title}
                                {assignment.hasAppeal && (
                                  <HoverCard>
                                    <HoverCardTrigger asChild>
                                      <Badge variant="outline" className="ml-2 bg-amber-100 border-amber-300">
                                        <Flag className="h-3 w-3 mr-1 text-amber-600" />
                                        Appeals
                                      </Badge>
                                    </HoverCardTrigger>
                                    <HoverCardContent className="w-80">
                                      <div className="text-sm">
                                        <p className="font-medium mb-1">Appeals Pending</p>
                                        <p>Some students have appealed their grades.</p>
                                      </div>
                                    </HoverCardContent>
                                  </HoverCard>
                                )}
                              </CardTitle>
                              <CardDescription>
                                Date: {format(new Date(assignment.dueDate), "PPP")}
                              </CardDescription>
                            </div>
                            <Badge variant="outline" className="bg-green-100">
                              Graded
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm mb-4">{assignment.description}</p>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="font-medium">
                                Average Grade: {assignment.grade}/{assignment.maxGrade}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <AssignmentAnalyzer assignment={assignment} />
                              <Button 
                                size="sm"
                                onClick={() => handleViewSubmissions(assignment.id)}
                              >
                                View Submissions
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {gradedAssignments.length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No graded assignments yet.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        )}
        
        <Dialog open={showSubmissionsDialog} onOpenChange={setShowSubmissionsDialog}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Submissions</DialogTitle>
              <DialogDescription>
                Review and grade student submissions for this assignment.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentAssignmentId && getSubmissionsForAssignment(currentAssignmentId).map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>{submission.studentName}</TableCell>
                      <TableCell>{format(new Date(submission.submittedAt), "PPP")}</TableCell>
                      <TableCell>
                        <Badge variant={submission.status === "graded" ? "outline" : "secondary"}>
                          {submission.status === "graded" ? "Graded" : "Pending"}
                        </Badge>
                        {submission.appeal && (
                          <Badge variant="outline" className="ml-2 bg-amber-100 border-amber-300">
                            <Flag className="h-3 w-3 mr-1 text-amber-600" />
                            Appeal
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {submission.grade !== undefined ? `${submission.grade}` : "Not graded"}
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewSubmissionDetails(submission)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!currentAssignmentId || getSubmissionsForAssignment(currentAssignmentId).length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No submissions found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>
        
        <Dialog open={showSubmissionDetailsDialog} onOpenChange={setShowSubmissionDetailsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submission Details</DialogTitle>
              <DialogDescription>
                {selectedSubmission?.studentName}'s submission
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Submitted Files:</h4>
                <div className="bg-muted rounded-md p-3">
                  {selectedSubmission?.files.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 mb-1">
                      <File className="h-4 w-4" />
                      <span className="text-sm">uploaded-file-{index+1}.pdf</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {selectedSubmission?.appeal && (
                <div className="mb-4 bg-amber-50 p-3 rounded-md border border-amber-200">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2 text-amber-700">
                    <Flag className="h-4 w-4" />
                    Appeal
                  </h4>
                  <p className="text-sm text-amber-700 mb-2">
                    Original Grade: {selectedSubmission.appeal.originalGrade}
                  </p>
                  <p className="text-sm mb-2">Reason:</p>
                  <div className="bg-white rounded-md p-2 text-sm">
                    {selectedSubmission.appeal.reason}
                  </div>
                  
                  {selectedSubmission.appeal.status === "pending" && (
                    <Button 
                      className="mt-3 w-full"
                      onClick={() => {
                        setShowSubmissionDetailsDialog(false);
                        handleReviewAppeal(selectedSubmission);
                      }}
                    >
                      Review Appeal
                    </Button>
                  )}
                </div>
              )}
              
              {selectedSubmission?.status === "graded" ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Grade:</h4>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>{selectedSubmission.grade}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Feedback:</h4>
                    <div className="bg-muted rounded-md p-3">
                      <p className="text-sm">{selectedSubmission.feedback}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleGradeSubmission} className="space-y-4">
                  <div>
                    <Label htmlFor="grade">Grade</Label>
                    <Input
                      id="grade"
                      name="grade"
                      type="number"
                      min="0"
                      max="100"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="feedback">Feedback</Label>
                    <Textarea
                      id="feedback"
                      name="feedback"
                      placeholder="Provide feedback to the student"
                      rows={4}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Submit Grade
                  </Button>
                </form>
              )}
            </div>
          </DialogContent>
        </Dialog>
        
        <Dialog open={showReviewAppealDialog} onOpenChange={setShowReviewAppealDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Review Appeal</DialogTitle>
              <DialogDescription>
                Review the student's grade appeal request
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="mb-4 bg-muted p-3 rounded-md">
                <h4 className="text-sm font-medium mb-2">Appeal Reason:</h4>
                <p className="text-sm">{selectedSubmission?.appeal?.reason}</p>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Original Grade: 
                  <span className="ml-2">{selectedSubmission?.appeal?.originalGrade}</span>
                </h4>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="new-grade">New Grade</Label>
                  <Input
                    id="new-grade"
                    type="number"
                    value={newGrade}
                    onChange={(e) => setNewGrade(parseInt(e.target.value))}
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <Label htmlFor="new-feedback">Updated Feedback</Label>
                  <Textarea
                    id="new-feedback"
                    value={newFeedback}
                    onChange={(e) => setNewFeedback(e.target.value)}
                    placeholder="Provide updated feedback to the student"
                    rows={4}
                  />
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setShowReviewAppealDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmitReviewAppeal}>
                    Submit Review
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Subject;
