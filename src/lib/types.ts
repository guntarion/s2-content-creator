/**
 * TypeScript type definitions for the blog generation workflow
 * Based on the FastAPI backend models
 */

// Base API Response Types
export interface APIResponse<T = any> {
  status: string;
  data?: T;
  message?: string;
}

export interface APIError {
  error: string;
  message: string;
  details?: any;
}

// Blog Generation Request
export interface BlogRequest {
  title: string;                    // Required: Blog post title
  industry: string;                 // Required: Target industry/niche
  purpose: 'educational' | 'promotional' | 'informational';  // Required
  target_audience?: string;         // Optional: Default "general"
  word_count?: number;             // Optional: Default 800
  include_images?: boolean;        // Optional: Default true
  seo_focus?: boolean;             // Optional: Default true
  target_keyword?: string;         // Optional: Specific keyword to target
  keyword_research_enabled?: boolean; // Optional: Default true
}

// Workflow Response
export interface WorkflowResponse {
  workflow_id: string;
  status: string;
  message?: string;
}

// Workflow Status
export interface WorkflowStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;              // 0-100
  current_step: string;
  result?: any;
  error?: string;
  created_at: string;           // ISO timestamp
  updated_at: string;           // ISO timestamp
}

// Blog Post Result
export interface BlogPostResult {
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

// Workflow Step Configuration
export interface WorkflowStepConfig {
  name: string;
  title: string;
  icon: string;                     // Lucide icon name
  description: string;
  progressRange: [number, number]; // [start, end] percentage
  outputType: 'keywords' | 'content' | 'seo' | 'image' | 'social' | 'metadata';
}

// Step Status
export type StepStatus = 'pending' | 'processing' | 'completed' | 'failed';

// Step Output Types
export interface KeywordOutput {
  primary_keyword: string;
  secondary_keywords: string[];
  lsi_keywords: string[];
  search_intent: string;
  content_focus: string;
  content_structure: {
    seo_title: string;
    h2_suggestions: string[];
    meta_description: string;
  };
}

export interface ContentOutput {
  content: string;
  word_count: number;
  headings: string[];
}

export interface SEOOutput {
  title: string;
  description: string;
  tags: string[];
  keywords: string[];
}

export interface ImageOutput {
  url: string;
  prompt: string;
  alt_text: string;
}

export interface SocialOutput {
  snippet: string;
  hashtags: string[];
  platform_optimized: {
    twitter: string;
    linkedin: string;
    instagram: string;
  };
}

// Step Outputs Union Type
export type StepOutput = KeywordOutput | ContentOutput | SEOOutput | ImageOutput | SocialOutput;

// UI State Types
export interface WorkflowUIState {
  currentStep: string;
  stepOutputs: Record<string, StepOutput>;
  isLoading: boolean;
  error: string | null;
  connectionType: 'sse' | 'polling' | 'disconnected';
}

// Error Types
export enum APIErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  WORKFLOW_NOT_FOUND = 'WORKFLOW_NOT_FOUND',
  WORKFLOW_FAILED = 'WORKFLOW_FAILED',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  SSE_CONNECTION_ERROR = 'SSE_CONNECTION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface ProcessedAPIError {
  type: APIErrorType;
  message: string;
  details?: any;
  retryable: boolean;
}

// Hook Return Types
export interface UseWorkflowTrackingReturn {
  // State
  workflowId: string | null;
  status: WorkflowStatus | null;
  result: BlogPostResult | null;
  error: string | null;
  isLoading: boolean;
  connectionType: 'sse' | 'polling' | 'disconnected';
  
  // Actions
  startGeneration: (request: BlogRequest) => Promise<WorkflowResponse>;
  reset: () => void;
  retry: () => Promise<void>;
}

export interface UseWorkflowStreamReturn {
  data: WorkflowStatus | null;
  error: string | null;
  connectionState: 'connecting' | 'connected' | 'disconnected';
  forceReconnect?: () => void;
}

// Configuration Types
export interface APIClientConfig {
  baseUrl: string;
  maxRetries: number;
  timeout: number;
  enableSSE: boolean;
  pollingInterval: number;
}

// Form Types
export interface GenerationFormData extends BlogRequest {
  // Additional form-specific fields can be added here
}

// Social Media Platform Types
export type SocialPlatform = 'twitter' | 'linkedin' | 'instagram' | 'facebook';

export interface SocialCardData {
  platform: SocialPlatform;
  snippet: string;
  thumbnail?: string;
  title?: string;
  description?: string;
}

// Animation Types
export interface AnimationConfig {
  enabled: boolean;
  duration: number;
  staggerDelay: number;
  reducedMotion: boolean;
}

// Progress Types
export interface ProgressInfo {
  current: number;
  total: number;
  percentage: number;
  estimatedTimeRemaining?: number;
  currentStepName: string;
  currentStepDescription: string;
}

// Utility Types
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type NonEmptyArray<T> = [T, ...T[]];

export type WorkflowStepName = 
  | 'keyword_research'
  | 'content_generation'
  | 'seo_optimization'
  | 'image_prompt_generation'
  | 'image_generation'
  | 'thumbnail_creation'
  | 'social_snippet_generation';

// Constants as types
export const WORKFLOW_STEPS_CONFIG = {
  keyword_research: {
    name: 'keyword_research',
    title: 'Keyword Research',
    icon: 'Search',
    description: 'Analyzing search trends and competition',
    progressRange: [0, 10] as [number, number],
    outputType: 'keywords' as const
  },
  content_generation: {
    name: 'content_generation',
    title: 'Content Generation',
    icon: 'PenSquare',
    description: 'Creating engaging, SEO-optimized content',
    progressRange: [10, 25] as [number, number],
    outputType: 'content' as const
  },
  seo_optimization: {
    name: 'seo_optimization',
    title: 'SEO Optimization',
    icon: 'Sparkles',
    description: 'Optimizing for search engines',
    progressRange: [25, 40] as [number, number],
    outputType: 'seo' as const
  },
  image_prompt_generation: {
    name: 'image_prompt_generation',
    title: 'Image Planning',
    icon: 'Lightbulb',
    description: 'Designing visual concepts',
    progressRange: [40, 60] as [number, number],
    outputType: 'metadata' as const
  },
  image_generation: {
    name: 'image_generation',
    title: 'Image Creation',
    icon: 'Image',
    description: 'Generating custom visuals',
    progressRange: [60, 75] as [number, number],
    outputType: 'image' as const
  },
  thumbnail_creation: {
    name: 'thumbnail_creation',
    title: 'Thumbnail Design',
    icon: 'Frame',
    description: 'Creating social media thumbnails',
    progressRange: [75, 85] as [number, number],
    outputType: 'image' as const
  },
  social_snippet_generation: {
    name: 'social_snippet_generation',
    title: 'Social Snippets',
    icon: 'Share2',
    description: 'Crafting social media content',
    progressRange: [85, 100] as [number, number],
    outputType: 'social' as const
  }
} as const;

export type WorkflowStepsConfig = typeof WORKFLOW_STEPS_CONFIG;
export type WorkflowStepKey = keyof WorkflowStepsConfig;