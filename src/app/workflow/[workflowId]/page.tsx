'use client';

/**
 * Workflow Page - Shows the AI Assembly Line in action
 * Features real-time progress tracking and live content building
 */

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Download, Share2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { WorkflowTracker } from '@/components/workflow/WorkflowTracker';


export default function WorkflowPage() {
  const params = useParams();
  const router = useRouter();
  const [showSuccessActions, setShowSuccessActions] = useState(false);
  
  const workflowId = params.workflowId as string;

  const handleComplete = () => {
    setShowSuccessActions(true);
    
    // Auto-navigate to results page after a short delay
    setTimeout(() => {
      router.push(`/result/${workflowId}`);
    }, 3000);
  };

  const handleError = (error: string) => {
    console.error('Workflow error:', error);
    // Error handling is done within WorkflowTracker
  };

  const handleViewResult = (workflowId: string) => {
    router.push(`/result/${workflowId}`);
  };

  const handleBackToGenerate = () => {
    router.push('/generate');
  };

  if (!workflowId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Invalid Workflow</h2>
          <p className="text-muted-foreground mb-4">
            The workflow ID is missing or invalid.
          </p>
          <Button onClick={handleBackToGenerate}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Generate
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToGenerate}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>New Generation</span>
              </Button>
              
              <div className="flex items-center space-x-2">
                <Badge variant="outline">Workflow</Badge>
                <span className="text-sm text-muted-foreground">
                  ID: {workflowId.slice(0, 8)}...
                </span>
              </div>
            </div>

            {/* Success Actions */}
            {showSuccessActions && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-2"
              >
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewResult(workflowId)}
                  className="flex items-center space-x-1"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>View Result</span>
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center space-x-1"
                >
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center space-x-1"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Main Workflow Interface */}
      <WorkflowTracker
        workflowId={workflowId}
        onComplete={handleComplete}
        onError={handleError}
        onViewResult={handleViewResult}
        className="h-[calc(100vh-73px)]"
      />

      {/* Success Overlay */}
      {showSuccessActions && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg p-8 text-center pointer-events-auto shadow-2xl"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
                className="text-green-600 text-2xl"
              >
                ✓
              </motion.div>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Blog Post Generated!
            </h3>
            <p className="text-gray-600 mb-6">
              Your AI-powered blog post is ready. Redirecting to results...
            </p>
            
            <div className="flex space-x-3">
              <Button
                onClick={() => handleViewResult(workflowId)}
                className="flex items-center space-x-2"
              >
                <ExternalLink className="h-4 w-4" />
                <span>View Now</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowSuccessActions(false)}
              >
                Stay Here
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

