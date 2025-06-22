# Component Architecture Guide

## Overview
This document outlines the component architecture for the AI Content Assembly Line interface, providing detailed specifications for each component's responsibilities, props, and usage.

## Component Hierarchy

```
WorkflowTracker (Main Orchestrator)
├── ControlTower (Left Panel)
│   ├── WorkflowStep (7 instances)
│   │   ├── StepIcon
│   │   ├── StepStatus
│   │   └── StepOutput (Expandable)
│   └── WhileYouWaitTips
└── LiveCanvas (Right Panel)
    ├── ContentHeader
    ├── KeywordBadges
    ├── ContentBuilder
    ├── ImagePlaceholder/Image
    ├── SEOMetadata
    └── SocialCardPreview
```

## Core Components

### 1. WorkflowTracker
**File:** `components/workflow/WorkflowTracker.tsx`

**Purpose:** Main orchestrator component that manages the workflow state and coordinates updates between ControlTower and LiveCanvas.

**Props:**
```typescript
interface WorkflowTrackerProps {
  workflowId: string;
  onComplete?: (result: BlogPostResult) => void;
  onError?: (error: string) => void;
}
```

**State Management:**
```typescript
interface WorkflowState {
  status: WorkflowStatus | null;
  result: BlogPostResult | null;
  error: string | null;
  stepOutputs: Record<string, any>;
  isLoading: boolean;
}
```

**Responsibilities:**
- Initialize workflow tracking (SSE/polling)
- Distribute status updates to child components
- Handle workflow completion and error states
- Manage navigation to results page

**Example:**
```tsx
<WorkflowTracker
  workflowId={workflowId}
  onComplete={(result) => router.push(`/result/${workflowId}`)}
  onError={(error) => toast.error(error)}
/>
```

### 2. ControlTower
**File:** `components/workflow/ControlTower.tsx`

**Purpose:** Left panel displaying the 7-step workflow progress with expandable step details.

**Props:**
```typescript
interface ControlTowerProps {
  status: WorkflowStatus | null;
  stepOutputs: Record<string, any>;
  onStepClick?: (stepName: string) => void;
}
```

**Layout:**
```tsx
<div className="w-1/3 h-full border-r bg-background p-6">
  <div className="space-y-4">
    <h2 className="text-2xl font-bold">Content Generation</h2>
    <div className="space-y-3">
      {WORKFLOW_STEPS.map((step, index) => (
        <WorkflowStep
          key={step.name}
          step={step}
          status={getStepStatus(step.name, status)}
          output={stepOutputs[step.name]}
          onClick={() => onStepClick?.(step.name)}
        />
      ))}
    </div>
    <WhileYouWaitTips />
  </div>
</div>
```

### 3. WorkflowStep
**File:** `components/workflow/WorkflowStep.tsx`

**Purpose:** Individual step component showing icon, status, and expandable output.

**Props:**
```typescript
interface WorkflowStepProps {
  step: WorkflowStepConfig;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  output?: any;
  onClick?: () => void;
}

interface WorkflowStepConfig {
  name: string;
  title: string;
  icon: LucideIcon;
  description: string;
  progressRange: [number, number];
}
```

**Step Configurations:**
```typescript
export const WORKFLOW_STEPS: WorkflowStepConfig[] = [
  {
    name: 'keyword_research',
    title: 'Keyword Research',
    icon: Search,
    description: 'Analyzing search trends and competition',
    progressRange: [0, 10]
  },
  {
    name: 'content_generation',
    title: 'Content Generation',
    icon: PenSquare,
    description: 'Creating engaging, SEO-optimized content',
    progressRange: [10, 25]
  },
  {
    name: 'seo_optimization',
    title: 'SEO Optimization',
    icon: Sparkles,
    description: 'Optimizing for search engines',
    progressRange: [25, 40]
  },
  {
    name: 'image_prompt_generation',
    title: 'Image Planning',
    icon: Lightbulb,
    description: 'Designing visual concepts',
    progressRange: [40, 60]
  },
  {
    name: 'image_generation',
    title: 'Image Creation',
    icon: Image,
    description: 'Generating custom visuals',
    progressRange: [60, 75]
  },
  {
    name: 'thumbnail_creation',
    title: 'Thumbnail Design',
    icon: Frame,
    description: 'Creating social media thumbnails',
    progressRange: [75, 85]
  },
  {
    name: 'social_snippet_generation',
    title: 'Social Snippets',
    icon: Share2,
    description: 'Crafting social media content',
    progressRange: [85, 100]
  }
];
```

