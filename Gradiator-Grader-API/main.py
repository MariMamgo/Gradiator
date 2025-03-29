import os
import google.generativeai as genai
from PIL import Image
import sys
import json
import mimetypes
import shutil # For saving/copying uploaded files
import logging # For better server-side logging
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# --- Logging Setup ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- Gemini Configuration ---
try:
    api_key = "AIzaSyBcLcDg9pVhhIR9GSQI32tsPrGBCH5UXEc"
    if not api_key:
        # If running locally and forgot to set env var, fallback for convenience ONLY.
        # REMOVE THIS FALLBACK IN PRODUCTION or if sharing code.
        # api_key = "AIzaSyBcLcDg9pVhhIR9GSQI32tsPrGBCH5UXEc" # <--- DANGEROUS - REMOVE THIS LINE
        # logger.warning("API Key loaded from hardcoded fallback - THIS IS INSECURE, use environment variables.")
        # if not api_key: # Check again after fallback attempt
             raise ValueError("API key not found. Please set the GOOGLE_API_KEY environment variable.")

    genai.configure(api_key=api_key)
    logger.info("Gemini API configured.")
except ValueError as e:
    logger.error(f"Gemini Configuration Error: {e}")
    sys.exit(1) # Exit if API key is missing

# --- FastAPI App Initialization ---
app = FastAPI(title="Homework Grading API", version="1.0.0")

