import os
import google.generativeai as genai
from PIL import Image # Import the Image module from Pillow
import sys
import json # Import the json library to parse the response
import mimetypes # To help guess file types for upload

# --- Configuration ---
# CRITICAL SECURITY WARNING: Never hardcode your API key like you did previously.
# Use environment variables. Set the GOOGLE_API_KEY environment variable in your terminal.
try:
    # Reverted to using environment variable for security
    api_key =  "AIzaSyBcLcDg9pVhhIR9GSQI32tsPrGBCH5UXEc"
    if not api_key:
        raise ValueError("API key not found. Please set the GOOGLE_API_KEY environment variable.")
    genai.configure(api_key=api_key)
except ValueError as e:
    print(f"Error: {e}")
    sys.exit(1)

# --- File Paths (Update these) ---
task_file_path = "hw2_task.jpg"  # <--- Path to the PDF or JPG/PNG task file
solution_image_path = "hw2.jpg"     # <--- Path to the student's solution image

# --- Grading Criteria (Keep as text or load from another file if needed) ---
grading_criteria = """
- if computation is correct directly write 100 point
- Correctly applies the chosen method (50 points)
- Arrives at the correct solutions for x (50 points)
- Deduct points for minor calculation errors, but award partial credit if method is sound.
- If the solution is unreadable or irrelevant, assign 0 points.
"""

# --- Function to Grade Homework with Task File ---
def grade_homework_with_task_file(task_path, solution_path, criteria):
    """
    Sends task file (PDF/Image) and solution image to Gemini for grading.

    Args:
        task_path (str): Path to the task description file (PDF or Image).
        solution_path (str): Path to the student's solution image file.
        criteria (str): The grading criteria text.

    Returns:
        dict: A dictionary containing the 'score' and 'feedback',
              or an error message.
    """
    task_file_data = None
    solution_img_data = None
    uploaded_task_file = None # To keep track of uploaded file for potential cleanup

    try:
        # --- 1. Load/Upload Task File ---
        print(f"Processing task file: {task_path}")
        file_extension = os.path.splitext(task_path)[1].lower()

        if file_extension in ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif']:
            task_file_data = Image.open(task_path)
            print("Task file loaded as Image.")
        elif file_extension == '.pdf':
            # Use upload_file for PDFs (and potentially other types)
            print("Uploading task PDF file...")
            # Guess the MIME type
            mime_type, _ = mimetypes.guess_type(task_path)
            if not mime_type:
                mime_type = 'application/pdf' # Default if guess fails
            uploaded_task_file = genai.upload_file(path=task_path, mime_type=mime_type)
            task_file_data = uploaded_task_file # Pass the file reference
            print(f"Task PDF uploaded successfully: {uploaded_task_file.name}")
        else:
            return {"error": f"Unsupported task file type: {file_extension}. Please use PDF or common image formats."}

        # --- 2. Load Solution Image ---
        print(f"Loading solution image: {solution_path}")
        solution_img_data = Image.open(solution_path)
        print("Solution image loaded.")

        # --- 3. Select Model ---
        # Choose a multimodal model capable of handling images/files
        model = genai.GenerativeModel('gemini-1.5-flash') # Or 'gemini-1.5-pro'

        # --- 4. Construct the Prompt and Content List ---
        # The prompt needs to guide the AI on how to use the provided files.
        # The content list interleaves text instructions with the file data.
        prompt_part1 = f"""
You are an AI Homework Grader. Your task is to evaluate the student's solution (provided as an image) based on the homework task (provided as a separate file/image) and the grading criteria (provided as text).

**Homework Task File:**
[The task description is in the file provided below]
"""
        prompt_part2 = f"""
**Grading Criteria:**
{criteria}

**Student's Solution Image:**
[The student's work is in the image provided below]
"""
        prompt_part3 = """
**Instructions:**
0. If answer is correct directly write 100 points.
1. Carefully analyze the **Homework Task File** to understand the question(s).
2. Analyze the **Student's Solution Image** to see their work.
3. Compare the student's solution against the task requirements and the **Grading Criteria**.
4. Determine a score out of 100 points based on the criteria. Be fair and assign partial credit where appropriate.1
5. Provide brief, constructive feedback explaining the score, highlighting strengths and areas for improvement based on the criteria and the task.
6. Respond ONLY in the following JSON format:
   {{
     "score": <integer score between 0 and 100>,
     "feedback": "<Your constructive feedback here>"
   }}

Evaluate the task file and the solution image, then provide your assessment in the specified JSON format.
"""
        # Construct the content list for the API call
        content_list = [
            prompt_part1,
            task_file_data,  # Include the loaded Image object or uploaded File reference
            prompt_part2,
            solution_img_data, # Include the loaded solution Image object
            prompt_part3
        ]

        # --- 5. Send Request to Gemini ---
        print("Sending request to Gemini API for grading...")
        response = model.generate_content(content_list)
        print("Gemini Response Received.")

        # --- 6. Parse the Response ---
        try:
            response_text = response.text
            # Clean potential markdown code fences
            if response_text.startswith("```json"):
                response_text = response_text.strip("```json\n")
            if response_text.endswith("```"):
                 response_text = response_text.strip("\n```")

            result = json.loads(response_text)

            if "score" in result and "feedback" in result:
                result["score"] = int(result["score"])
                return result
            else:
                return {"error": "Gemini response did not contain 'score' and 'feedback' keys.", "raw_response": response_text}

        except json.JSONDecodeError:
            return {"error": "Failed to parse Gemini response as JSON.", "raw_response": response.text}
        except Exception as e:
             return {"error": f"Error processing Gemini response: {e}", "raw_response": response.text if hasattr(response, 'text') else 'No text in response'}

    except FileNotFoundError as e:
        return {"error": f"File not found: {e.filename}"}
    except Exception as e:
        return {"error": f"An unexpected error occurred: {e}"}

    finally:
        # Optional: Clean up uploaded file if it exists
        # Note: Uploaded files might persist for a period unless deleted.
        # Deleting immediately might be desired in production to manage resources/costs.
        # if uploaded_task_file:
        #     try:
        #         print(f"Attempting to delete uploaded file: {uploaded_task_file.name}")
        #         genai.delete_file(uploaded_task_file.name)
        #         print("Uploaded file deleted.")
        #     except Exception as delete_error:
        #         print(f"Warning: Could not delete uploaded file {uploaded_task_file.name}. Error: {delete_error}")
        pass # Keep the file for now in this example


# --- Main Execution ---
if __name__ == "__main__":
    # Check if both files exist before proceeding
    if not os.path.exists(task_file_path):
        print(f"Error: Task file not found at '{task_file_path}'")
    elif not os.path.exists(solution_image_path):
        print(f"Error: Solution image file not found at '{solution_image_path}'")
    else:
        grading_result = grade_homework_with_task_file(task_file_path, solution_image_path, grading_criteria)

        print("\n--- Grading Result ---")
        if "error" in grading_result:
            print(f"An error occurred: {grading_result['error']}")
            if "raw_response" in grading_result:
                print(f"Raw Response from Gemini:\n{grading_result['raw_response']}")
        else:
            print(f"Score: {grading_result.get('score', 'N/A')} / 100")
            print(f"Feedback: {grading_result.get('feedback', 'N/A')}")
        print("----------------------")