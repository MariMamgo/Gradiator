import io
import os
import argparse # To easily get the image path from the command line

# Imports the Google Cloud client library
try:
    from google.cloud import vision
except ImportError:
    print("ERROR: The 'google-cloud-vision' library is not installed.")
    print("Please install it by running: pip install google-cloud-vision")
    exit() # Exit the script if the essential library is missing

def detect_text_from_image(image_path, credentials_path=None):
    """
    Detects text in an image file using Google Cloud Vision API
    and prints the result to the console.

    Args:
        image_path (str): The path to the image file.
        credentials_path (str, optional): Path to the service account key JSON file.
                                         If None, tries to use Application Default Credentials
                                         (e.g., GOOGLE_APPLICATION_CREDENTIALS env var).
                                         Defaults to None.
    """
    print(f"Attempting to process image: {image_path}")

    # --- Authentication ---
    # Use explicit credentials if path is provided, otherwise rely on ADC
    try:
        if credentials_path:
             # Ensure the credentials file exists before initializing the client
            if not os.path.isfile(credentials_path):
                print(f"ERROR: Credentials file not found at '{credentials_path}'")
                return # Stop execution if credentials file is specified but missing
            print(f"Using credentials from: {credentials_path}")
            client = vision.ImageAnnotatorClient.from_service_account_json(credentials_path)
        else:
            # Attempt to use Application Default Credentials (ADC)
            # This checks GOOGLE_APPLICATION_CREDENTIALS env var, gcloud auth login, etc.
            print("Attempting to use Application Default Credentials (e.g., GOOGLE_APPLICATION_CREDENTIALS environment variable or gcloud auth).")
            client = vision.ImageAnnotatorClient()
            # A check to see if credentials were implicitly found (optional but good practice)
            # This will raise google.auth.exceptions.DefaultCredentialsError if none are found
            client.text_detection(image=vision.Image(content=b'')) # Dummy call to trigger auth check early

    except Exception as auth_error:
         print(f"\n--- AUTHENTICATION ERROR ---")
         print(f"Failed to initialize Google Cloud Vision client: {auth_error}")
         print("Please ensure:")
         print("  1. You have authenticated using 'gcloud auth application-default login'")
         print("  2. OR you have set the GOOGLE_APPLICATION_CREDENTIALS environment variable to point to your service account key file.")
         print("  3. OR you are providing a valid path to the key file using the -c flag.")
         print("----------------------------")
         return # Stop execution

    # --- Image Loading ---
    if not os.path.isfile(image_path):
        print(f"ERROR: Image file not found at '{image_path}'")
        return

    try:
        print("Reading image file...")
        with io.open(image_path, 'rb') as image_file:
            content = image_file.read()
        image = vision.Image(content=content)
        print("Image loaded successfully.")
    except Exception as e:
        print(f"ERROR: Could not read image file '{image_path}': {e}")
        return

    # --- API Call ---
    try:
        print("Sending request to Google Cloud Vision API...")
        response = client.text_detection(image=image)
        print("Received response from API.")

        # --- Error Handling (API Response) ---
        if response.error.message:
            # This handles errors reported by the API itself (e.g., invalid image format)
            print(f"\n--- API Error ---")
            print(f"Google Cloud Vision API returned an error: {response.error.message}")
            print(f"Details: {response.error.details}")
            print("-----------------")
            return

    except Exception as api_call_error:
        # This handles errors during the network request or client-side issues
        print(f"\n--- API Call Failed ---")
        print(f"An error occurred while calling the Vision API: {api_call_error}")
        print("Check your network connection and API quota.")
        print("-----------------------")
        return

    # --- Process and Print Results ---
    texts = response.text_annotations
    if texts:
        extracted_text = texts[0].description  # The first annotation is the full detected text
        print("\n--- Extracted Text ---")
        print(extracted_text)
        print("----------------------")
    else:
        print("\n--- Result ---")
        print("No text detected in the image.")
        print("--------------")

# --- Main execution ---
if __name__ == "__main__":
    # Set up argument parser for command-line execution
    parser = argparse.ArgumentParser(description="Extract text from an image using Google Cloud Vision.")
    parser.add_argument("image_path", help="The path to the image file you want to process.")
    parser.add_argument("-c", "--credentials", help="Optional: Path to your Google Cloud service account JSON key file.", default=None)

    args = parser.parse_args()

    # Call the main function with the provided arguments
    detect_text_from_image("hw1.jpg", args.credentials)