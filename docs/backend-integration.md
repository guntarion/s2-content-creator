# Backend Integration Guide

This document provides comprehensive guidance for the FastAPI backend team to understand and integrate with the frontend application.

## 🚨 Current Issues

### "Start Demo Workflow" Error
The demo workflow is failing because the frontend sends a request but the backend workflow tracking may have issues. Here's what the frontend expects:

## 📡 Frontend → Backend Communication Flow

### 1. Blog Generation Request
**Frontend sends:** `POST /blog/generate`

```typescript
// Demo data that frontend sends
const demoData: BlogRequest = {
  title: 'The Future of AI in Healthcare: Transforming Patient Care',
  industry: 'healthcare',
  purpose: 'educational',
  target_audience: 'healthcare professionals',
  word_count: 1200,
  include_images: true,
  seo_focus: true,
  keyword_research_enabled: true,
};
```

**Backend should respond with:**
```json
{
  "workflow_id": "uuid-string",
  "status": "started",
  "message": "Blog post generation workflow started"
}
```

### 2. Status Tracking
**Frontend polls:** `GET /blog/workflow-status/{workflow_id}`

**Expected response format:**
```json
{
  "id": "workflow-uuid",
  "status": "processing",
  "progress": 45,
  "current_step": "Generating content",
  "result": null,
  "error": null,
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:05:00Z"
}
```

**Status field values:**
- `"pending"` - Workflow queued
- `"processing"` - Workflow running  
- `"completed"` - Workflow finished successfully
- `"failed"` - Workflow encountered an error

### 3. Final Result
**Frontend requests:** `GET /blog/result/{workflow_id}`

**Expected response:**
```json
{
  "content": "# Blog Title\n\nMarkdown content here...",
  "seo_title": "SEO Optimized Title (max 60 chars)",
  "meta_description": "Meta description (150-160 chars)",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "tags": ["tag1", "tag2"],
  "featured_image_url": "https://spaces.digitalocean.com/image.jpg",
  "thumbnail_url": "https://spaces.digitalocean.com/thumb.jpg",
  "social_media_snippet": "Social media ready text with emojis 🚀",
  "estimated_read_time": 5
}
```

## 🔧 Backend Implementation Requirements

### 1. Workflow Status Management
The frontend expects specific progress ranges for each step:

```python
WORKFLOW_STEPS = {
    "keyword_research": {"start": 0, "end": 10},
    "content_generation": {"start": 10, "end": 25}, 
    "seo_optimization": {"start": 25, "end": 40},
    "image_prompt_generation": {"start": 40, "end": 60},
    "image_generation": {"start": 60, "end": 75},
    "thumbnail_creation": {"start": 75, "end": 85},
    "social_snippet_generation": {"start": 85, "end": 100}
}
```

### 2. Status Update Method
Here's how your `update_status` method should work:

```python
async def update_status(self, workflow_id: str, status: str, progress: int, step: str, result: Optional[Dict] = None, error: Optional[str] = None):
    """Update workflow status - Frontend compatible"""
    existing_status = workflow_status.get(workflow_id, {})
    created_at = existing_status.get("created_at", datetime.now())
    
    workflow_status[workflow_id] = {
        "id": workflow_id,
        "status": status,  # "pending" | "processing" | "completed" | "failed"
        "progress": progress,  # 0-100
        "current_step": step,  # Human readable step description
        "result": result,  # Only set when completed
        "error": error,    # Only set when failed
        "created_at": created_at,
        "updated_at": datetime.now()
    }
```

### 3. Progress Reporting
Update progress during each workflow step:

```python
async def execute_workflow(self, workflow_id: str, request: BlogRequest):
    try:
        # Step 1: Keyword Research (0-10%)
        await self.update_status(workflow_id, "processing", 5, "Researching keywords")
        keyword_data = await self.research_keywords(request)
        await self.update_status(workflow_id, "processing", 10, "Keywords researched")
        
        # Step 2: Content Generation (10-25%)
        await self.update_status(workflow_id, "processing", 15, "Generating content outline")
        content_data = await self.generate_content(request, keyword_data)
        await self.update_status(workflow_id, "processing", 25, "Content generated")
        
        # Step 3: SEO Optimization (25-40%)
        await self.update_status(workflow_id, "processing", 30, "Optimizing for SEO")
        seo_data = await self.optimize_seo(content_data, request, keyword_data)
        await self.update_status(workflow_id, "processing", 40, "SEO optimization complete")
        
        # Step 4: Image Prompt Generation (40-60%)
        await self.update_status(workflow_id, "processing", 50, "Creating image prompts")
        image_prompt = await self.generate_image_prompt(request.title, content_data, request.industry)
        await self.update_status(workflow_id, "processing", 60, "Image prompts ready")
        
        # Step 5: Image Generation (60-75%)
        if request.include_images:
            await self.update_status(workflow_id, "processing", 65, "Generating images")
            featured_image_url = await self.generate_image(image_prompt)
            await self.update_status(workflow_id, "processing", 75, "Images generated")
        
        # Step 6: Thumbnail Creation (75-85%)
        await self.update_status(workflow_id, "processing", 80, "Creating thumbnails")
        thumbnail_url = await self.create_thumbnail(request.title, featured_image_url)
        await self.update_status(workflow_id, "processing", 85, "Thumbnails created")
        
        # Step 7: Social Snippets (85-100%)
        await self.update_status(workflow_id, "processing", 90, "Creating social snippets")
        social_snippet = await self.generate_social_snippet(request.title, content_data)
        await self.update_status(workflow_id, "processing", 95, "Social snippets ready")
        
        # Final result
        result = BlogPostResult(
            content=content_data,
            seo_title=seo_data["title"],
            meta_description=seo_data["description"],
            keywords=keyword_data["secondary_keywords"] + keyword_data["lsi_keywords"],
            tags=seo_data["tags"],
            featured_image_url=featured_image_url,
            thumbnail_url=thumbnail_url,
            social_media_snippet=social_snippet,
            estimated_read_time=self.calculate_read_time(content_data)
        )
        
        # Store result and mark complete
        generated_posts[workflow_id] = result.model_dump()
        await self.update_status(workflow_id, "completed", 100, "Workflow completed", result.model_dump())
        
    except Exception as e:
        await self.update_status(workflow_id, "failed", 0, f"Error: {str(e)}", error=str(e))
```

