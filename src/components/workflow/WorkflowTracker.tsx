'use client';

/**
 * Main workflow orchestrator component
 * Manages the AI Assembly Line interface with real-time updates
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Wifi, WifiOff, RotateCcw, ExternalLink } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { useWorkflowTracking } from '@/hooks/useWorkflowTracking';
import { BlogPostResult } from '@/lib/types';
import { ControlTower } from './ControlTower';
import { LiveCanvas } from './LiveCanvas';

interface WorkflowTrackerProps {
  workflowId: string;
  onComplete?: (result: BlogPostResult) => void;
  onError?: (error: string) => void;
  onViewResult?: (workflowId: string) => void;
  className?: string;
}

export function WorkflowTracker({ 
  workflowId, 
  onComplete, 
  onError, 
  onViewResult,
  className 
}: WorkflowTrackerProps) {
  const [stepOutputs, setStepOutputs] = useState<Record<string, unknown>>({});
  const [showRetryPrompt, setShowRetryPrompt] = useState(false);

  const {
    status,
    result,
    error,
    isLoading,
    connectionType,
    retry,
  } = useWorkflowTracking(workflowId);

  // Handle completion
  useEffect(() => {
    if (result) {
      onComplete?.(result);
    }
  }, [result, onComplete]);

  // Handle errors
  useEffect(() => {
    if (error) {
      onError?.(error);
      setShowRetryPrompt(true);
    } else {
      setShowRetryPrompt(false);
    }
  }, [error, onError]);

  // Extract step outputs from enhanced backend status
  useEffect(() => {
    if (status?.intermediate_output) {
      // Use real outputs from backend instead of mock data
      const outputs: Record<string, unknown> = {};
      
      // Extract outputs from backend intermediate_output
      Object.keys(status.intermediate_output).forEach(key => {
        if (key !== 'type' && key !== 'overall_progress') {
          outputs[key] = status.intermediate_output![key];
        }
      });
      
      setStepOutputs(outputs);
    }
  }, [status]);

  const handleRetry = async () => {
    setShowRetryPrompt(false);
    await retry();
  };

  const handleViewResult = () => {
    if (onViewResult) {
      onViewResult(workflowId);
    }
  };

  if (!status && !error && !isLoading) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">Loading workflow...</p>
      </Card>
    );
  }

  return (
    <div className={`h-screen flex flex-col ${className}`}>
      {/* Header with connection status and controls */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">AI Content Assembly Line</h1>
            <Badge variant="outline" className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Workflow ID: {workflowId.slice(0, 8)}...</span>
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <ConnectionStatus type={connectionType} />
            
            {showRetryPrompt && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="flex items-center space-x-1"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Retry</span>
              </Button>
            )}
            
            {status?.status === 'completed' && result && (
              <Button
                onClick={handleViewResult}
                className="flex items-center space-x-1"
              >
                <ExternalLink className="h-4 w-4" />
                <span>View Result</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-red-200 bg-red-50"
          >
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="text-red-800">{error}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="border-red-200 text-red-700 hover:bg-red-100"
              >
                Try Again
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Assembly Line Interface */}
      <div className="flex-1 flex overflow-hidden">
        {/* Control Tower (Left Panel) */}
        <div className="w-1/3 border-r bg-background">
          <ControlTower
            status={status}
            stepOutputs={stepOutputs}
            isLoading={isLoading}
          />
        </div>

        {/* Live Canvas (Right Panel) */}
        <div className="flex-1 bg-gray-50/50">
          <LiveCanvas
            status={status}
            stepOutputs={stepOutputs}
            result={result}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Progress Footer */}
      {status && status.status === 'processing' && (
        <div className="border-t bg-background p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-muted-foreground">
                {status.current_step}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground">Progress:</span>
              <Badge variant="secondary">
                {status.progress}%
              </Badge>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-blue-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${status.progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Connection Status Indicator Component
 */
function ConnectionStatus({ type }: { type: 'sse' | 'polling' | 'disconnected' }) {
  const configs = {
    sse: {
      icon: Wifi,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      label: 'Real-time',
      description: 'Connected via SSE'
    },
    polling: {
      icon: WifiOff,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      label: 'Polling',
      description: 'Fallback mode'
    },
    disconnected: {
      icon: WifiOff,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      label: 'Offline',
      description: 'Connection lost'
    }
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${config.bgColor}`}>
      <Icon className={`h-3 w-3 ${config.color}`} />
      <span className={`text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    </div>
  );
}

export { ConnectionStatus };