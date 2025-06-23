/**
 * Hook for Server-Sent Events (SSE) real-time workflow updates
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { WorkflowStatus, UseWorkflowStreamReturn } from '@/lib/types';
import { config } from '@/lib/config';

export function useWorkflowStream(workflowId: string | null): UseWorkflowStreamReturn {
  const [data, setData] = useState<WorkflowStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setConnectionState('disconnected');
    reconnectAttempts.current = 0;
  }, []);

  const connectToSSE = useCallback(() => {
    if (!workflowId) return;

    try {
      setConnectionState('connecting');
      setError(null);

      // Construct SSE URL
      const sseUrl = `${config.apiBaseUrl}/blog/workflow-stream/${workflowId}`;
      
      // Create EventSource
      const eventSource = new EventSource(sseUrl);
      eventSourceRef.current = eventSource;

      // Handle connection opened
      eventSource.onopen = () => {
        console.log('SSE connection opened for workflow:', workflowId);
        setConnectionState('connected');
        setError(null);
        reconnectAttempts.current = 0;
      };

      // Handle messages
      eventSource.onmessage = (event) => {
        try {
          const statusData = JSON.parse(event.data);
          setData(statusData);
          
          // If workflow is completed or failed, close the connection
          if (statusData.status === 'completed' || statusData.status === 'failed') {
            eventSource.close();
            setConnectionState('disconnected');
          }
        } catch (err) {
          console.error('Error parsing SSE data:', err);
          setError('Failed to parse status update');
        }
      };

      // Handle errors with exponential backoff
      eventSource.onerror = (event) => {
        console.error('SSE connection error:', event);
        cleanup();
        
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000;
          setError(`Connection lost. Reconnecting in ${delay / 1000}s...`);
          
          reconnectAttempts.current++;
          reconnectTimeoutRef.current = setTimeout(connectToSSE, delay);
        } else {
          setError('Failed to connect to workflow stream after multiple attempts');
        }
      };

      // Handle specific event types
      eventSource.addEventListener('status_update', (event) => {
        try {
          const statusData = JSON.parse(event.data);
          setData(statusData);
        } catch (parseError) {
          console.error('Failed to parse status_update event:', parseError);
        }
      });

      eventSource.addEventListener('workflow_completed', (event) => {
        try {
          const statusData = JSON.parse(event.data);
          setData(statusData);
          eventSource.close();
          setConnectionState('disconnected');
        } catch (parseError) {
          console.error('Failed to parse workflow_completed event:', parseError);
        }
      });

      eventSource.addEventListener('workflow_failed', (event) => {
        try {
          const statusData = JSON.parse(event.data);
          setData(statusData);
          setError(statusData.error || 'Workflow failed');
          eventSource.close();
          setConnectionState('disconnected');
        } catch (parseError) {
          console.error('Failed to parse workflow_failed event:', parseError);
        }
      });

    } catch (err) {
      console.error('Failed to initialize SSE connection:', err);
      setError('Failed to establish real-time connection');
      setConnectionState('disconnected');
    }
  }, [workflowId, cleanup]);

  // Setup effect
  useEffect(() => {
    if (!workflowId || !config.enableSSE) {
      cleanup();
      return;
    }

    connectToSSE();
    return cleanup;
  }, [workflowId, connectToSSE, cleanup]);

  const forceReconnect = useCallback(() => {
    cleanup();
    if (workflowId) {
      reconnectAttempts.current = 0;
      connectToSSE();
    }
  }, [workflowId, cleanup, connectToSSE]);

  return {
    data,
    error,
    connectionState,
    forceReconnect
  };
}

/**
 * Hook for testing SSE connection without a specific workflow
 */
export function useSSEHealthCheck() {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if SSE is supported by the browser
    setIsSupported(typeof EventSource !== 'undefined');

    // Test SSE connection to a health endpoint
    if (typeof EventSource !== 'undefined' && config.enableSSE) {
      testSSEConnection();
    }
  }, []);

  const testSSEConnection = () => {
    try {
      const testUrl = `${config.apiBaseUrl}/health-stream`;
      const eventSource = new EventSource(testUrl);

      const timeout = setTimeout(() => {
        eventSource.close();
        setIsAvailable(false);
      }, 5000);

      eventSource.onopen = () => {
        clearTimeout(timeout);
        eventSource.close();
        setIsAvailable(true);
      };

      eventSource.onerror = () => {
        clearTimeout(timeout);
        eventSource.close();
        setIsAvailable(false);
      };
    } catch {
      setIsAvailable(false);
    }
  };

  return {
    isSupported,
    isAvailable,
    retestConnection: testSSEConnection
  };
}

/**
 * Hook for managing multiple SSE connections (future enhancement)
 */
export function useMultipleWorkflowStreams(workflowIds: string[]) {
  const [connections, setConnections] = useState<Map<string, UseWorkflowStreamReturn>>(new Map());

  useEffect(() => {
    // Create connections for new workflow IDs
    const newConnections = new Map(connections);
    
    workflowIds.forEach(id => {
      if (!newConnections.has(id)) {
        // This would need to be implemented differently since hooks can't be called conditionally
        // For now, this is a placeholder for future implementation
      }
    });

    // Remove connections for workflow IDs that are no longer needed
    connections.forEach((_, id) => {
      if (!workflowIds.includes(id)) {
        newConnections.delete(id);
      }
    });

    setConnections(newConnections);
  }, [workflowIds, connections]);

  return {
    connections: Array.from(connections.entries()),
    getConnection: (id: string) => connections.get(id),
  };
}