import os
import google.generativeai as genai
from PIL import Image # Import the Image module from Pillow
import sys
import json # Import the json library to parse the response

# --- Configuration ---
# IMPORTANT: Store your API key securely using an environment variable.
# Set the GOOGLE_API_KEY environment variable in your terminal before running.
try:
    api_key = "AIzaSyBcLcDg9pVhhIR9GSQI32tsPrGBCH5UXEc"
    if not api_key:
        raise ValueError("API key not found. Please set the GOOGLE_API_KEY environment variable.")
    genai.configure(api_key=api_key)
except ValueError as e:
    print(f"Error: {e}")
    sys.exit(1)

# --- Homework Details (Replace with actual details) ---
image_path = "hw2.jpg" # <--- CHANGE THIS TO YOUR IMAGE FILE PATH

# Describe the homework task given to the student
task_description = """
Problem: Solve the quadratic equation x^2 - 5x + 6 = 0.
Show your steps clearly.
"""

# Define the grading criteria
grading_criteria = """
- Correctly identifies the quadratic formula or factoring method (20 points)
- Correctly applies the chosen method (30 points)
- Shows clear and logical steps (20 points)
- Arrives at the correct solutions for x (30 points)
- Deduct points for minor calculation errors, but award partial credit if method is sound.
- If the solution is unreadable or irrelevant, assign 0 points.
"""

# --- Function to Grade Homework ---
def grade_homework_from_image(img_path, task_desc, criteria):
    """
    Sends homework details and an image to the Gemini API for grading.

    Args:
        img_path (str): The file path to the image of the solution.
        task_desc (str): The description of the homework task.
        criteria (str): The grading criteria.

    Returns:
        dict: A dictionary containing the 'score' and 'feedback',
              or an error message.
    """
    try:
        print(f"Loading image: {img_path}")
        img = Image.open(img_path)

        # Choose a multimodal model
        # model = genai.GenerativeModel('gemini-pro-vision') # Older model
        model = genai.GenerativeModel('gemini-1.5-flash') # Or 'gemini-1.5-pro'

        # --- Construct the Prompt ---
        # This is the most crucial part! Clearly instruct the AI.
        prompt = f"""
        You are an AI Homework Grader. Your task is to evaluate the student's handwritten solution provided in the image based on the given task description and grading criteria.

        **Homework Task Description:**
        {task_desc}

        **Grading Criteria:**
        {criteria}

        **Instructions:**
        1. Analyze the student's solution in the image.
        2. Compare the solution against the task description and grading criteria.
        3. Determine a score out of 100 points based on the criteria. Be fair and assign partial credit where appropriate based on the criteria.
        4. Provide brief, constructive feedback explaining the score, highlighting strengths and areas for improvement based on the criteria.
        5. Respond ONLY in the following JSON format:
           {{
             "score": <integer score between 0 and 100>,
             "feedback": "<Your constructive feedback here>"
           }}

        **Student's Solution Image:**
        [Image is provided separately]

        Evaluate the image and provide your assessment in the specified JSON format.
        """

        print("Sending request to Gemini API for grading...")
        # Send the prompt and the image to the model
        response = model.generate_content([prompt, img])

        print("Gemini Response Received.")

        # --- Parse the Response ---
        try:
            # Extract the text part of the response, which should be JSON
            response_text = response.text
            # Clean potential markdown code fences if the model adds them
            if response_text.startswith("```json"):
                response_text = response_text.strip("```json\n")
            if response_text.endswith("```"):
                 response_text = response_text.strip("\n```")

            # Parse the JSON string into a Python dictionary
            result = json.loads(response_text)

            # Validate the structure (basic check)
            if "score" in result and "feedback" in result:
                # Ensure score is an integer
                result["score"] = int(result["score"])
                return result
            else:
                return {"error": "Gemini response did not contain 'score' and 'feedback' keys.", "raw_response": response_text}

        except json.JSONDecodeError:
            return {"error": "Failed to parse Gemini response as JSON.", "raw_response": response.text}
        except Exception as e:
             return {"error": f"Error processing Gemini response: {e}", "raw_response": response.text if hasattr(response, 'text') else 'No text in response'}


    except FileNotFoundError:
        return {"error": f"Image file not found at '{img_path}'"}
    except Exception as e:
        # Catch other potential errors (API connection, invalid image, etc.)
        return {"error": f"An unexpected error occurred: {e}"}

# --- Main Execution ---
if __name__ == "__main__":
    if not os.path.exists(image_path):
        print(f"Error: The specified image file '{image_path}' does not exist.")
        print("Please update the 'image_path' variable in the script.")
    else:
        grading_result = grade_homework_from_image(image_path, task_description, grading_criteria)

        print("\n--- Grading Result ---")
        if "error" in grading_result:
            print(f"An error occurred: {grading_result['error']}")
            if "raw_response" in grading_result:
                print(f"Raw Response from Gemini:\n{grading_result['raw_response']}")
        else:
            print(f"Score: {grading_result.get('score', 'N/A')} / 100")
            print(f"Feedback: {grading_result.get('feedback', 'N/A')}")
        print("----------------------")