
# Gradiator Backend API

This is the FastAPI backend for the Gradiator application which provides persistent storage and API endpoints for managing users, subjects, assignments, materials, and submissions.

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

### Running the Server

Start the FastAPI server with:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

This will start the server on http://localhost:8000.

### API Documentation

FastAPI automatically generates interactive API documentation. You can access it at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Troubleshooting

If you encounter the error "module 'datetime' has no attribute 'now'", add this import to the beginning of main.py:

```python
from datetime import datetime
```

## Features

- User management
- Subject management
- Assignment management
- Material management
- Submission and grading
- Appeals process
- AI-powered grading using Gemini

## Endpoints

The API provides endpoints for all educational entities:

- `/api/users` - User management
- `/api/subjects` - Subject management
- `/api/assignments` - Assignment management
- `/api/materials` - Material management
- `/api/submissions` - Submission management
- `/api/grade` - AI grading service

## File Storage

Uploaded files are stored in the `uploads` directory. Each file gets a unique name to prevent conflicts.

## Offline Mode

If the backend server is not running, the frontend will automatically fall back to localStorage for data persistence. This ensures that the application remains functional, though with limited capabilities (no file uploads or AI grading).

To get full functionality including AI-powered grading, make sure the backend server is running before using the application.
