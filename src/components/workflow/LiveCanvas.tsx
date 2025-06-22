'use client';

/**
 * Live Canvas component - Right panel showing blog post building in real-time
 * Features progressive content rendering, smooth animations, and live previews
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { 
  FileText, 
  Image as ImageIcon, 
  Tag, 
  Clock, 
  Eye,
  Share2,
  Sparkles
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { WorkflowStatus, BlogPostResult } from '@/lib/types';
import { SocialCardPreview } from './SocialCardPreview';

interface LiveCanvasProps {
  status: WorkflowStatus | null;
  stepOutputs: Record<string, any>;
  result: BlogPostResult | null;
  isLoading?: boolean;
  className?: string;
}

export function LiveCanvas({ 
  status, 
  stepOutputs, 
  result, 
  isLoading, 
  className 
}: LiveCanvasProps) {
  const [visibleElements, setVisibleElements] = useState<Set<string>>(new Set());
  
  const progress = status?.progress || 0;

  // Control which elements are visible based on progress
  useEffect(() => {
    const newVisibleElements = new Set<string>();
    
    if (progress > 0) newVisibleElements.add('header');
    if (progress > 10) newVisibleElements.add('keywords');
    if (progress > 25) newVisibleElements.add('content');
    if (progress > 40) newVisibleElements.add('seo');
    if (progress > 75) newVisibleElements.add('images');
    if (progress > 85) newVisibleElements.add('social');
    if (progress >= 100) newVisibleElements.add('complete');
    
    setVisibleElements(newVisibleElements);
  }, [progress]);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className={`h-full overflow-y-auto bg-gradient-to-br from-gray-50 to-white ${className}`}>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <AnimatePresence>
          {visibleElements.has('header') && (
            <motion.div {...fadeInUp}>
              <ContentHeader
                title={stepOutputs.seo_optimization?.title || stepOutputs.content_generation?.title}
                progress={progress}
                status={status}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Keywords Section */}
        <AnimatePresence>
          {visibleElements.has('keywords') && (
            <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
              <KeywordSection keywords={stepOutputs.keyword_research?.keywords} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* SEO Metadata */}
        <AnimatePresence>
          {visibleElements.has('seo') && stepOutputs.seo_optimization && (
            <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
              <SEOMetadataPreview seoData={stepOutputs.seo_optimization} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <AnimatePresence>
          {visibleElements.has('content') && (
            <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
              <ContentSection 
                content={stepOutputs.content_generation || result?.content}
                isComplete={progress >= 100}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Images Section */}
        <AnimatePresence>
          {visibleElements.has('images') && (
            <motion.div {...fadeInUp} transition={{ delay: 0.5 }}>
              <ImageSection 
                featuredImage={stepOutputs.image_generation?.url || result?.featured_image_url}
                thumbnail={stepOutputs.thumbnail_creation?.url || result?.thumbnail_url}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Social Media Preview */}
        <AnimatePresence>
          {visibleElements.has('social') && (
            <motion.div {...fadeInUp} transition={{ delay: 0.6 }}>
              <SocialSection 
                snippet={stepOutputs.social_snippet_generation || result?.social_media_snippet}
                thumbnail={stepOutputs.thumbnail_creation?.url || result?.thumbnail_url}
                title={stepOutputs.seo_optimization?.title || result?.seo_title}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Completion Summary */}
        <AnimatePresence>
          {visibleElements.has('complete') && result && (
            <motion.div {...fadeInUp} transition={{ delay: 0.7 }}>
              <CompletionSummary result={result} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {!visibleElements.has('header') && isLoading && (
          <LoadingState />
        )}
      </div>
    </div>
  );
}

function ContentHeader({ 
  title, 
  progress, 
  status 
}: { 
  title?: string;
  progress: number;
  status: WorkflowStatus | null;
}) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-2 border-blue-100">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            {title ? (
              <motion.h1 
                className="text-3xl font-bold text-gray-900"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {title}
              </motion.h1>
            ) : (
              <Skeleton className="h-8 w-96" />
            )}
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>
                  {status?.status === 'completed' ? 'Completed' : 'Generating...'}
                </span>
              </div>
              
              {progress > 0 && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{progress}% complete</span>
                </div>
              )}
            </div>
          </div>
          
          <Badge 
            variant={status?.status === 'completed' ? 'default' : 'secondary'}
            className="flex items-center space-x-1"
          >
            <Sparkles className="h-3 w-3" />
            <span>AI Generated</span>
          </Badge>
        </div>
      </CardHeader>
    </Card>
  );
}

function KeywordSection({ keywords }: { keywords?: string[] }) {
  if (!keywords?.length) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center space-x-2">
          <Tag className="h-5 w-5 text-blue-600" />
          <span>Target Keywords</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div 
          className="flex flex-wrap gap-2"
          variants={{
            animate: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          initial="initial"
          animate="animate"
        >
          {keywords.map((keyword, index) => (
            <motion.div
              key={keyword}
              variants={{
                initial: { opacity: 0, scale: 0.8 },
                animate: { opacity: 1, scale: 1 }
              }}
            >
              <Badge variant="outline" className="text-sm">
                {keyword}
              </Badge>
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  );
}

function SEOMetadataPreview({ seoData }: { seoData: any }) {
  return (
    <Card className="bg-green-50 border-green-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center space-x-2 text-green-800">
          <Sparkles className="h-5 w-5" />
          <span>SEO Optimization</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <label className="text-sm font-medium text-green-700">SEO Title</label>
          <div className="mt-1 p-2 bg-white rounded border text-sm">
            {seoData.title || 'Optimizing...'}
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium text-green-700">Meta Description</label>
          <div className="mt-1 p-2 bg-white rounded border text-sm">
            {seoData.description || 'Creating description...'}
          </div>
        </div>

        {seoData.tags && (
          <div>
            <label className="text-sm font-medium text-green-700">Tags</label>
            <div className="mt-1 flex flex-wrap gap-1">
              {seoData.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ContentSection({ 
  content, 
  isComplete 
}: { 
  content?: string;
  isComplete: boolean;
}) {
  if (!content) {
    return <ContentSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Blog Content</span>
          {isComplete && (
            <Badge variant="default" className="ml-auto">
              Complete
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
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
                  className="text-2xl font-bold mb-4 text-gray-900"
                >
                  {children}
                </motion.h1>
              ),
              h2: ({ children }) => (
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xl font-semibold mt-6 mb-3 text-gray-800"
                >
                  {children}
                </motion.h2>
              ),
              p: ({ children }) => (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 leading-relaxed text-gray-700"
                >
                  {children}
                </motion.p>
              )
            }}
          >
            {content}
          </ReactMarkdown>
        </motion.div>
      </CardContent>
    </Card>
  );
}

function ContentSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Blog Content</span>
          <Badge variant="secondary" className="ml-auto">
            Generating...
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="h-6 w-1/2" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </CardContent>
    </Card>
  );
}

function ImageSection({ 
  featuredImage, 
  thumbnail 
}: { 
  featuredImage?: string;
  thumbnail?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ImageIcon className="h-5 w-5" />
          <span>Generated Images</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {featuredImage ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">Featured Image</label>
              <div className="rounded-lg overflow-hidden border">
                <img 
                  src={featuredImage} 
                  alt="Generated featured image"
                  className="w-full h-64 object-cover"
                />
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-2">
            <label className="text-sm font-medium">Featured Image</label>
            <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">Generating image...</p>
              </div>
            </div>
          </div>
        )}

        {thumbnail && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">Social Thumbnail</label>
              <div className="w-48 rounded-lg overflow-hidden border">
                <img 
                  src={thumbnail} 
                  alt="Social media thumbnail"
                  className="w-full h-36 object-cover"
                />
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

function SocialSection({ 
  snippet, 
  thumbnail, 
  title 
}: { 
  snippet?: string;
  thumbnail?: string;
  title?: string;
}) {
  if (!snippet) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Share2 className="h-5 w-5" />
          <span>Social Media Preview</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SocialCardPreview
            snippet={snippet}
            thumbnail={thumbnail}
            title={title}
          />
        </motion.div>
      </CardContent>
    </Card>
  );
}

function CompletionSummary({ result }: { result: BlogPostResult }) {
  return (
    <Card className="bg-green-50 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-green-800">
          <Sparkles className="h-5 w-5" />
          <span>Generation Complete!</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="space-y-1">
            <p className="text-2xl font-bold text-green-600">
              {result.estimated_read_time}
            </p>
            <p className="text-sm text-green-700">Min Read</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-2xl font-bold text-green-600">
              {result.keywords.length}
            </p>
            <p className="text-sm text-green-700">Keywords</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-2xl font-bold text-green-600">
              {result.content.split(' ').length}
            </p>
            <p className="text-sm text-green-700">Words</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-2xl font-bold text-green-600">
              {result.featured_image_url ? '✓' : '—'}
            </p>
            <p className="text-sm text-green-700">Images</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
      </Card>
      
      <Card>
        <CardContent className="pt-6 space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    </div>
  );
}