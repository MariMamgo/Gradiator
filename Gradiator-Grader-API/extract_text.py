import os
import google.generativeai as genai
from PIL import Image # Import the Image module from Pillow
import sys

# --- Configuration ---
# IMPORTANT: Store your API key securely. Using an environment variable is recommended.
# Set the GOOGLE_API_KEY environment variable in your terminal before running the script:
# Linux/macOS: export GOOGLE_API_KEY='YOUR_API_KEY'
# Windows CMD: set GOOGLE_API_KEY=YOUR_API_KEY
# Windows PowerShell: $env:GOOGLE_API_KEY='YOUR_API_KEY'
try:
    api_key = "AIzaSyBcLcDg9pVhhIR9GSQI32tsPrGBCH5UXEc"
    if not api_key:
        raise ValueError("API key not found. Please set the GOOGLE_API_KEY environment variable.")
    genai.configure(api_key=api_key)
except ValueError as e:
    print(f"Error: {e}")
    sys.exit(1) # Exit if API key is not set

# Specify the path to your homework solution image
image_path = "ex1.png" # <--- CHANGE THIS TO YOUR IMAGE FILE PATH

# --- Function to Extract Text ---
def extract_text_from_image(img_path):
    """
    Sends an image to the Gemini API (vision model) and asks it to extract text.

    Args:
        img_path (str): The file path to the image.

    Returns:
        str: The extracted text, or an error message if something goes wrong.
    """
    try:
        print(f"Loading image: {img_path}")
        # Open the image file using Pillow
        img = Image.open(img_path)

        # Select the Gemini model that supports vision
        # 'gemini-pro-vision' was the common one, now 'gemini-1.5-flash' or 'gemini-1.5-pro'
        # often handle multimodal well. Check Google's documentation for the latest recommended model.
        # Let's try with a newer model known for multimodal capabilities.
        # model = genai.GenerativeModel('gemini-pro-vision') # Older model
        model = genai.GenerativeModel('gemini-1.5-flash') # Or 'gemini-1.5-pro'

        # Create the prompt: Ask Gemini specifically to extract text
        prompt = "Extract all text visible in this image. Only return the text content."

        print("Sending image and prompt to Gemini API...")
        # Send the image and prompt to the model
        # The library expects a list of content parts (text, image)
        response = model.generate_content([prompt, img])

        # Make sure the response finished generating and doesn't have blocking reasons
        # Accessing response.text directly often works, but checking candidates can be more robust
        if response.candidates and response.candidates[0].content.parts:
             extracted_text = response.candidates[0].content.parts[0].text
             print("Gemini Response Received.")
             return extracted_text
        elif response.text: # Fallback to response.text if candidate structure isn't as expected
             print("Gemini Response Received (using direct .text).")
             return response.text
        else:
             # Check for safety blocks or other issues
             print("Warning: Gemini did not return text content. Checking response details...")
             print(f"Prompt Feedback: {response.prompt_feedback}")
             # You might need to inspect response.candidates[0].finish_reason and safety_ratings
             return f"Error: Could not extract text. Response details: {response.prompt_feedback}"


    except FileNotFoundError:
        return f"Error: Image file not found at '{img_path}'"
    except Exception as e:
        # Catch other potential errors (API connection issues, invalid image format, etc.)
        return f"An unexpected error occurred: {e}"

# --- Main Execution ---
if __name__ == "__main__":
    if not os.path.exists(image_path):
        print(f"Error: The specified image file '{image_path}' does not exist.")
        print("Please update the 'image_path' variable in the script.")
    else:
        result = extract_text_from_image(image_path)
        print("\n--- Extracted Text ---")
        print(result)
        print("----------------------")