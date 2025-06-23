'use client';

/**
 * Control Tower component - Left panel showing workflow step progress
 * Features interactive step tracking, expandable outputs, and helpful tips
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  Search,
  PenSquare,
  Sparkles,
  Lightbulb,
  Image as ImageIcon,
  Frame,
  Share2,
  Circle,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { KeywordOutput } from '@/lib/types';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { WorkflowStatus, StepStatus, WORKFLOW_STEPS_CONFIG } from '@/lib/types';

// Icon aliases to avoid name conflicts
const TipIcon = Lightbulb;

// Helper types for icon components
interface StepIconProps {
  className?: string;
  status: StepStatus;
  icon: string;
}

const StepIcon: React.FC<StepIconProps> = ({ className, status, icon }) => {
  const IconComponent = STEP_ICONS[icon];
  return (
    <div className={cn(
      "p-2 rounded-lg relative z-10 border-2",
      status === 'completed' ? 'bg-green-100 border-green-300' :
      status === 'processing' ? 'bg-blue-100 border-blue-300' :
      status === 'failed' ? 'bg-red-100 border-red-300' : 'bg-gray-100 border-gray-300'
    )}>
      <IconComponent className={cn(
        "h-4 w-4",
        status === 'completed' ? 'text-green-600' :
        status === 'processing' ? 'text-blue-600' :
        status === 'failed' ? 'text-red-600' : 'text-gray-600',
        className
      )} />
    </div>
  );
};

interface ControlTowerProps {
  status: WorkflowStatus | null;
  stepOutputs: Record<string, unknown>;
  className?: string;
  isLoading?: boolean;
}

interface WorkflowStepProps {
  stepKey: string;
  config: typeof WORKFLOW_STEPS_CONFIG[keyof typeof WORKFLOW_STEPS_CONFIG];
  status: StepStatus;
  output?: unknown;
  isActive?: boolean;
  onClick?: () => void;
  workflowStatus?: WorkflowStatus | null;
}

const STEP_ICONS: Record<string, LucideIcon> = {
  Search,
  PenSquare,
  Sparkles,
  Lightbulb,
  Image: ImageIcon,
  Frame,
  Share2
};

const TIPS = [
  "💡 Pro Tip: Read your blog post aloud to check flow and tone.",
  "📊 Did you know? Posts with images get 94% more views.",
  "🎯 Headlines with numbers get 36% more clicks.",
  "⏰ The ideal blog post length for SEO is 2,100-2,400 words.",
  "📱 75% of readers scan content, so use clear headings.",
  "🔗 Internal links can increase page views by 40%.",
  "📈 Blog posts with 7+ images get the most social shares."
];

export function ControlTower({ status, stepOutputs, className }: ControlTowerProps) {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [currentTip, setCurrentTip] = useState(0);

  // Rotate tips every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % TIPS.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStepStatus = (stepKey: string): StepStatus => {
    if (!status) return 'pending';
    
    // Use backend step data if available
    if (status.steps && status.steps[stepKey]) {
      return status.steps[stepKey].status as StepStatus;
    }
    
    // Fallback to progress-based calculation
    const stepConfig = WORKFLOW_STEPS_CONFIG[stepKey as keyof typeof WORKFLOW_STEPS_CONFIG];
    const [startProgress, endProgress] = stepConfig.progressRange;
    
    if (status.progress < startProgress) return 'pending';
    if (status.progress >= endProgress) return 'completed';
    if (status.status === 'failed') return 'failed';
    return 'processing';
  };

  const getCurrentStepKey = (): string | null => {
    if (!status || status.status !== 'processing') return null;
    
    for (const [key, config] of Object.entries(WORKFLOW_STEPS_CONFIG)) {
      const [start, end] = config.progressRange;
      if (status.progress >= start && status.progress < end) {
        return key;
      }
    }
    return null;
  };

  const handleStepClick = (stepKey: string) => {
    const stepStatus = getStepStatus(stepKey);
    
    if (stepStatus === 'completed' || stepOutputs[stepKey]) {
      setExpandedStep(expandedStep === stepKey ? null : stepKey);
    }
  };


  const currentStepKey = getCurrentStepKey();

  return (
    <div className={cn("h-full flex flex-col", className)}>
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold mb-2">Content Generation</h2>
            <p className="text-muted-foreground text-sm">
              Watch your blog post come to life step by step
            </p>
          </div>

          {/* Progress Overview */}
          {status && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <Badge variant="secondary">{status.progress}%</Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-blue-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${status.progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {status.current_step}
                </p>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Workflow Steps */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Assembly Line</h3>
            
            <div className="relative">
              {/* Conveyor Belt - Vertical Line */}
              <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-300" />
              
              {/* Active Progress Line */}
              {status && (
                <motion.div
                  className="absolute left-6 top-0 w-px bg-blue-500"
                  initial={{ height: 0 }}
                  animate={{ 
                    height: `${(status.progress / 100) * 100}%`
                  }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              )}
              
              {Object.entries(WORKFLOW_STEPS_CONFIG).map(([stepKey, config]) => {
                const stepStatus = getStepStatus(stepKey);
                const isActive = currentStepKey === stepKey;

                return (
                  <div key={stepKey} className="relative">
                    <WorkflowStep
                      stepKey={stepKey}
                      config={config}
                      status={stepStatus}
                      output={stepOutputs[stepKey]}
                      isActive={isActive}
                      onClick={() => handleStepClick(stepKey)}
                      workflowStatus={status}
                    />
                    
                    {/* Pulse animation for active step */}
                    {isActive && (
                      <motion.div
                        className="absolute left-5 top-8 w-3 h-3 bg-blue-500 rounded-full"
                        animate={{ 
                          scale: [1, 1.5, 1],
                          opacity: [1, 0.5, 1]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* While You Wait Tips */}
          <WhileYouWaitTips currentTip={currentTip} />
        </div>
      </ScrollArea>

      {/* Expanded Step Output Dialog */}
      <StepOutputDialog
        stepKey={expandedStep}
        output={expandedStep ? stepOutputs[expandedStep] : null}
        onClose={() => setExpandedStep(null)}
      />
    </div>
  );
}

function WorkflowStep({ 
  stepKey, 
  config, 
  status, 
  output, 
  isActive, 
  onClick,
  workflowStatus
}: WorkflowStepProps) {
  const hasOutput = Boolean(output);
  const isClickable = status === 'completed' || hasOutput;

  const statusConfig = {
    pending: {
      icon: Circle,
      className: "text-gray-400",
      bgClassName: "bg-gray-100",
      borderClassName: "border-gray-200"
    },
    processing: {
      icon: Loader2,
      className: "text-blue-500 animate-spin",
      bgClassName: "bg-blue-50",
      borderClassName: "border-blue-200"
    },
    completed: {
      icon: CheckCircle,
      className: "text-green-500",
      bgClassName: "bg-green-50",
      borderClassName: "border-green-200"
    },
    failed: {
      icon: AlertCircle,
      className: "text-red-500",
      bgClassName: "bg-red-50",
      borderClassName: "border-red-200"
    }
  };

  const StatusIcon = statusConfig[status].icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Object.keys(WORKFLOW_STEPS_CONFIG).indexOf(stepKey) * 0.1 }}
    >
      <Card 
        className={cn(
          "transition-all duration-200 cursor-pointer",
          statusConfig[status].borderClassName,
          statusConfig[status].bgClassName,
          isActive && "ring-2 ring-blue-500 ring-opacity-50",
          isClickable && "hover:shadow-md"
        )}
        onClick={isClickable ? onClick : undefined}
      >
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            {/* Step Connection Point for Assembly Line */}
            <div className="relative flex flex-col items-center">
              {/* Step Icon */}
              <StepIcon
                status={status}
                icon={config.icon}
              />
            </div>

            {/* Step Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">{config.title}</h4>
                <div className="flex items-center space-x-2">
                  {status === 'processing' && (
                    <div className="text-xs text-blue-600 font-medium">
                      {workflowStatus?.steps?.[stepKey]?.progress || 0}%
                    </div>
                  )}
                  <StatusIcon className={cn("h-4 w-4", statusConfig[status].className)} />
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground mt-1">
                {isActive 
                  ? getStepLogMessage(stepKey, workflowStatus || null) || getDynamicStatusMessage(stepKey, status)
                  : config.description
                }
              </p>

              {/* Output Preview */}
              {hasOutput && status === 'completed' && (
                <div className="mt-2 flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    View Output
                  </Badge>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </div>
              )}

              {/* Real-time progress indicator for active step */}
              {isActive && status === 'processing' && (
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                  <motion.div 
                    className="bg-blue-500 h-1 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${workflowStatus?.steps?.[stepKey]?.progress || 0}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function WhileYouWaitTips({ currentTip }: { currentTip: number }) {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center space-x-2">
          <TipIcon className="h-4 w-4 text-blue-600" />
          <span>While You Wait</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentTip}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-sm text-blue-800"
          >
            {TIPS[currentTip]}
          </motion.p>
        </AnimatePresence>
        
        {/* Tip indicators */}
        <div className="flex justify-center space-x-1 mt-3">
          {TIPS.map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-1 h-1 rounded-full transition-colors",
                index === currentTip ? "bg-blue-500" : "bg-blue-300"
              )}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function StepOutputDialog({ 
  stepKey, 
  output, 
  onClose 
}: { 
  stepKey: string | null;
  output: unknown;
  onClose: () => void;
}) {
  if (!stepKey || !output) return null;

  const config = WORKFLOW_STEPS_CONFIG[stepKey as keyof typeof WORKFLOW_STEPS_CONFIG];

  return (
    <Dialog open={Boolean(stepKey)} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>{config.title} Output</span>
          </DialogTitle>
          <DialogDescription>
            {config.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <StepOutputContent stepKey={stepKey} output={output} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StepOutputContent({ stepKey, output }: { stepKey: string; output: unknown }) {
  if (!output) return <p className="text-muted-foreground">No output available</p>;

  switch (stepKey) {
    case 'keyword_research':
      return (
        <div className="space-y-3">
          <div>
            <h4 className="font-medium mb-2">Keywords Found</h4>
            <div className="flex flex-wrap gap-2">
              {output && typeof output === 'object' && 'keywords' in output && Array.isArray(output.keywords) ? output.keywords.map((keyword: string, index: number) => (
                <Badge key={index} variant="secondary">{keyword}</Badge>
              )) : null}
            </div>
          </div>
          {output && typeof output === 'object' && 'primary_keyword' in output && (output as KeywordOutput).primary_keyword && (
            <div>
              <h4 className="font-medium mb-1">Primary Keyword</h4>
              <Badge variant="default">{String((output as KeywordOutput).primary_keyword)}</Badge>
            </div>
          )}
        </div>
      );
      
    case 'content_generation':
      return (
        <div>
          <h4 className="font-medium mb-2">Generated Content Preview</h4>
          <div className="bg-gray-50 p-3 rounded-lg text-sm max-h-40 overflow-y-auto">
            <pre className="whitespace-pre-wrap">{typeof output === 'string' ? output.slice(0, 500) : JSON.stringify(output, null, 2).slice(0, 500)}...</pre>
          </div>
        </div>
      );
      
    default:
      return (
        <div className="bg-gray-50 p-3 rounded-lg">
          <pre className="text-sm">{JSON.stringify(output, null, 2)}</pre>
        </div>
      );
  }
}

function getStepLogMessage(stepKey: string, status: WorkflowStatus | null): string | null {
  if (!status?.steps || !status.steps[stepKey]) return null;
  return status.steps[stepKey].log_message || null;
}

function getDynamicStatusMessage(stepKey: string, status: StepStatus): string {
  if (status !== 'processing') return '';
  
  const messages: Record<string, string[]> = {
    keyword_research: [
      "Analyzing search trends...",
      "Finding competitive keywords...",
      "Researching search volumes..."
    ],
    content_generation: [
      "Drafting the introduction...",
      "Writing main sections...",
      "Crafting the conclusion..."
    ],
    seo_optimization: [
      "Optimizing meta tags...",
      "Improving content structure...",
      "Adding SEO elements..."
    ],
    image_prompt_generation: [
      "Analyzing content themes...",
      "Creating visual concepts...",
      "Refining image prompts..."
    ],
    image_generation: [
      "Generating AI artwork...",
      "Processing visual elements...",
      "Finalizing images..."
    ],
    thumbnail_creation: [
      "Creating social thumbnails...",
      "Adding text overlays...",
      "Optimizing for platforms..."
    ],
    social_snippet_generation: [
      "Crafting social hooks...",
      "Optimizing for engagement...",
      "Adding relevant hashtags..."
    ]
  };
  
  const stepMessages = messages[stepKey] || ["Processing..."];
  return stepMessages[0]; // For now, just return the first message
}