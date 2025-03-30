
import os
import google.generativeai as genai
from PIL import Image
import sys
import json
import mimetypes
import shutil
import logging
import uuid
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Body, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import uvicorn
import database as db

# --- Logging Setup ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- Gemini Configuration ---
try:
    api_key = "AIzaSyBcLcDg9pVhhIR9GSQI32tsPrGBCH5UXEc"
    if not api_key:
        raise ValueError("API key not found. Please set the GOOGLE_API_KEY environment variable.")

    genai.configure(api_key=api_key)
    logger.info("Gemini API configured.")
except ValueError as e:
    logger.error(f"Gemini Configuration Error: {e}")
    sys.exit(1)

# --- FastAPI App Initialization ---
app = FastAPI(title="Gradiator API", version="1.0.0")

# --- CORS Configuration ---
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Directory for File Uploads ---
UPLOADS_DIR = "uploads"
os.makedirs(UPLOADS_DIR, exist_ok=True)
TEMP_UPLOAD_DIR = "temp_uploads"
os.makedirs(TEMP_UPLOAD_DIR, exist_ok=True)

# Mount the uploads directory
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# --- Pydantic Models ---
class User(BaseModel):
    id: Optional[str] = None
    name: str
    email: str
    role: str

class Subject(BaseModel):
    id: Optional[str] = None
    title: str
    description: str
    code: str
    imageUrl: Optional[str] = None

class Assignment(BaseModel):
    id: Optional[str] = None
    title: str
    subjectId: str
    description: str
    dueDate: str
    type: str
    status: str
    maxGrade: int
    criteria: Optional[str] = None
    files: Optional[List[str]] = None
    submissions: Optional[List[Dict[str, Any]]] = None
    appealDeadline: Optional[str] = None
    hasAppeal: Optional[bool] = None

class Material(BaseModel):
    id: Optional[str] = None
    title: str
    subjectId: str
    description: str
    type: str
    fileUrl: str
    dateAdded: str

class SubmissionCreate(BaseModel):
    studentId: str
    studentName: str
    files: List[str]

class AppealCreate(BaseModel):
    reason: str

class GradeSubmission(BaseModel):
    grade: int
    feedback: str

# --- API Endpoints ---

# User endpoints
@app.get("/api/users", response_model=List[Dict[str, Any]])
async def get_all_users():
    return db.get_users()

@app.get("/api/users/{user_id}", response_model=Dict[str, Any])
async def get_user(user_id: str):
    user = db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found")
    return user

@app.post("/api/users", response_model=Dict[str, Any])
async def create_user(user: User):
    return db.save_user(user.dict())

@app.put("/api/users/{user_id}", response_model=Dict[str, Any])
async def update_user(user_id: str, user: User):
    if user_id != user.id and user.id is not None:
        raise HTTPException(status_code=400, detail="User ID in path must match User ID in body")
    user_dict = user.dict()
    user_dict["id"] = user_id
    return db.save_user(user_dict)

