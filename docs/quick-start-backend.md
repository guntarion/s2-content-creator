# Quick Start for Backend Integration

**🚨 For FastAPI Backend Developers - Get the frontend working in 5 minutes**

## Problem: "Start Demo Workflow" Error

The frontend is trying to connect to your FastAPI backend but getting errors. Here's the quickest fix:

## 🚀 Option 1: Use Mock API (Immediate Fix)

**Skip backend issues entirely** - test the frontend with simulated data:

```bash
# In the frontend project root
echo "NEXT_PUBLIC_ENABLE_MOCK_API=true" > .env.local
npm run dev
```

Visit `http://localhost:3000` and click "Start Demo Workflow" - **it will work immediately** with realistic mock data.

## 🔧 Option 2: Fix Backend Integration

### Step 1: Check Your FastAPI Server

```bash
# Test if your backend is running
curl http://localhost:8000/health
```

**If this fails**, start your FastAPI server:
```bash
cd /path/to/fastapi-backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Step 2: Test Blog Generation Endpoint

```bash
curl -X POST http://localhost:8000/blog/generate \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Blog",
    "industry": "technology", 
    "purpose": "educational"
  }'
```

**Expected response:**
```json
{
  "workflow_id": "some-uuid-string",
  "status": "started",
  "message": "Blog post generation workflow started"
}
```

**If you get an error here**, your backend `/blog/generate` endpoint has issues.

### Step 3: Test Status Tracking

```bash
# Use the workflow_id from step 2
curl http://localhost:8000/blog/workflow-status/YOUR_WORKFLOW_ID
```

**Expected response:**
```json
{
  "id": "your-workflow-id",
  "status": "processing",
  "progress": 45,
  "current_step": "Generating content",
  "result": null,
  "error": null,
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:05:00Z"
}
```

**If you get 404 or null**, your status tracking is broken.

## 🐛 Most Common Backend Issues

### 1. CORS Not Configured

Add this to your FastAPI app:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 2. Workflow Storage Issues

Your `workflow_status` dict might not persist:
```python
# Make sure this is global or properly stored
workflow_status = {}  # This should persist between requests

async def update_status(workflow_id: str, status: str, progress: int, step: str):
    workflow_status[workflow_id] = {
        "id": workflow_id,
        "status": status,  # "pending" | "processing" | "completed" | "failed"
        "progress": progress,  # 0-100
        "current_step": step,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
```

### 3. UUID Generation

```python
import uuid

# Generate proper UUIDs
workflow_id = str(uuid.uuid4())
```

### 4. Progress Updates

The frontend expects progress 0-100 across these steps:
- keyword_research: 0-10%
- content_generation: 10-25%
- seo_optimization: 25-40%
- image_prompt_generation: 40-60%
- image_generation: 60-75%
- thumbnail_creation: 75-85%
- social_snippet_generation: 85-100%

## 📋 Quick Checklist

Test these in order:

1. [ ] FastAPI server is running on port 8000
2. [ ] CORS is configured for `http://localhost:3000`
3. [ ] `POST /blog/generate` returns a workflow_id
4. [ ] `GET /blog/workflow-status/{id}` returns status object
5. [ ] Progress goes from 0 to 100 during workflow
6. [ ] `GET /blog/result/{id}` returns complete blog when done

## 🔍 Debug Mode

Add this to your FastAPI app for debugging:
```python
import logging
logging.basicConfig(level=logging.DEBUG)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"Request: {request.method} {request.url}")
    response = await call_next(request)
    print(f"Response: {response.status_code}")
    return response
```

## 💡 Working Backend Example

Here's a minimal working backend for testing:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uuid
from datetime import datetime
from typing import Dict, Any

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Storage
workflow_status = {}
generated_posts = {}

@app.post("/blog/generate")
async def generate_blog(request: dict):
    workflow_id = str(uuid.uuid4())
    
    # Initialize status
    workflow_status[workflow_id] = {
        "id": workflow_id,
        "status": "processing",
        "progress": 0,
        "current_step": "Starting workflow",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    
    return {
        "workflow_id": workflow_id,
        "status": "started",
        "message": "Blog post generation workflow started"
    }

@app.get("/blog/workflow-status/{workflow_id}")
async def get_status(workflow_id: str):
    if workflow_id not in workflow_status:
        return {"error": "Workflow not found"}, 404
    return workflow_status[workflow_id]

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}
```

This minimal backend will let the frontend connect and start workflows, even if they don't actually generate content.

## 🚀 Next Steps

1. **Get it working**: Use mock API or minimal backend
2. **Fix your endpoints**: Follow the [Backend Integration Guide](backend-integration.md)
3. **Test thoroughly**: Use the curl commands above
4. **Enable real backend**: Set `NEXT_PUBLIC_ENABLE_MOCK_API=false`

The frontend is designed to work seamlessly once your backend returns the expected data formats. The mock API shows exactly what the frontend expects - just replicate that behavior in your FastAPI endpoints.