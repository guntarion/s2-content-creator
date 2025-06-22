/**
 * Application configuration and environment variables
 */

export const config = {
  // API Configuration
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  
  // Real-time Updates
  enableSSE: process.env.NEXT_PUBLIC_ENABLE_SSE === 'true', // Default to false
  pollingInterval: parseInt(process.env.NEXT_PUBLIC_POLLING_INTERVAL || '2000'),
  
  // Network Settings
  maxRetries: parseInt(process.env.NEXT_PUBLIC_MAX_RETRIES || '3'),
  requestTimeout: parseInt(process.env.NEXT_PUBLIC_REQUEST_TIMEOUT || '30000'),
  
  // UI Settings
  enableAnimations: process.env.NEXT_PUBLIC_ENABLE_ANIMATIONS !== 'false',
  animationDuration: parseInt(process.env.NEXT_PUBLIC_ANIMATION_DURATION || '300'),
  staggerDelay: parseInt(process.env.NEXT_PUBLIC_STAGGER_DELAY || '100'),
  
  // Development
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  enableMockApi: process.env.NEXT_PUBLIC_ENABLE_MOCK_API === 'true',
  
  // Feature Flags
  features: {
    sse: process.env.NEXT_PUBLIC_FEATURE_SSE !== 'false',
    animations: process.env.NEXT_PUBLIC_FEATURE_ANIMATIONS !== 'false',
    socialPreviews: process.env.NEXT_PUBLIC_FEATURE_SOCIAL_PREVIEWS !== 'false',
    editing: process.env.NEXT_PUBLIC_FEATURE_EDITING === 'true',
  },
  
  // Workflow Settings
  workflow: {
    maxWorkflowTime: parseInt(process.env.NEXT_PUBLIC_MAX_WORKFLOW_TIME || '600000'), // 10 minutes
    progressUpdateInterval: parseInt(process.env.NEXT_PUBLIC_PROGRESS_UPDATE_INTERVAL || '1000'),
    retryDelay: parseInt(process.env.NEXT_PUBLIC_RETRY_DELAY || '5000'),
  },
  
  // Social Media Settings
  social: {
    platforms: ['twitter', 'linkedin', 'instagram', 'facebook'] as const,
    previewEnabled: true,
  },
  
  // Error Handling
  error: {
    showErrorDetails: process.env.NODE_ENV === 'development',
    retryAttempts: 3,
    retryBackoffMultiplier: 2,
  }
} as const;

export type Config = typeof config;

// Validation function to ensure required environment variables are set
export function validateConfig(): void {
  const requiredEnvVars = [
    'NEXT_PUBLIC_API_BASE_URL'
  ];

  const missingVars = requiredEnvVars.filter(
    varName => !process.env[varName] && config.isDevelopment
  );

  if (missingVars.length > 0 && config.isDevelopment) {
    console.warn(
      `Warning: Missing environment variables: ${missingVars.join(', ')}\n` +
      'Using default development values.'
    );
  }
}

// Call validation on import in development
if (config.isDevelopment) {
  validateConfig();
}