@app.delete("/api/users/{user_id}")
async def delete_user(user_id: str):
    success = db.delete_user(user_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found")
    return {"message": f"User with ID {user_id} deleted successfully"}

# Subject endpoints
@app.get("/api/subjects", response_model=List[Dict[str, Any]])
async def get_all_subjects():
    return db.get_subjects()

@app.get("/api/subjects/{subject_id}", response_model=Dict[str, Any])
async def get_subject(subject_id: str):
    subject = db.get_subject_by_id(subject_id)
    if not subject:
        raise HTTPException(status_code=404, detail=f"Subject with ID {subject_id} not found")
    return subject

@app.post("/api/subjects", response_model=Dict[str, Any])
async def create_subject(subject: Subject):
    return db.save_subject(subject.dict())

@app.put("/api/subjects/{subject_id}", response_model=Dict[str, Any])
async def update_subject(subject_id: str, subject: Subject):
    if subject_id != subject.id and subject.id is not None:
        raise HTTPException(status_code=400, detail="Subject ID in path must match Subject ID in body")
    subject_dict = subject.dict()
    subject_dict["id"] = subject_id
    return db.save_subject(subject_dict)

# Assignment endpoints
@app.get("/api/assignments", response_model=List[Dict[str, Any]])
async def get_all_assignments():
    return db.get_assignments()

@app.get("/api/assignments/{assignment_id}", response_model=Dict[str, Any])
async def get_assignment(assignment_id: str):
    assignment = db.get_assignment_by_id(assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail=f"Assignment with ID {assignment_id} not found")
    return assignment

@app.get("/api/subjects/{subject_id}/assignments", response_model=List[Dict[str, Any]])
async def get_assignments_for_subject(subject_id: str):
    return db.get_assignments_for_subject(subject_id)

@app.post("/api/assignments", response_model=Dict[str, Any])
async def create_assignment(
    title: str = Form(...),
    subject_id: str = Form(...),
    description: str = Form(...),
    due_date: str = Form(...),
    assignment_type: str = Form(...),
    max_grade: int = Form(...),
    criteria: str = Form(None),
    task_file: Optional[UploadFile] = File(None)
):
    # Save task file if provided
    files = []
    if task_file:
        file_extension = os.path.splitext(task_file.filename)[1]
        file_name = f"assignment_{uuid.uuid4().hex}{file_extension}"
        file_path = os.path.join(UPLOADS_DIR, file_name)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(task_file.file, buffer)
        
        files.append(f"/uploads/{file_name}")
    
    assignment_data = {
        "title": title,
        "subjectId": subject_id,
        "description": description,
        "dueDate": due_date,
        "type": assignment_type,
        "status": "upcoming",
        "maxGrade": max_grade,
        "criteria": criteria,
        "files": files,
        "submissions": [],
        "appealDeadline": None  # Will be calculated when the assignment is due
    }
    
    return db.save_assignment(assignment_data)

@app.put("/api/assignments/{assignment_id}", response_model=Dict[str, Any])
async def update_assignment(assignment_id: str, assignment: Assignment):
    if assignment_id != assignment.id and assignment.id is not None:
        raise HTTPException(status_code=400, detail="Assignment ID in path must match Assignment ID in body")
    assignment_dict = assignment.dict(exclude_unset=True)
    assignment_dict["id"] = assignment_id
    return db.save_assignment(assignment_dict)

# Material endpoints
@app.get("/api/materials", response_model=List[Dict[str, Any]])
async def get_all_materials():
    return db.get_materials()

@app.get("/api/materials/{material_id}", response_model=Dict[str, Any])
async def get_material(material_id: str):
    material = db.get_material_by_id(material_id)
    if not material:
        raise HTTPException(status_code=404, detail=f"Material with ID {material_id} not found")
    return material

@app.get("/api/subjects/{subject_id}/materials", response_model=List[Dict[str, Any]])
async def get_materials_for_subject(subject_id: str):
    return db.get_materials_for_subject(subject_id)

@app.post("/api/materials", response_model=Dict[str, Any])
async def create_material(
    title: str = Form(...),
    subject_id: str = Form(...),
    description: str = Form(...),
    material_type: str = Form(...),
    file: UploadFile = File(...)
):
    # Save the uploaded file
    file_extension = os.path.splitext(file.filename)[1]
    file_name = f"material_{uuid.uuid4().hex}{file_extension}"
    file_path = os.path.join(UPLOADS_DIR, file_name)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    material_data = {
        "title": title,
        "subjectId": subject_id,
        "description": description,
        "type": material_type,
        "fileUrl": f"/uploads/{file_name}",
        "dateAdded": datetime.now().isoformat()
    }
    
    return db.save_material(material_data)

# Submission endpoints
@app.get("/api/submissions/{submission_id}", response_model=Dict[str, Any])
async def get_submission(submission_id: str):
    submission = db.get_submission_by_id(submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail=f"Submission with ID {submission_id} not found")
    return submission

@app.get("/api/assignments/{assignment_id}/submissions", response_model=List[Dict[str, Any]])
async def get_submissions_for_assignment(assignment_id: str):
    return db.get_submissions_for_assignment(assignment_id)

@app.get("/api/students/{student_id}/submissions", response_model=List[Dict[str, Any]])
async def get_submissions_by_student(student_id: str):
    return db.get_submissions_by_student(student_id)

@app.post("/api/assignments/{assignment_id}/submit", response_model=Dict[str, Any])
async def submit_assignment(
    assignment_id: str,
    student_id: str = Form(...),
    student_name: str = Form(...),
    files: List[UploadFile] = File(...)
):
    # Save the uploaded files
    file_urls = []
    for file in files:
        file_extension = os.path.splitext(file.filename)[1]
        file_name = f"submission_{uuid.uuid4().hex}{file_extension}"
        file_path = os.path.join(UPLOADS_DIR, file_name)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        file_urls.append(f"/uploads/{file_name}")
    
    submission_data = {
        "studentId": student_id,
        "studentName": student_name,
        "files": file_urls
    }
    
    try:
        return db.submit_assignment(assignment_id, submission_data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.post("/api/submissions/{submission_id}/grade", response_model=Dict[str, Any])
async def grade_submission(submission_id: str, grade_data: GradeSubmission):
    try:
        return db.grade_submission(submission_id, grade_data.grade, grade_data.feedback)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

# Appeal endpoints
@app.post("/api/submissions/{submission_id}/appeal", response_model=Dict[str, Any])
async def create_appeal(submission_id: str, appeal_data: AppealCreate):
    try:
        return db.submit_appeal(submission_id, appeal_data.reason)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/submissions/{submission_id}/review-appeal", response_model=Dict[str, Any])
async def review_appeal(submission_id: str, review_data: GradeSubmission):
    try:
        return db.review_appeal(submission_id, review_data.grade, review_data.feedback)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

# --- Keep existing AI grading endpoint but with modified code ---
def grade_homework_with_task_file(task_path, solution_path, criteria):
    """
    Sends task file (PDF/Image) and solution image to Gemini for grading.
    """
    # ... keep existing code (grading function implementation)
    try:
        logger.info(f"Grading - Processing task file: {task_path}")
        file_extension = os.path.splitext(task_path)[1].lower()

        if file_extension in ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif']:
            task_file_data = Image.open(task_path)
            logger.info("Grading - Task file loaded as Image.")
        elif file_extension == '.pdf':
            logger.info("Grading - Uploading task PDF file...")
            mime_type, _ = mimetypes.guess_type(task_path)
            if not mime_type: mime_type = 'application/pdf'
            uploaded_task_file = genai.upload_file(path=task_path, mime_type=mime_type)
            task_file_data = uploaded_task_file
            logger.info(f"Grading - Task PDF uploaded: {uploaded_task_file.name}")
        else:
            return {"error": f"Unsupported task file type: {file_extension}"}

        logger.info(f"Grading - Loading solution image: {solution_path}")
        solution_img_data = Image.open(solution_path)
        logger.info("Grading - Solution image loaded.")

        model = genai.GenerativeModel('gemini-1.5-flash')

        prompt_part1 = "You are an AI grader for education assignments. Please grade the following solution according to the provided criteria."
        prompt_part2 = f"\n**Grading Criteria:**\n{criteria}\n\n**Student's Solution Image:**\n[Image below]"
        prompt_part3 = """
        Please provide the feedback for the solution in the following JSON format:
        {
            "score": "score",
            "feedback": "some feedback up to 70 words"
        }
        """

        content_list = [
            prompt_part1, task_file_data,
            prompt_part2, solution_img_data,
            prompt_part3
        ]

        logger.info("Grading - Sending request to Gemini API...")
        response = model.generate_content(content_list)
        logger.info("Grading - Gemini Response Received.")

        try:
            response_text = response.text
            print(response.text)
            if response_text.startswith("```json"): response_text = response_text.strip("```json\n")
            if response_text.endswith("```"): response_text = response_text.strip("\n```")
            result = json.loads(response_text)
            if "score" in result and "feedback" in result:
                result["score"] = int(result["score"])
                logger.info(f"Grading - Successfully parsed score: {result['score']}")
                return result
            else:
                logger.warning("Grading - Gemini response missing 'score' or 'feedback'.")
                return {"error": "Gemini response did not contain 'score' and 'feedback' keys.", "raw_response": response_text}
        except (json.JSONDecodeError, ValueError, AttributeError, TypeError) as parse_error:
            logger.error(f"Grading - Failed to parse Gemini response: {parse_error}", exc_info=True)
            return {"error": "Failed to parse Gemini response as JSON.", "raw_response": getattr(response, 'text', 'N/A')}

    except FileNotFoundError as e:
        logger.error(f"Grading - File not found: {e.filename}", exc_info=True)
        return {"error": f"File not found: {e.filename}"}
    except Exception as e:
        logger.error(f"Grading - An unexpected error occurred: {e}", exc_info=True)
        return {"error": f"An unexpected error occurred during grading: {e}"}

@app.post("/api/grade", summary="Grade Homework Submission")
async def grade_homework_endpoint(
    task_file: UploadFile = File(..., description="The homework task file (PDF or Image)"),
    solution_file: UploadFile = File(..., description="The student's solution image file"),
    criteria: str = Form(..., description="The grading criteria text")
):
    """
    Receives homework task file, solution image, and grading criteria.
    Processes the files using the Gemini API based on the criteria.
    Returns a JSON object with the calculated 'score' and 'feedback'.
    """
    # ... keep existing code (API endpoint implementation)
    logger.info(f"Endpoint /api/grade received request. Task: {task_file.filename}, Solution: {solution_file.filename}")

    temp_task_path = os.path.join(TEMP_UPLOAD_DIR, f"task_{os.urandom(8).hex()}_{task_file.filename}")
    temp_solution_path = os.path.join(TEMP_UPLOAD_DIR, f"solution_{os.urandom(8).hex()}_{solution_file.filename}")

    try:
        with open(temp_task_path, "wb") as buffer:
            shutil.copyfileobj(task_file.file, buffer)
        logger.info(f"Temporarily saved task file to {temp_task_path}")
        await task_file.close()

        with open(temp_solution_path, "wb") as buffer:
            shutil.copyfileobj(solution_file.file, buffer)
        logger.info(f"Temporarily saved solution file to {temp_solution_path}")
        await solution_file.close()

        grading_result = grade_homework_with_task_file(temp_task_path, temp_solution_path, criteria)

        if "error" in grading_result:
            logger.warning(f"Grading function returned an error: {grading_result['error']}")
            status_code = 400 if "Unsupported task file type" in grading_result["error"] or "File not found" in grading_result["error"] else 500
            raise HTTPException(status_code=status_code, detail=grading_result)
        else:
            logger.info(f"Grading successful for task: {task_file.filename}, solution: {solution_file.filename}")
            print(grading_result)
            return grading_result

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        logger.error(f"Unexpected error in /api/grade endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An unexpected server error occurred: {e}")
    finally:
        if os.path.exists(temp_task_path):
            try:
                os.remove(temp_task_path)
            except OSError:
                pass
        if os.path.exists(temp_solution_path):
            try:
                os.remove(temp_solution_path)
            except OSError:
                pass

# API Root endpoint
@app.get("/", summary="API Root")
def read_root():
    return {"message": "Gradiator API is running!", "version": "1.0.0"}

# Run the server if this file is executed directly
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