**Status Indicators:**
```tsx
const StatusIcon = ({ status }: { status: StepStatus }) => {
  const variants = {
    pending: { icon: Circle, className: "text-gray-400" },
    processing: { icon: Loader2, className: "text-blue-500 animate-spin" },
    completed: { icon: CheckCircle, className: "text-green-500" },
    failed: { icon: AlertCircle, className: "text-red-500" }
  };

  const { icon: Icon, className } = variants[status];
  return <Icon className={cn("h-5 w-5", className)} />;
};
```

### 4. LiveCanvas
**File:** `components/workflow/LiveCanvas.tsx`

**Purpose:** Right panel where the blog post builds progressively as workflow steps complete.

**Props:**
```typescript
interface LiveCanvasProps {
  status: WorkflowStatus | null;
  stepOutputs: Record<string, any>;
  result: BlogPostResult | null;
}
```

**Progressive Building Logic:**
```tsx
const LiveCanvas = ({ status, stepOutputs, result }: LiveCanvasProps) => {
  const progress = status?.progress || 0;

  return (
    <div className="w-2/3 h-full overflow-y-auto p-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <ContentHeader 
            title={stepOutputs.seo_optimization?.title}
            progress={progress}
          />
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Keywords appear after keyword_research */}
          {progress > 10 && (
            <KeywordBadges keywords={stepOutputs.keyword_research?.keywords} />
          )}
          
          {/* Content builds progressively */}
          {progress > 25 && (
            <ContentBuilder 
              content={stepOutputs.content_generation}
              progress={progress}
            />
          )}
          
          {/* Images appear after generation */}
          {progress > 75 && stepOutputs.image_generation && (
            <GeneratedImage 
              src={stepOutputs.image_generation.url}
              alt="Generated featured image"
            />
          )}
          
          {/* Social previews at the end */}
          {progress > 85 && (
            <SocialCardPreview 
              snippet={stepOutputs.social_snippet_generation}
              thumbnail={stepOutputs.thumbnail_creation?.url}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
```

### 5. KeywordBadges
**File:** `components/workflow/KeywordBadges.tsx`

**Purpose:** Animated display of researched keywords as badges.

**Props:**
```typescript
interface KeywordBadgesProps {
  keywords: string[] | undefined;
  animated?: boolean;
}
```

**Implementation:**
```tsx
const KeywordBadges = ({ keywords, animated = true }: KeywordBadgesProps) => {
  if (!keywords?.length) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <h3 className="text-sm font-medium text-muted-foreground">
        Target Keywords
      </h3>
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword, index) => (
          <motion.div
            key={keyword}
            initial={animated ? { opacity: 0, scale: 0.8 } : false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Badge variant="secondary">{keyword}</Badge>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
```

### 6. ContentBuilder
**File:** `components/workflow/ContentBuilder.tsx`

**Purpose:** Progressive content rendering with skeleton loading and smooth transitions.

**Props:**
```typescript
interface ContentBuilderProps {
  content: string | undefined;
  progress: number;
  showSkeleton?: boolean;
}
```

**Progressive Rendering:**
```tsx
const ContentBuilder = ({ content, progress, showSkeleton = true }: ContentBuilderProps) => {
  if (!content && showSkeleton) {
    return <ContentSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="prose prose-gray max-w-none"
    >
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-bold mb-4"
            >
              {children}
            </motion.h1>
          ),
          h2: ({ children }) => (
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-semibold mt-8 mb-4"
            >
              {children}
            </motion.h2>
          ),
          p: ({ children }) => (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 leading-relaxed"
            >
              {children}
            </motion.p>
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </motion.div>
  );
};
```

