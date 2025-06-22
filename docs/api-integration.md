# API Integration Guide

## Overview
This document outlines the integration between the Next.js frontend and the FastAPI backend for the blog post generation workflow.

## Backend API Endpoints

### Base Configuration
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
```

### 1. Start Blog Generation
**Endpoint:** `POST /blog/generate`

**Request:**
```typescript
interface BlogRequest {
  title: string;                    // Required: Blog post title
  industry: string;                 // Required: Target industry/niche
  purpose: string;                  // Required: "educational", "promotional", "informational"
  target_audience?: string;         // Optional: Default "general"
  word_count?: number;             // Optional: Default 800
  include_images?: boolean;        // Optional: Default true
  seo_focus?: boolean;             // Optional: Default true
  target_keyword?: string;         // Optional: Specific keyword to target
  keyword_research_enabled?: boolean; // Optional: Default true
}
```

**Response:**
```typescript
interface WorkflowResponse {
  workflow_id: string;
  status: string;
  message?: string;
}
```

**Example:**
```typescript
const response = await fetch(`${API_BASE_URL}/blog/generate`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'The Future of AI in Healthcare',
    industry: 'healthcare',
    purpose: 'educational',
    target_audience: 'healthcare professionals',
    word_count: 1200,
    include_images: true,
    seo_focus: true
  })
});
```

### 2. Get Workflow Status (Polling)
**Endpoint:** `GET /blog/workflow-status/{workflow_id}`

**Response:**
```typescript
interface WorkflowStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;              // 0-100
  current_step: string;
  result?: any;
  error?: string;
  created_at: string;           // ISO timestamp
  updated_at: string;           // ISO timestamp
}
```

### 3. Get Blog Result
**Endpoint:** `GET /blog/result/{workflow_id}`

**Response:**
```typescript
interface BlogPostResult {
  content: string;                    // Full blog post in Markdown
  seo_title: string;                 // Optimized title (max 60 chars)
  meta_description: string;          // SEO meta description (150-160 chars)
  keywords: string[];               // Target keywords for SEO
  tags: string[];                   // Content tags
  featured_image_url?: string;      // Generated featured image URL
  thumbnail_url?: string;           // Social media thumbnail URL
  social_media_snippet: string;    // Instagram/social ready snippet
  estimated_read_time: number;     // Minutes to read
}
```

## Frontend API Client Implementation

### 1. Base API Client
```typescript
// lib/api-client.ts
export class BlogAPIClient {
  private baseUrl: string;
  private maxRetries: number;

  constructor(baseUrl: string = API_BASE_URL, maxRetries: number = 3) {
    this.baseUrl = baseUrl;
    this.maxRetries = maxRetries;
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        if (attempt === this.maxRetries - 1) throw error;
        
        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
    
    throw new Error('Max retries exceeded');
  }

