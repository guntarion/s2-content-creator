/**
 * API Client for blog generation workflow
 * Handles communication with the FastAPI backend
 */

import { config } from './config';
import {
  BlogRequest,
  WorkflowResponse,
  WorkflowStatus,
  BlogPostResult,
  APIErrorType,
  ProcessedAPIError,
  APIClientConfig
} from './types';

export class BlogAPIError extends Error {
  public readonly type: APIErrorType;
  public readonly retryable: boolean;
  public readonly details?: any;

  constructor(type: APIErrorType, message: string, retryable = false, details?: any) {
    super(message);
    this.name = 'BlogAPIError';
    this.type = type;
    this.retryable = retryable;
    this.details = details;
  }
}

export class BlogAPIClient {
  private baseUrl: string;
  private maxRetries: number;
  private timeout: number;

  constructor(clientConfig?: Partial<APIClientConfig>) {
    this.baseUrl = clientConfig?.baseUrl || config.apiBaseUrl;
    this.maxRetries = clientConfig?.maxRetries || config.maxRetries;
    this.timeout = clientConfig?.timeout || config.requestTimeout;
  }

  /**
   * Make HTTP request with retry logic and proper error handling
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await this.safeParseErrorResponse(response);
          throw this.createAPIError(response.status, errorData);
        }

        return await response.json();
      } catch (error) {
        // Don't retry on the last attempt
        if (attempt === this.maxRetries - 1) {
          throw this.handleRequestError(error);
        }
        
        // Only retry on retryable errors
        const apiError = this.handleRequestError(error);
        if (!apiError.retryable) {
          throw apiError;
        }

        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new BlogAPIError(
      APIErrorType.UNKNOWN_ERROR,
      'Max retries exceeded',
      false
    );
  }

  /**
   * Safely parse error response without throwing
   */
  private async safeParseErrorResponse(response: Response): Promise<any> {
    try {
      return await response.json();
    } catch {
      return { message: response.statusText };
    }
  }

  /**
   * Create appropriate API error based on HTTP status
   */
  private createAPIError(status: number, errorData: any): BlogAPIError {
    switch (status) {
      case 400:
        return new BlogAPIError(
          APIErrorType.VALIDATION_ERROR,
          'Invalid request. Please check your input.',
          false,
          errorData
        );
      case 404:
        return new BlogAPIError(
          APIErrorType.WORKFLOW_NOT_FOUND,
          'Workflow not found. It may have expired.',
          false
        );
      case 422:
        return new BlogAPIError(
          APIErrorType.VALIDATION_ERROR,
          'Validation error. Please check your input.',
          false,
          errorData.detail
        );
      case 500:
        return new BlogAPIError(
          APIErrorType.UNKNOWN_ERROR,
          'Server error. Please try again.',
          true
        );
      case 503:
        return new BlogAPIError(
          APIErrorType.UNKNOWN_ERROR,
          'Service temporarily unavailable. Please try again.',
          true
        );
      default:
        return new BlogAPIError(
          APIErrorType.UNKNOWN_ERROR,
          `HTTP ${status}: ${errorData.message || 'Unknown error'}`,
          status >= 500
        );
    }
  }

  /**
   * Handle request errors (network, timeout, etc.)
   */
  private handleRequestError(error: any): BlogAPIError {
    if (error instanceof BlogAPIError) {
      return error;
    }

    if (error.name === 'AbortError') {
      return new BlogAPIError(
        APIErrorType.TIMEOUT_ERROR,
        'Request timeout. Please try again.',
        true
      );
    }

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return new BlogAPIError(
        APIErrorType.NETWORK_ERROR,
        'Network connection failed. Please check your internet connection.',
        true
      );
    }

