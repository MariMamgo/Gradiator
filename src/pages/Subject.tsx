
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
import { format } from "date-fns";
import { File, Upload, Book, CheckCircle, Clock, Plus, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Assignment } from "@/types/education";

const Subject = () => {
  const { subjectId } = useParams();
  const { currentUser } = useAuth();
  const { getSubjectById, getAssignmentsForSubject, getMaterialsForSubject, submitAssignment, addAssignment, addMaterial } = useEducation();
  const navigate = useNavigate();
  
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [currentAssignmentId, setCurrentAssignmentId] = useState<string>("");
  const [showAddAssignmentDialog, setShowAddAssignmentDialog] = useState(false);
  const [showAddMaterialDialog, setShowAddMaterialDialog] = useState(false);
  
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
  const gradedAssignments = assignments.filter(a => a.status === "graded");
  
  const examQuizzes = assignments.filter(a => a.type === "exam" || a.type === "quiz");
  const homeworks = assignments.filter(a => a.type === "homework");
  
  const handleSubmitAssignment = () => {
    if (!currentAssignmentId) return;
    
    submitAssignment(currentAssignmentId, ["uploaded-file.pdf"]);
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
          <h1 className="text-3xl font-bold text-edu-dark">{subject.title}</h1>
          <p className="text-muted-foreground">{subject.code} • {subject.description}</p>
        </div>
        
        {currentUser.role === "student" ? (
          <Tabs defaultValue="homeworks">
            <TabsList className="mb-6">
              <TabsTrigger value="homeworks">Homeworks</TabsTrigger>
              <TabsTrigger value="exams">Exams & Quizzes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="homeworks">
              <Tabs defaultValue="upcoming">
                <TabsList className="mb-4">
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
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
                
                <TabsContent value="graded">
                  <div className="grid gap-4">
                    {gradedAssignments
                      .filter(a => a.type === "homework")
                      .map((assignment) => (
                        <Card key={assignment.id}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle>{assignment.title}</CardTitle>
                                <CardDescription>
                                  Submitted: {format(new Date(assignment.dueDate), "PPP")}
                                </CardDescription>
                              </div>
                              <Badge variant="outline" className="bg-green-100">
                                Graded
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="mb-4">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="font-medium">
                                  Grade: {assignment.grade}/{assignment.maxGrade}
                                </span>
                              </div>
                              <div className="bg-muted p-3 rounded-md text-sm">
                                <p className="font-medium mb-1">Feedback:</p>
                                <p>{assignment.feedback}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    
                    {gradedAssignments.filter(a => a.type === "homework").length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No graded assignments yet.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>
            
            <TabsContent value="exams">
              <div className="grid gap-4">
                {examQuizzes.map((assignment) => (
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
                      {assignment.status === "graded" && assignment.grade !== undefined && (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="font-medium">
                              Grade: {assignment.grade}/{assignment.maxGrade}
                            </span>
                          </div>
                          {assignment.feedback && (
                            <div className="bg-muted p-3 rounded-md text-sm">
                              <p className="font-medium mb-1">Feedback:</p>
                              <p>{assignment.feedback}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                
                {examQuizzes.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No exams or quizzes available.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          // Grader View
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
              
              <div className="grid gap-4">
                {materials.map((material) => (
                  <Card key={material.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{material.title}</CardTitle>
                          <CardDescription>
                            Added: {format(new Date(material.dateAdded), "PPP")}
                          </CardDescription>
                        </div>
                        <Badge variant="outline">
                          {material.type.charAt(0).toUpperCase() + material.type.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">{material.description}</p>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        View Material
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                
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
              </div>
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
              
              <Tabs defaultValue="graded">
                <TabsList className="mb-4">
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
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
                
                <TabsContent value="graded">
                  <div className="grid gap-4">
                    {gradedAssignments.map((assignment) => (
                      <Card key={assignment.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle>{assignment.title}</CardTitle>
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
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="font-medium">
                              Average Grade: {assignment.grade}/{assignment.maxGrade}
                            </span>
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
      </div>
    </div>
  );
};

export default Subject;
