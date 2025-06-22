'use client';

/**
 * Control Tower component - Left panel showing workflow step progress
 * Features interactive step tracking, expandable outputs, and helpful tips
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  PenSquare, 
  Sparkles, 
  Lightbulb, 
  Image, 
  Frame, 
  Share2,
  Circle,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Clock,
  Lightbulb as TipIcon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { WorkflowStatus, StepStatus, WORKFLOW_STEPS_CONFIG } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ControlTowerProps {
  status: WorkflowStatus | null;
  stepOutputs: Record<string, any>;
  isLoading?: boolean;
  className?: string;
}

interface WorkflowStepProps {
  stepKey: string;
  config: typeof WORKFLOW_STEPS_CONFIG[keyof typeof WORKFLOW_STEPS_CONFIG];
  status: StepStatus;
  output?: any;
  isActive?: boolean;
  onClick?: () => void;
}

const STEP_ICONS = {
  Search,
  PenSquare, 
  Sparkles,
  Lightbulb,
  Image,
  Frame,
  Share2
} as const;

const TIPS = [
  "💡 Pro Tip: Read your blog post aloud to check flow and tone.",
  "📊 Did you know? Posts with images get 94% more views.",
  "🎯 Headlines with numbers get 36% more clicks.",
  "⏰ The ideal blog post length for SEO is 2,100-2,400 words.",
  "📱 75% of readers scan content, so use clear headings.",
  "🔗 Internal links can increase page views by 40%.",
  "📈 Blog posts with 7+ images get the most social shares."
];

export function ControlTower({ status, stepOutputs, isLoading, className }: ControlTowerProps) {
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
            <h3 className="font-semibold text-lg">Workflow Steps</h3>
            
            {Object.entries(WORKFLOW_STEPS_CONFIG).map(([stepKey, config], index) => {
              const stepStatus = getStepStatus(stepKey);
              const isActive = currentStepKey === stepKey;
              const hasOutput = stepOutputs[stepKey];

              return (
                <WorkflowStep
                  key={stepKey}
                  stepKey={stepKey}
                  config={config}
                  status={stepStatus}
                  output={stepOutputs[stepKey]}
                  isActive={isActive}
                  onClick={() => handleStepClick(stepKey)}
                />
              );
            })}
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
  onClick 
}: WorkflowStepProps) {
  const IconComponent = STEP_ICONS[config.icon as keyof typeof STEP_ICONS] || Circle;
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
            {/* Step Icon */}
            <div className={cn(
              "p-2 rounded-lg",
              status === 'completed' ? 'bg-green-100' : 
              status === 'processing' ? 'bg-blue-100' : 
              status === 'failed' ? 'bg-red-100' : 'bg-gray-100'
            )}>
              <IconComponent className={cn(
                "h-4 w-4",
                status === 'completed' ? 'text-green-600' :
                status === 'processing' ? 'text-blue-600' :
                status === 'failed' ? 'text-red-600' : 'text-gray-600'
              )} />
            </div>

            {/* Step Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">{config.title}</h4>
                <StatusIcon className={cn("h-4 w-4", statusConfig[status].className)} />
              </div>
              
              <p className="text-xs text-muted-foreground mt-1">
                {isActive 
                  ? getDynamicStatusMessage(stepKey, status)
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

              {/* Progress indicator for active step */}
              {isActive && status === 'processing' && (
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                  <div className="bg-blue-500 h-1 rounded-full animate-pulse" style={{ width: '60%' }} />
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
  output: any;
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

function StepOutputContent({ stepKey, output }: { stepKey: string; output: any }) {
  if (!output) return <p className="text-muted-foreground">No output available</p>;

  switch (stepKey) {
    case 'keyword_research':
      return (
        <div className="space-y-3">
          <div>
            <h4 className="font-medium mb-2">Keywords Found</h4>
            <div className="flex flex-wrap gap-2">
              {output.keywords?.map((keyword: string, index: number) => (
                <Badge key={index} variant="secondary">{keyword}</Badge>
              ))}
            </div>
          </div>
          {output.primary_keyword && (
            <div>
              <h4 className="font-medium mb-1">Primary Keyword</h4>
              <Badge variant="default">{output.primary_keyword}</Badge>
            </div>
          )}
        </div>
      );
      
    case 'content_generation':
      return (
        <div>
          <h4 className="font-medium mb-2">Generated Content Preview</h4>
          <div className="bg-gray-50 p-3 rounded-lg text-sm max-h-40 overflow-y-auto">
            <pre className="whitespace-pre-wrap">{output.slice(0, 500)}...</pre>
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