    return new BlogAPIError(
      APIErrorType.UNKNOWN_ERROR,
      error.message || 'An unexpected error occurred',
      true
    );
  }

  /**
   * Start blog generation workflow
   */
  async generateBlog(request: BlogRequest): Promise<WorkflowResponse> {
    try {
      return await this.makeRequest<WorkflowResponse>('/blog/generate', {
        method: 'POST',
        body: JSON.stringify(request),
      });
    } catch (error) {
      throw error instanceof BlogAPIError
        ? error
        : new BlogAPIError(
            APIErrorType.UNKNOWN_ERROR,
            'Failed to start blog generation'
          );
    }
  }

  /**
   * Get workflow status
   */
  async getWorkflowStatus(workflowId: string): Promise<WorkflowStatus> {
    try {
      return await this.makeRequest<WorkflowStatus>(
        `/blog/workflow-status/${workflowId}`
      );
    } catch (error) {
      throw error instanceof BlogAPIError
        ? error
        : new BlogAPIError(
            APIErrorType.UNKNOWN_ERROR,
            'Failed to get workflow status'
          );
    }
  }

  /**
   * Get blog generation result
   */
  async getBlogResult(workflowId: string): Promise<BlogPostResult> {
    try {
      return await this.makeRequest<BlogPostResult>(
        `/blog/result/${workflowId}`
      );
    } catch (error) {
      throw error instanceof BlogAPIError
        ? error
        : new BlogAPIError(
            APIErrorType.UNKNOWN_ERROR,
            'Failed to get blog result'
          );
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      return await this.makeRequest<{ status: string; timestamp: string }>('/health');
    } catch (error) {
      throw error instanceof BlogAPIError
        ? error
        : new BlogAPIError(
            APIErrorType.NETWORK_ERROR,
            'Health check failed'
          );
    }
  }

  /**
   * Get application info
   */
  async getAppInfo(): Promise<{
    app_name: string;
    version: string;
    features: Record<string, boolean>;
  }> {
    try {
      return await this.makeRequest('/info');
    } catch (error) {
      throw error instanceof BlogAPIError
        ? error
        : new BlogAPIError(
            APIErrorType.NETWORK_ERROR,
            'Failed to get app info'
          );
    }
  }
}

// Default client instance
export const apiClient = new BlogAPIClient();

// Development mock client for testing
export class MockBlogAPIClient extends BlogAPIClient {
  private simulateDelay(min = 500, max = 2000): Promise<void> {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  async generateBlog(request: BlogRequest): Promise<WorkflowResponse> {
    await this.simulateDelay();
    
    return {
      workflow_id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'started',
      message: 'Mock workflow started successfully'
    };
  }

  async getWorkflowStatus(workflowId: string): Promise<WorkflowStatus> {
    await this.simulateDelay(100, 500);
    
    // Simulate progressive workflow
    const elapsed = Date.now() - parseInt(workflowId.split('-')[1]) || 0;
    const progress = Math.min(100, (elapsed / 120000) * 100); // Complete in 2 minutes
    
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
    
    const stepIndex = Math.floor((progress / 100) * steps.length);
    const currentStep = steps[Math.min(stepIndex, steps.length - 1)] || 'Starting...';
    
    return {
      id: workflowId,
      status: progress >= 100 ? 'completed' : 'processing',
      progress: Math.round(progress),
      current_step: currentStep,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  async getBlogResult(workflowId: string): Promise<BlogPostResult> {
    await this.simulateDelay();
    
    return {
      content: `# Mock Blog Post\n\nThis is a mock blog post generated for development purposes.\n\n## Introduction\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit...\n\n## Main Content\n\nVestibulum ante ipsum primis in faucibus orci luctus...`,
      seo_title: 'Mock Blog Post - SEO Optimized Title',
      meta_description: 'This is a mock meta description for SEO purposes, demonstrating the blog generation workflow.',
      keywords: ['mock', 'blog', 'development', 'testing', 'seo'],
      tags: ['development', 'testing', 'mock'],
      featured_image_url: 'https://via.placeholder.com/800x400/3498db/ffffff?text=Generated+Image',
      thumbnail_url: 'https://via.placeholder.com/400x300/e74c3c/ffffff?text=Thumbnail',
      social_media_snippet: '🚀 Check out this amazing mock blog post! Perfect for testing the workflow interface. #development #testing',
      estimated_read_time: 5
    };
  }
}

// Export the appropriate client based on configuration
export const devApiClient = config.enableMockApi 
  ? new MockBlogAPIClient() 
  : apiClient;