# --- CORS Configuration ---
# Update origins based on where your Tailwind UI is served during development/production
origins = [
    "http://localhost",
    "http://localhost:3000", # Common React port
    "http://localhost:5173", # Common Vite port
    "http://localhost:8080", # Common Vue port
    # Add your production frontend URL here, e.g., "https://your-app-domain.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Directory for Temporary File Uploads ---
TEMP_UPLOAD_DIR = "temp_uploads"
os.makedirs(TEMP_UPLOAD_DIR, exist_ok=True)

# --- Your Existing Grading Logic (Keep it as a separate function) ---
# (No changes needed inside this function itself, assuming it works standalone)
def grade_homework_with_task_file(task_path, solution_path, criteria):
    """
    Sends task file (PDF/Image) and solution image to Gemini for grading.
    (Your existing function code goes here - Copied from your provided script)
    """
    task_file_data = None
    solution_img_data = None
    uploaded_task_file = None

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
            # Potential Blocking Call: Consider running in threadpool for high concurrency
            uploaded_task_file = genai.upload_file(path=task_path, mime_type=mime_type)
            task_file_data = uploaded_task_file
            logger.info(f"Grading - Task PDF uploaded: {uploaded_task_file.name}")
        else:
            # Return error dict, will be handled by the endpoint
            return {"error": f"Unsupported task file type: {file_extension}"}

        logger.info(f"Grading - Loading solution image: {solution_path}")
        solution_img_data = Image.open(solution_path)
        logger.info("Grading - Solution image loaded.")

        model = genai.GenerativeModel('gemini-1.5-flash')

        # --- Prompts (Keep your existing prompts) ---
        prompt_part1 = "..." # Your prompt part 1
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
        # Potential Blocking Call: Consider running in threadpool
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
                return result # Success
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
    finally:
        # Cleanup of uploaded file reference (optional, Gemini might handle this)
        # if uploaded_task_file: try: genai.delete_file(...) etc.
        pass


# --- API Endpoint Definition ---
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
    logger.info(f"Endpoint /api/grade received request. Task: {task_file.filename}, Solution: {solution_file.filename}")

    # Create temporary paths for saving uploaded files
    # Using unique names to avoid collisions if multiple requests happen concurrently
    temp_task_path = os.path.join(TEMP_UPLOAD_DIR, f"task_{os.urandom(8).hex()}_{task_file.filename}")
    temp_solution_path = os.path.join(TEMP_UPLOAD_DIR, f"solution_{os.urandom(8).hex()}_{solution_file.filename}")
    logger.debug(f"Temp task path: {temp_task_path}")
    logger.debug(f"Temp solution path: {temp_solution_path}")

    try:
        # Save the uploaded task file temporarily
        try:
            with open(temp_task_path, "wb") as buffer:
                shutil.copyfileobj(task_file.file, buffer)
            logger.info(f"Temporarily saved task file to {temp_task_path}")
        except Exception as e:
            logger.error(f"Failed to save temporary task file {temp_task_path}: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail="Could not save task file for processing.")
        finally:
            await task_file.close() # Close the upload stream

        # Save the uploaded solution file temporarily
        try:
            with open(temp_solution_path, "wb") as buffer:
                shutil.copyfileobj(solution_file.file, buffer)
            logger.info(f"Temporarily saved solution file to {temp_solution_path}")
        except Exception as e:
            logger.error(f"Failed to save temporary solution file {temp_solution_path}: {e}", exc_info=True)
            # Clean up already saved task file if solution saving fails
            if os.path.exists(temp_task_path): os.remove(temp_task_path)
            raise HTTPException(status_code=500, detail="Could not save solution file for processing.")
        finally:
            await solution_file.close() # Close the upload stream

        # --- Call your existing grading function ---
        # Pass the paths of the *saved temporary files*
        # Note: This call might block if grade_homework_with_task_file has long sync operations.
        # For high load, consider running it in a thread pool:
        # import asyncio
        # loop = asyncio.get_event_loop()
        # grading_result = await loop.run_in_executor(None, grade_homework_with_task_file, temp_task_path, temp_solution_path, criteria)
        grading_result = grade_homework_with_task_file(temp_task_path, temp_solution_path, criteria)


        # --- Process the result ---
        if "error" in grading_result:
            logger.warning(f"Grading function returned an error: {grading_result['error']}")
            # Determine appropriate status code (e.g., 400 for bad input like unsupported file type, 500 for internal errors)
            status_code = 400 if "Unsupported task file type" in grading_result["error"] or "File not found" in grading_result["error"] else 500
            # Return the error details from the grading function
            raise HTTPException(status_code=status_code, detail=grading_result)
        else:
            logger.info(f"Grading successful for task: {task_file.filename}, solution: {solution_file.filename}")
            print(grading_result)
            return grading_result # FastAPI automatically converts dict to JSON

    except HTTPException as http_exc:
         # Re-raise HTTPExceptions so FastAPI handles them correctly
         raise http_exc
    except Exception as e:
        # Catch any unexpected errors during file handling or function call
        logger.error(f"Unexpected error in /api/grade endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An unexpected server error occurred: {e}")

    finally:
        # --- Clean up temporary files ---
        logger.debug("Cleaning up temporary files...")
        if os.path.exists(temp_task_path):
            try:
                os.remove(temp_task_path)
                logger.debug(f"Removed temp task file: {temp_task_path}")
            except OSError as e:
                 logger.warning(f"Could not remove temp task file {temp_task_path}: {e}")
        if os.path.exists(temp_solution_path):
            try:
                os.remove(temp_solution_path)
                logger.debug(f"Removed temp solution file: {temp_solution_path}")
            except OSError as e:
                 logger.warning(f"Could not remove temp solution file {temp_solution_path}: {e}")


# --- Optional: Root endpoint for testing API is running ---
@app.get("/", summary="API Root", include_in_schema=False)
def read_root():
    return {"message": "Homework Grading API is running!"}

@app.post("/api/assignments")
async def create_assignment(
    title: str = Form(...),
    criteria: str = Form(...),
    task_file: UploadFile = File(...),
):
    # Save task file
    task_path = os.path.join(TEMP_UPLOAD_DIR, f"task_{uuid.uuid4().hex}{os.path.splitext(task_file.filename)[1]}")
    
    with open(task_path, "wb") as buffer:
        shutil.copyfileobj(task_file.file, buffer)
    
    return {
        "id": uuid.uuid4().hex,
        "title": title,
        "criteria": criteria,
        "file_url": f"/uploads/{os.path.basename(task_path)}"
    }