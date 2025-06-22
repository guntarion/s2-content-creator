/**
 * Main hook for workflow tracking with SSE and polling fallback
 */

import { useState, useCallback, useEffect } from 'react';
import useSWR from 'swr';
import { 
  BlogRequest, 
  WorkflowStatus, 
  BlogPostResult, 
  UseWorkflowTrackingReturn 
} from '@/lib/types';
import { apiClient, devApiClient, BlogAPIError } from '@/lib/api-client';
import { config } from '@/lib/config';
import { useWorkflowStream } from './useWorkflowStream';

export function useWorkflowTracking(): UseWorkflowTrackingReturn {
  // State
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [result, setResult] = useState<BlogPostResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [useSSE, setUseSSE] = useState(config.enableSSE);

  // Choose API client based on configuration
  const client = config.enableMockApi ? devApiClient : apiClient;

  // SSE connection for real-time updates
  const { 
    data: sseData, 
    error: sseError, 
    connectionState 
  } = useWorkflowStream(useSSE ? workflowId : null);

  // Polling fallback using SWR
  const { 
    data: pollingData, 
    error: pollingError,
    mutate: mutateStatus 
  } = useSWR(
    !useSSE && workflowId ? [`/blog/workflow-status/${workflowId}`, workflowId] : null,
    () => client.getWorkflowStatus(workflowId!),
    {
      refreshInterval: config.pollingInterval,
      revalidateOnFocus: false,
      shouldRetryOnError: (error) => {
        return error instanceof BlogAPIError && error.retryable;
      },
      onError: (error) => {
        console.error('Polling error:', error);
        setError(error.message || 'Failed to get workflow status');
      }
    }
  );

  // Get the current data based on connection type
  const currentData = useSSE ? sseData : pollingData;
  const currentError = useSSE ? sseError : pollingError;

  // Switch to polling if SSE fails
  useEffect(() => {
    if (sseError && connectionState === 'disconnected' && useSSE) {
      console.warn('SSE failed, switching to polling fallback');
      setUseSSE(false);
      setError(null); // Clear SSE error since we're falling back
    }
  }, [sseError, connectionState, useSSE]);

  // Handle workflow completion
  useEffect(() => {
    if (currentData?.status === 'completed' && workflowId && !result) {
      fetchResult();
    }
  }, [currentData?.status, workflowId, result]);

  // Handle workflow failure
  useEffect(() => {
    if (currentData?.status === 'failed') {
      setError(currentData.error || 'Workflow failed');
      setIsLoading(false);
    }
  }, [currentData?.status, currentData?.error]);

  // Set current error
  useEffect(() => {
    if (currentError) {
      setError(currentError);
    }
  }, [currentError]);

  /**
   * Fetch the final blog result
   */
  const fetchResult = useCallback(async () => {
    if (!workflowId) return;

    try {
      const resultData = await client.getBlogResult(workflowId);
      setResult(resultData);
      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof BlogAPIError 
        ? err.message 
        : 'Failed to get blog result';
      setError(errorMessage);
      setIsLoading(false);
    }
  }, [workflowId, client]);

  /**
   * Start blog generation workflow
   */
  const startGeneration = useCallback(async (request: BlogRequest) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await client.generateBlog(request);
      setWorkflowId(response.workflow_id);
      
      // Reset SSE preference for new workflow
      if (config.enableSSE) {
        setUseSSE(true);
      }
    } catch (err) {
      const errorMessage = err instanceof BlogAPIError 
        ? err.message 
        : 'Failed to start blog generation';
      setError(errorMessage);
      setIsLoading(false);
    }
  }, [client]);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setWorkflowId(null);
    setResult(null);
    setError(null);
    setIsLoading(false);
    setUseSSE(config.enableSSE);
    
    // Clear SWR cache
    if (workflowId) {
      mutateStatus(undefined, false);
    }
  }, [workflowId, mutateStatus]);

  /**
   * Retry failed workflow
   */
  const retry = useCallback(async () => {
    if (!workflowId) return;

    setError(null);
    setIsLoading(true);

    try {
      // Force refresh of current status
      if (useSSE) {
        // For SSE, we'll rely on reconnection
        setUseSSE(false);
        setTimeout(() => setUseSSE(true), 1000);
      } else {
        // For polling, force a refresh
        await mutateStatus();
      }
    } catch (err) {
      const errorMessage = err instanceof BlogAPIError 
        ? err.message 
        : 'Retry failed';
      setError(errorMessage);
      setIsLoading(false);
    }
  }, [workflowId, useSSE, mutateStatus]);

  // Determine connection type for UI display
  const connectionType = (() => {
    if (useSSE) {
      return connectionState === 'connected' ? 'sse' : 'disconnected';
    }
    return pollingData ? 'polling' : 'disconnected';
  })();

  return {
    // State
    workflowId,
    status: currentData || null,
    result,
    error,
    isLoading,
    connectionType,
    
    // Actions
    startGeneration,
    reset,
    retry,
  };
}

/**
 * Hook for tracking multiple workflows (future enhancement)
 */
export function useMultipleWorkflowTracking() {
  const [workflows, setWorkflows] = useState<Map<string, UseWorkflowTrackingReturn>>(new Map());

  const createWorkflow = useCallback((id?: string) => {
    const workflowId = id || `workflow-${Date.now()}`;
    const workflow = useWorkflowTracking();
    
    setWorkflows(prev => new Map(prev).set(workflowId, workflow));
    return workflow;
  }, []);

  const removeWorkflow = useCallback((id: string) => {
    setWorkflows(prev => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  return {
    workflows: Array.from(workflows.entries()),
    createWorkflow,
    removeWorkflow,
  };
}