### 7. SocialCardPreview
**File:** `components/workflow/SocialCardPreview.tsx`

**Purpose:** Realistic social media card previews for Twitter, LinkedIn, etc.

**Props:**
```typescript
interface SocialCardPreviewProps {
  snippet: string;
  thumbnail?: string;
  title?: string;
  platform?: 'twitter' | 'linkedin' | 'instagram';
}
```

**Twitter Card:**
```tsx
const TwitterCard = ({ snippet, thumbnail, title }: SocialCardPreviewProps) => (
  <div className="border rounded-lg p-4 bg-white shadow-sm max-w-md">
    <div className="flex items-start space-x-3">
      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
        <span className="text-white font-bold">AI</span>
      </div>
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <span className="font-bold">AI Content Creator</span>
          <span className="text-gray-500">@aicontentcreator</span>
          <span className="text-gray-500">·</span>
          <span className="text-gray-500">now</span>
        </div>
        <p className="mt-1 text-gray-900">{snippet}</p>
        {thumbnail && (
          <div className="mt-3 border rounded-lg overflow-hidden">
            <img src={thumbnail} alt="Preview" className="w-full h-32 object-cover" />
            <div className="p-3">
              <p className="font-medium">{title}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);
```

## Utility Components

### 8. GenerationForm
**File:** `components/workflow/GenerationForm.tsx`

**Purpose:** Input form with validation for starting blog generation.

**Props:**
```typescript
interface GenerationFormProps {
  onSubmit: (data: BlogRequest) => void;
  isLoading?: boolean;
}
```

**Form Schema:**
```typescript
const blogRequestSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  industry: z.string().min(1, "Industry is required"),
  purpose: z.enum(["educational", "promotional", "informational"]),
  target_audience: z.string().optional(),
  word_count: z.number().min(300).max(3000).optional(),
  include_images: z.boolean().optional(),
  seo_focus: z.boolean().optional(),
  target_keyword: z.string().optional(),
  keyword_research_enabled: z.boolean().optional(),
});
```

### 9. WhileYouWaitTips
**File:** `components/workflow/WhileYouWaitTips.tsx`

**Purpose:** Rotating content marketing tips to engage users during wait time.

**Implementation:**
```tsx
const TIPS = [
  "Pro Tip: Read your blog post aloud to check flow and tone.",
  "Did you know? The ideal blog post length for SEO is 2,100-2,400 words.",
  "Remember to add a compelling Call-to-Action at the end.",
  "Headlines with numbers get 36% more clicks than those without.",
  "Including images can increase views by up to 94%."
];

const WhileYouWaitTips = () => {
  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % TIPS.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      key={currentTip}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6"
    >
      <p className="text-sm text-blue-800">{TIPS[currentTip]}</p>
    </motion.div>
  );
};
```

## Animation Patterns

### Entrance Animations
```typescript
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};
```

### Loading States
```typescript
const pulseAnimation = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};
```

## Error States

### Error Boundary
```typescript
interface WorkflowErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class WorkflowErrorBoundary extends Component<
  PropsWithChildren<{}>,
  WorkflowErrorBoundaryState
> {
  constructor(props: PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): WorkflowErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">
            The workflow encountered an unexpected error.
          </p>
          <Button onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </Card>
      );
    }

    return this.props.children;
  }
}
```

## Testing Utilities

### Mock Components
```typescript
// tests/mocks/workflow-mocks.tsx
export const MockWorkflowTracker = ({ 
  workflowId, 
  mockStatus = 'processing',
  mockProgress = 50 
}: {
  workflowId: string;
  mockStatus?: WorkflowStatus['status'];
  mockProgress?: number;
}) => {
  const mockData = {
    id: workflowId,
    status: mockStatus,
    progress: mockProgress,
    current_step: 'Generating content',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  return (
    <div data-testid="mock-workflow-tracker">
      <ControlTower status={mockData} stepOutputs={{}} />
      <LiveCanvas status={mockData} stepOutputs={{}} result={null} />
    </div>
  );
};
```

This component architecture provides a scalable, maintainable foundation for the AI Content Assembly Line interface with clear separation of concerns and reusable patterns.