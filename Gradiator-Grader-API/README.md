
# Gradiator Backend API

This is the FastAPI backend for the Gradiator application which provides persistent storage and AI-powered grading capabilities.

## Getting Started

### Prerequisites

- Python 3.9 or higher
- pip (Python package installer)

### Installation

1. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   ```

2. Activate the virtual environment:
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

3. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```

4. **IMPORTANT**: Create a `.env` file in the Gradiator-Grader-API directory with your Google API key:
   ```
   GOOGLE_API_KEY=your_google_api_key_here
   ```
   You can also use the API key that's already in the code: `AIzaSyBcLcDg9pVhhIR9GSQI32tsPrGBCH5UXEc`

### Running the Server

Start the FastAPI server with:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

This will start the server on http://localhost:8000.

## Troubleshooting

### Common Issues

1. **"Failed to fetch" error in frontend**
   - Make sure the backend server is running on port 8000
   - Check that you don't have any CORS issues (the backend is configured to allow all origins)

2. **"module 'datetime' has no attribute 'now'" error**
   - This is already fixed in the latest version of the code

3. **"No module named 'google.generativeai'" error**
   - Make sure you've installed all the requirements with `pip install -r requirements.txt`

4. **AI Grading not working**
   - Check that you have a valid Google API key in the `.env` file or directly in the code

### Terminal Commands to Check Backend Status

If you're not sure if the backend is running:

- On Windows, check for the process:
  ```
  netstat -ano | findstr :8000
  ```

- On macOS/Linux:
  ```
  lsof -i :8000
  ```

## Using the API

When the backend is running, the frontend will automatically connect to it and you'll have access to:

1. Persistent data storage (assignments, submissions, etc.)
2. AI-powered grading via the Gemini API
3. File upload and storage capabilities

If the backend is not running, the application will fall back to using localStorage for data persistence, but AI grading and file uploads won't work properly.