  async generateBlog(request: BlogRequest): Promise<WorkflowResponse> {
    return this.makeRequest('/blog/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getWorkflowStatus(workflowId: string): Promise<WorkflowStatus> {
    return this.makeRequest(`/blog/workflow-status/${workflowId}`);
  }

  async getBlogResult(workflowId: string): Promise<BlogPostResult> {
    return this.makeRequest(`/blog/result/${workflowId}`);
  }
}
```

### 2. React Hook for Workflow Tracking
```typescript
// hooks/useWorkflowTracking.ts
import { useState, useEffect, useCallback } from 'react';
import { BlogAPIClient } from '@/lib/api-client';

export function useWorkflowTracking() {
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [status, setStatus] = useState<WorkflowStatus | null>(null);
  const [result, setResult] = useState<BlogPostResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const apiClient = new BlogAPIClient();

  const startGeneration = useCallback(async (request: BlogRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.generateBlog(request);
      setWorkflowId(response.workflow_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsLoading(false);
    }
  }, []);

  // Polling for status updates
  useEffect(() => {
    if (!workflowId) return;

    const pollStatus = async () => {
      try {
        const statusData = await apiClient.getWorkflowStatus(workflowId);
        setStatus(statusData);

        if (statusData.status === 'completed') {
          const resultData = await apiClient.getBlogResult(workflowId);
          setResult(resultData);
          setIsLoading(false);
        } else if (statusData.status === 'failed') {
          setError(statusData.error || 'Workflow failed');
          setIsLoading(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsLoading(false);
      }
    };

    const interval = setInterval(pollStatus, 2000);
    pollStatus(); // Initial call

    return () => clearInterval(interval);
  }, [workflowId]);

  const reset = useCallback(() => {
    setWorkflowId(null);
    setStatus(null);
    setResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    startGeneration,
    status,
    result,
    error,
    isLoading,
    reset,
    workflowId
  };
}
```

## Server-Sent Events (SSE) Implementation

### 1. Backend SSE Endpoint (Reference)
The backend should provide an SSE endpoint for real-time updates:

```python
# FastAPI backend reference
@app.get("/blog/workflow-stream/{workflow_id}")
async def workflow_status_stream(workflow_id: str):
    async def event_stream():
        previous_status = None
        while True:
            current_status = get_workflow_status(workflow_id)
            if current_status != previous_status:
                yield {
                    "event": "status_update",
                    "data": json.dumps(current_status)
                }
                previous_status = current_status
            
            if current_status.get('status') == 'completed':
                break
                
            await asyncio.sleep(1)
    
    return EventSourceResponse(event_stream())
```

### 2. Frontend SSE Hook
```typescript
// hooks/useWorkflowStream.ts
import { useState, useEffect } from 'react';

export function useWorkflowStream(workflowId: string | null) {
  const [data, setData] = useState<WorkflowStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  useEffect(() => {
    if (!workflowId) return;

    setConnectionState('connecting');
    const eventSource = new EventSource(
      `${API_BASE_URL}/blog/workflow-stream/${workflowId}`
    );

    eventSource.onopen = () => {
      setConnectionState('connected');
      setError(null);
    };

    eventSource.onmessage = (event) => {
      try {
        const status = JSON.parse(event.data);
        setData(status);
      } catch (err) {
        console.error('Failed to parse SSE data:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE connection error:', err);
      setConnectionState('disconnected');
      setError('Connection lost. Falling back to polling...');
      eventSource.close();
    };

    return () => {
      eventSource.close();
      setConnectionState('disconnected');
    };
  }, [workflowId]);

  return { data, error, connectionState };
}
```

### 3. Hybrid Hook (SSE with Polling Fallback)
```typescript
// hooks/useWorkflowTracking.ts (Enhanced)
export function useWorkflowTracking() {
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [useSSE, setUseSSE] = useState(true);
  
  // SSE connection
  const { 
    data: sseData, 
    error: sseError, 
    connectionState 
  } = useWorkflowStream(useSSE ? workflowId : null);
  
  // Polling fallback
  const { 
    data: pollingData, 
    error: pollingError 
  } = useSWR(
    !useSSE && workflowId ? `/blog/workflow-status/${workflowId}` : null,
    () => apiClient.getWorkflowStatus(workflowId!),
    { refreshInterval: 2000 }
  );

  // Switch to polling if SSE fails
  useEffect(() => {
    if (sseError && connectionState === 'disconnected') {
      setUseSSE(false);
    }
  }, [sseError, connectionState]);

  const currentData = useSSE ? sseData : pollingData;
  const currentError = useSSE ? sseError : pollingError;

  // ... rest of the hook logic
}
```

## Error Handling Strategy

### 1. Error Types
```typescript
export enum APIErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  WORKFLOW_NOT_FOUND = 'WORKFLOW_NOT_FOUND',
  WORKFLOW_FAILED = 'WORKFLOW_FAILED',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface APIError {
  type: APIErrorType;
  message: string;
  details?: any;
  retryable: boolean;
}
```

### 2. Error Handler
```typescript
export function handleAPIError(error: any): APIError {
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return {
      type: APIErrorType.NETWORK_ERROR,
      message: 'Network connection failed. Please check your internet connection.',
      retryable: true
    };
  }

  if (error.status === 422) {
    return {
      type: APIErrorType.VALIDATION_ERROR,
      message: 'Please check your input and try again.',
      details: error.body,
      retryable: false
    };
  }

  if (error.status === 404) {
    return {
      type: APIErrorType.WORKFLOW_NOT_FOUND,
      message: 'Workflow not found. It may have expired.',
      retryable: false
    };
  }

  return {
    type: APIErrorType.UNKNOWN_ERROR,
    message: 'An unexpected error occurred. Please try again.',
    retryable: true
  };
}
```

## Environment Configuration

### 1. Environment Variables
```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_ENABLE_SSE=true
NEXT_PUBLIC_POLLING_INTERVAL=2000
NEXT_PUBLIC_MAX_RETRIES=3
```

### 2. Configuration Helper
```typescript
// lib/config.ts
export const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  enableSSE: process.env.NEXT_PUBLIC_ENABLE_SSE === 'true',
  pollingInterval: parseInt(process.env.NEXT_PUBLIC_POLLING_INTERVAL || '2000'),
  maxRetries: parseInt(process.env.NEXT_PUBLIC_MAX_RETRIES || '3'),
} as const;
```

## Testing Strategy

### 1. Mock API Responses
```typescript
// lib/mock-api.ts
export const mockWorkflowStatus: WorkflowStatus = {
  id: 'test-workflow-id',
  status: 'processing',
  progress: 45,
  current_step: 'Generating content',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const mockBlogResult: BlogPostResult = {
  content: '# Test Blog Post\n\nThis is a test blog post...',
  seo_title: 'Test Blog Post - SEO Optimized',
  meta_description: 'This is a test meta description for SEO purposes.',
  keywords: ['test', 'blog', 'seo'],
  tags: ['testing', 'demo'],
  social_media_snippet: '🚀 Check out this amazing blog post! #testing',
  estimated_read_time: 5
};
```

### 2. Development Mode API
```typescript
// lib/dev-api.ts
export class DevBlogAPIClient extends BlogAPIClient {
  async generateBlog(request: BlogRequest): Promise<WorkflowResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      workflow_id: `dev-${Date.now()}`,
      status: 'started',
      message: 'Development workflow started'
    };
  }

  async getWorkflowStatus(workflowId: string): Promise<WorkflowStatus> {
    // Simulate progressive workflow
    const progress = Math.min(100, (Date.now() % 120000) / 1200);
    
    return {
      id: workflowId,
      status: progress < 100 ? 'processing' : 'completed',
      progress: Math.round(progress),
      current_step: this.getStepFromProgress(progress),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
}
```

This API integration guide provides a robust foundation for connecting the frontend to the FastAPI backend with proper error handling, fallback mechanisms, and development tools.