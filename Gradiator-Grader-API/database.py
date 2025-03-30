
import json
import os
from typing import List, Dict, Any, Optional, Union
from datetime import datetime
import uuid

# Define path for database files
DB_PATH = "database"
os.makedirs(DB_PATH, exist_ok=True)

# Database file paths
USERS_FILE = os.path.join(DB_PATH, "users.json")
SUBJECTS_FILE = os.path.join(DB_PATH, "subjects.json")
ASSIGNMENTS_FILE = os.path.join(DB_PATH, "assignments.json")
MATERIALS_FILE = os.path.join(DB_PATH, "materials.json")

# Helper functions
def load_json(file_path: str, default: Any = None) -> Any:
    """Load data from a JSON file or return default if file doesn't exist."""
    if default is None:
        default = []
    
    if not os.path.exists(file_path):
        return default
    
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return default

def save_json(file_path: str, data: Any) -> None:
    """Save data to a JSON file."""
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=2)

# User operations
def get_users() -> List[Dict[str, Any]]:
    """Get all users."""
    return load_json(USERS_FILE)

def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Get a user by ID."""
    users = get_users()
    for user in users:
        if user.get("id") == user_id:
            return user
    return None

def save_user(user: Dict[str, Any]) -> Dict[str, Any]:
    """Save a user to the database."""
    users = get_users()
    
    # Check if user already exists
    for i, existing_user in enumerate(users):
        if existing_user.get("id") == user.get("id"):
            users[i] = user
            save_json(USERS_FILE, users)
            return user
    
    # If user doesn't exist, add new user
    if not user.get("id"):
        user["id"] = str(uuid.uuid4())
    users.append(user)
    save_json(USERS_FILE, users)
    return user

def delete_user(user_id: str) -> bool:
    """Delete a user from the database."""
    users = get_users()
    initial_count = len(users)
    users = [user for user in users if user.get("id") != user_id]
    
    if len(users) < initial_count:
        save_json(USERS_FILE, users)
        return True
    return False

# Subject operations
def get_subjects() -> List[Dict[str, Any]]:
    """Get all subjects."""
    return load_json(SUBJECTS_FILE)

def get_subject_by_id(subject_id: str) -> Optional[Dict[str, Any]]:
    """Get a subject by ID."""
    subjects = get_subjects()
    for subject in subjects:
        if subject.get("id") == subject_id:
            return subject
    return None

def save_subject(subject: Dict[str, Any]) -> Dict[str, Any]:
    """Save a subject to the database."""
    subjects = get_subjects()
    
    # Check if subject already exists
    for i, existing_subject in enumerate(subjects):
        if existing_subject.get("id") == subject.get("id"):
            subjects[i] = subject
            save_json(SUBJECTS_FILE, subjects)
            return subject
    
    # If subject doesn't exist, add new subject
    if not subject.get("id"):
        subject["id"] = str(uuid.uuid4())
    subjects.append(subject)
    save_json(SUBJECTS_FILE, subjects)
    return subject

# Assignment operations
def get_assignments() -> List[Dict[str, Any]]:
    """Get all assignments."""
    return load_json(ASSIGNMENTS_FILE)

def get_assignment_by_id(assignment_id: str) -> Optional[Dict[str, Any]]:
    """Get an assignment by ID."""
    assignments = get_assignments()
    for assignment in assignments:
        if assignment.get("id") == assignment_id:
            return assignment
    return None

def get_assignments_for_subject(subject_id: str) -> List[Dict[str, Any]]:
    """Get all assignments for a subject."""
    assignments = get_assignments()
    return [a for a in assignments if a.get("subjectId") == subject_id]

def save_assignment(assignment: Dict[str, Any]) -> Dict[str, Any]:
    """Save an assignment to the database."""
    assignments = get_assignments()
    
    # Check if assignment already exists
    for i, existing_assignment in enumerate(assignments):
        if existing_assignment.get("id") == assignment.get("id"):
            assignments[i] = assignment
            save_json(ASSIGNMENTS_FILE, assignments)
            return assignment
    
    # If assignment doesn't exist, add new assignment
    if not assignment.get("id"):
        assignment["id"] = str(uuid.uuid4())
    assignments.append(assignment)
    save_json(ASSIGNMENTS_FILE, assignments)
    return assignment

# Material operations
def get_materials() -> List[Dict[str, Any]]:
    """Get all materials."""
    return load_json(MATERIALS_FILE)

def get_material_by_id(material_id: str) -> Optional[Dict[str, Any]]:
    """Get a material by ID."""
    materials = get_materials()
    for material in materials:
        if material.get("id") == material_id:
            return material
    return None

def get_materials_for_subject(subject_id: str) -> List[Dict[str, Any]]:
    """Get all materials for a subject."""
    materials = get_materials()
    return [m for m in materials if m.get("subjectId") == subject_id]

def save_material(material: Dict[str, Any]) -> Dict[str, Any]:
    """Save a material to the database."""
    materials = get_materials()
    
    # Check if material already exists
    for i, existing_material in enumerate(materials):
        if existing_material.get("id") == material.get("id"):
            materials[i] = material
            save_json(MATERIALS_FILE, materials)
            return material
    
    # If material doesn't exist, add new material
    if not material.get("id"):
        material["id"] = str(uuid.uuid4())
    materials.append(material)
    save_json(MATERIALS_FILE, materials)
    return material

# Submission operations
def get_submission_by_id(submission_id: str) -> Optional[Dict[str, Any]]:
    """Get a submission by ID."""
    assignments = get_assignments()
    for assignment in assignments:
        submissions = assignment.get("submissions", [])
        for submission in submissions:
            if submission.get("id") == submission_id:
                return submission
    return None

def get_submissions_for_assignment(assignment_id: str) -> List[Dict[str, Any]]:
    """Get all submissions for an assignment."""
    assignment = get_assignment_by_id(assignment_id)
    if assignment:
        return assignment.get("submissions", [])
    return []

def get_submissions_by_student(student_id: str) -> List[Dict[str, Any]]:
    """Get all submissions by a student."""
    assignments = get_assignments()
    student_submissions = []
    
    for assignment in assignments:
        submissions = assignment.get("submissions", [])
        for submission in submissions:
            if submission.get("studentId") == student_id:
                student_submissions.append(submission)
    
    return student_submissions

def submit_assignment(assignment_id: str, submission_data: Dict[str, Any]) -> Dict[str, Any]:
    """Submit an assignment."""
    assignments = get_assignments()
    assignment_idx = None
    
    for i, assignment in enumerate(assignments):
        if assignment.get("id") == assignment_id:
            assignment_idx = i
            break
    
    if assignment_idx is None:
        raise ValueError(f"Assignment with ID {assignment_id} not found")
    
    submission = {
        **submission_data,
        "id": f"sub_{str(uuid.uuid4())}",
        "assignmentId": assignment_id,
        "submittedAt": datetime.now().isoformat(),
        "status": "submitted"
    }
    
    if not assignments[assignment_idx].get("submissions"):
        assignments[assignment_idx]["submissions"] = []
    
    assignments[assignment_idx]["submissions"].append(submission)
    assignments[assignment_idx]["status"] = "submitted"
    
    save_json(ASSIGNMENTS_FILE, assignments)
    return submission

def grade_submission(submission_id: str, grade: int, feedback: str) -> Dict[str, Any]:
    """Grade a submission."""
    assignments = get_assignments()
    updated_submission = None
    
    for i, assignment in enumerate(assignments):
        submissions = assignment.get("submissions", [])
        for j, submission in enumerate(submissions):
            if submission.get("id") == submission_id:
                assignments[i]["submissions"][j]["grade"] = grade
                assignments[i]["submissions"][j]["feedback"] = feedback
                assignments[i]["submissions"][j]["status"] = "graded"
                assignments[i]["status"] = "graded"
                updated_submission = assignments[i]["submissions"][j]
                break
        if updated_submission:
            break
    
    if not updated_submission:
        raise ValueError(f"Submission with ID {submission_id} not found")
    
    save_json(ASSIGNMENTS_FILE, assignments)
    return updated_submission

def submit_appeal(submission_id: str, reason: str) -> Dict[str, Any]:
    """Submit an appeal for a graded submission."""
    assignments = get_assignments()
    submission = None
    assignment_idx = None
    submission_idx = None
    
    for i, assignment in enumerate(assignments):
        submissions = assignment.get("submissions", [])
        for j, sub in enumerate(submissions):
            if sub.get("id") == submission_id:
                submission = sub
                assignment_idx = i
                submission_idx = j
                break
        if submission:
            break
    
    if not submission:
        raise ValueError(f"Submission with ID {submission_id} not found")
    
    if not submission.get("grade"):
        raise ValueError("Cannot appeal a submission that hasn't been graded")
    
    appeal = {
        "id": f"appeal_{str(uuid.uuid4())}",
        "submissionId": submission_id,
        "reason": reason,
        "status": "pending",
        "createdAt": datetime.now().isoformat(),
        "originalGrade": submission.get("grade")
    }
    
    assignments[assignment_idx]["submissions"][submission_idx]["appeal"] = appeal
    assignments[assignment_idx]["hasAppeal"] = True
    
    save_json(ASSIGNMENTS_FILE, assignments)
    return appeal

def review_appeal(submission_id: str, new_grade: int, feedback: str) -> Dict[str, Any]:
    """Review an appeal."""
    assignments = get_assignments()
    updated_submission = None
    
    for i, assignment in enumerate(assignments):
        submissions = assignment.get("submissions", [])
        for j, submission in enumerate(submissions):
            if submission.get("id") == submission_id and submission.get("appeal"):
                assignments[i]["submissions"][j]["grade"] = new_grade
                assignments[i]["submissions"][j]["feedback"] = feedback
                assignments[i]["submissions"][j]["appeal"]["status"] = "reviewed"
                assignments[i]["submissions"][j]["appeal"]["reviewedAt"] = datetime.now().isoformat()
                updated_submission = assignments[i]["submissions"][j]
                
                # Check if all appeals are reviewed
                all_reviewed = True
                for sub in assignments[i]["submissions"]:
                    if sub.get("appeal") and sub["appeal"]["status"] != "reviewed":
                        all_reviewed = False
                        break
                
                if all_reviewed:
                    assignments[i]["hasAppeal"] = False
                
                break
        if updated_submission:
            break
    
    if not updated_submission:
        raise ValueError(f"Submission with ID {submission_id} not found or has no appeal")
    
    save_json(ASSIGNMENTS_FILE, assignments)
    return updated_submission

# Initialize database with sample data if empty
def initialize_if_empty():
    """Initialize the database with sample data if it's empty."""
    if not os.path.exists(SUBJECTS_FILE) or not load_json(SUBJECTS_FILE):
        # Import sample data
        try:
            from data.mockData import MOCK_SUBJECTS, MOCK_ASSIGNMENTS, MOCK_MATERIALS
            
            save_json(SUBJECTS_FILE, MOCK_SUBJECTS)
            save_json(ASSIGNMENTS_FILE, MOCK_ASSIGNMENTS)
            save_json(MATERIALS_FILE, MOCK_MATERIALS)
            
            print("Database initialized with sample data")
        except ImportError:
            # Create empty database files
            if not os.path.exists(USERS_FILE):
                save_json(USERS_FILE, [])
            if not os.path.exists(SUBJECTS_FILE):
                save_json(SUBJECTS_FILE, [])
            if not os.path.exists(ASSIGNMENTS_FILE):
                save_json(ASSIGNMENTS_FILE, [])
            if not os.path.exists(MATERIALS_FILE):
                save_json(MATERIALS_FILE, [])
            
            print("Empty database initialized")

# Initialize the database when this module is imported
initialize_if_empty()
