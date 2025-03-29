
import { Subject, Assignment, Material } from "@/types/education";

export const MOCK_SUBJECTS: Subject[] = [
  {
    id: "1",
    title: "Introduction to Computer Science",
    description: "Fundamental concepts of computer science and programming",
    code: "CS101",
    imageUrl: "/placeholder.svg"
  },
  {
    id: "2",
    title: "Data Structures",
    description: "Advanced data structures and algorithms",
    code: "CS202",
    imageUrl: "/placeholder.svg"
  },
  {
    id: "3",
    title: "Web Development",
    description: "Building modern web applications",
    code: "CS303",
    imageUrl: "/placeholder.svg"
  },
  {
    id: "4",
    title: "Mathematics for Computer Science",
    description: "Mathematical foundations for CS students",
    code: "MATH215",
    imageUrl: "/placeholder.svg"
  },
];

export const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: "1",
    title: "Algorithm Analysis",
    subjectId: "2",
    description: "Analyze the time and space complexity of common algorithms",
    dueDate: "2023-12-15",
    type: "homework",
    status: "upcoming",
    maxGrade: 100,
    criteria: "Correct analysis: 70%, Clarity: 30%",
    submissions: []
  },
  {
    id: "2",
    title: "HTML/CSS Project",
    subjectId: "3",
    description: "Build a responsive website with HTML and CSS",
    dueDate: "2023-12-10",
    type: "homework",
    status: "graded",
    grade: 92,
    feedback: "Excellent work on the responsive design. Consider adding more accessibility features.",
    maxGrade: 100,
    criteria: "Functionality: 40%, Design: 30%, Code quality: 30%",
    submissions: [
      {
        id: "s1",
        assignmentId: "2",
        studentId: "student1",
        studentName: "John Doe",
        files: ["/placeholder.svg"],
        submittedAt: "2023-12-08",
        status: "graded",
        grade: 92,
        feedback: "Excellent work on the responsive design. Consider adding more accessibility features."
      }
    ],
    appealDeadline: "2023-12-15"
  },
  {
    id: "3",
    title: "Midterm Exam",
    subjectId: "1",
    description: "Covers topics from weeks 1-7",
    dueDate: "2023-11-05",
    type: "exam",
    status: "graded",
    grade: 85,
    feedback: "Good understanding of core concepts. Review section 3.",
    maxGrade: 100,
    submissions: [
      {
        id: "s2",
        assignmentId: "3",
        studentId: "student1",
        studentName: "John Doe",
        files: ["/placeholder.svg"],
        submittedAt: "2023-11-05",
        status: "graded",
        grade: 85,
        feedback: "Good understanding of core concepts. Review section 3."
      }
    ],
    appealDeadline: "2023-11-10"
  },
];

export const MOCK_MATERIALS: Material[] = [
  {
    id: "1",
    title: "Introduction to Algorithms",
    subjectId: "2",
    description: "Slides covering basic algorithmic concepts",
    type: "presentation",
    fileUrl: "/placeholder.svg",
    dateAdded: "2023-09-15"
  },
  {
    id: "2",
    title: "HTML Basics",
    subjectId: "3",
    description: "Guide to HTML elements and structure",
    type: "document",
    fileUrl: "/placeholder.svg",
    dateAdded: "2023-09-10"
  },
];