## 🐛 Debugging the Demo Error

### Common Issues:

1. **Workflow ID Generation**
   ```python
   # Make sure you're generating UUIDs properly
   import uuid
   workflow_id = str(uuid.uuid4())
   ```

2. **Status Storage Issues**
   ```python
   # Ensure workflow_status dict is properly initialized
   workflow_status = {}  # Global dict or proper storage
   ```

3. **DateTime Serialization**
   ```python
   # Make sure datetime objects are serializable
   workflow_status[workflow_id] = {
       "created_at": datetime.now().isoformat(),  # Use isoformat()
       "updated_at": datetime.now().isoformat()
   }
   ```

4. **CORS Issues**
   ```python
   # Ensure CORS is properly configured for frontend
   from fastapi.middleware.cors import CORSMiddleware
   
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:3000"],  # Frontend URL
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

## 🔍 Debugging Steps

### 1. Check Workflow Creation
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
  "workflow_id": "some-uuid-here",
  "status": "started",
  "message": "Blog post generation workflow started"
}
```

### 2. Check Status Endpoint
```bash
curl http://localhost:8000/blog/workflow-status/YOUR_WORKFLOW_ID
```

**Should return status object, not 404**

### 3. Check Result Endpoint
```bash
curl http://localhost:8000/blog/result/YOUR_WORKFLOW_ID
```

**Should return complete blog post when status is "completed"**

## 📋 Frontend Expectations Checklist

- [ ] `POST /blog/generate` returns `workflow_id`
- [ ] `GET /blog/workflow-status/{id}` returns proper status object
- [ ] Progress updates from 0 to 100 during workflow
- [ ] Status changes: `pending` → `processing` → `completed`/`failed`
- [ ] Current step descriptions are human-readable
- [ ] `GET /blog/result/{id}` returns complete `BlogPostResult`
- [ ] All datetime fields are ISO format strings
- [ ] CORS allows requests from `http://localhost:3000`
- [ ] Error responses include proper error messages

## 🎯 Quick Fix for Demo Error

If the demo is failing, check these specific points:

1. **Workflow Storage**: Ensure `workflow_status` dict persists between requests
2. **ID Generation**: Verify UUIDs are properly generated and stored
3. **Status Updates**: Make sure `update_status` is called with correct parameters
4. **Background Tasks**: If using background tasks, ensure they don't lose workflow context
5. **Exception Handling**: Catch and properly report any errors during workflow execution

## 📞 Frontend Mock API Reference

For reference, here's how the frontend's mock API works:

```typescript
// Mock workflow status progression
const progress = Math.min(100, (elapsed / 120000) * 100); // 2 minutes total

const steps = [
  'Researching keywords',
  'Generating content outline', 
  'Writing blog content',
  'Optimizing for SEO',
  'Creating image prompts',
  'Generating images',
  'Creating thumbnails',
  'Generating social snippets'
];

const currentStep = steps[Math.floor((progress / 100) * steps.length)];
```

The backend should follow similar timing and step progression for the best user experience.

## 🔗 Integration Testing

Test the integration with this curl sequence:

```bash
# 1. Start workflow
WORKFLOW_ID=$(curl -s -X POST http://localhost:8000/blog/generate \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","industry":"tech","purpose":"educational"}' \
  | jq -r '.workflow_id')

# 2. Check status (repeat until completed)
curl http://localhost:8000/blog/workflow-status/$WORKFLOW_ID

# 3. Get result when completed
curl http://localhost:8000/blog/result/$WORKFLOW_ID
```

This should complete successfully without errors for the frontend to work properly.