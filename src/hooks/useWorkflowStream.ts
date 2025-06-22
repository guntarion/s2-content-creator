/**
 * Hook for Server-Sent Events (SSE) real-time workflow updates
 */

import { useState, useEffect, useRef } from 'react';
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

  useEffect(() => {
    if (!workflowId || !config.enableSSE) {
      cleanup();
      return;
    }

    connectToSSE();

    return cleanup;
  }, [workflowId]);

  const connectToSSE = () => {
    if (!workflowId) return;

    try {
      setConnectionState('connecting');
      setError(null);

      // Construct SSE URL
      const sseUrl = `${config.apiBaseUrl}/blog/workflow-stream/${workflowId}`;
      
      // Create EventSource
      const eventSource = new EventSource(sseUrl);
      eventSourceRef.current = eventSource;

      // Connection opened
      eventSource.onopen = () => {
        console.log('SSE connection opened for workflow:', workflowId);
        setConnectionState('connected');
        setError(null);
        reconnectAttempts.current = 0;
      };

      // Message received
      eventSource.onmessage = (event) => {
        try {
          const statusData = JSON.parse(event.data);
          setData(statusData);
          
          // If workflow is completed or failed, close the connection
          if (statusData.status === 'completed' || statusData.status === 'failed') {
            eventSource.close();
            setConnectionState('disconnected');
          }
        } catch (parseError) {
          console.error('Failed to parse SSE data:', parseError);
          setError('Failed to parse status update');
        }
      };

      // Error handling
      eventSource.onerror = (event) => {
        console.error('SSE connection error:', event);
        setConnectionState('disconnected');
        
        // Check if we should attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000; // Exponential backoff
          
          setError(`Connection lost. Reconnecting in ${delay / 1000}s...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connectToSSE();
          }, delay);
        } else {
          setError('Connection failed. Falling back to polling...');
          cleanup();
        }
      };

      // Handle specific SSE event types (if backend sends them)
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

    } catch (initError) {
      console.error('Failed to initialize SSE connection:', initError);
      setError('Failed to establish real-time connection');
      setConnectionState('disconnected');
    }
  };

  const cleanup = () => {
    // Close EventSource
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // Clear reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Reset state
    setConnectionState('disconnected');
    reconnectAttempts.current = 0;
  };

  const forceReconnect = () => {
    cleanup();
    if (workflowId) {
      reconnectAttempts.current = 0;
      connectToSSE();
    }
  };

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
  }, [workflowIds]);

  return {
    connections: Array.from(connections.entries()),
    getConnection: (id: string) => connections.get(id),
  };
}