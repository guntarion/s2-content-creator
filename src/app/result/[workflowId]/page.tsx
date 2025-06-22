'use client';

/**
 * Result Page - Shows the completed blog post with editing and sharing options
 * Features content preview, SEO details, and export capabilities
 */

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Edit3, 
  Copy, 
  Eye, 
  FileText,
  Image as ImageIcon,
  Tag,
  Clock,
  ExternalLink,
  Check,
  Sparkles
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { SocialCardPreview } from '@/components/workflow/SocialCardPreview';
import { BlogPostResult } from '@/lib/types';
import { devApiClient } from '@/lib/api-client';

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const [result, setResult] = useState<BlogPostResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  
  const workflowId = params.workflowId as string;

  useEffect(() => {
    if (workflowId) {
      fetchResult();
    }
  }, [workflowId]);

  const fetchResult = async () => {
    try {
      setIsLoading(true);
      const data = await devApiClient.getBlogResult(workflowId);
      setResult(data);
      setEditedContent(data.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load result');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleExport = () => {
    if (!result) return;
    
    const exportData = {
      ...result,
      content: isEditing ? editedContent : result.content,
      exported_at: new Date().toISOString(),
      workflow_id: workflowId
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blog-post-${workflowId.slice(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (!result) return;
    
    const shareData = {
      title: result.seo_title,
      text: result.meta_description,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback to copying URL
      handleCopy(window.location.href, 'url');
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !result) {
    return (
      <ErrorState 
        error={error || 'Result not found'} 
        onBack={() => router.push('/generate')}
        onRetry={fetchResult}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/generate')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>New Generation</span>
              </Button>
              
              <Separator orientation="vertical" className="h-6" />
              
              <div className="flex items-center space-x-2">
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <Check className="h-3 w-3 mr-1" />
                  Complete
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {workflowId.slice(0, 8)}...
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center space-x-1"
              >
                <Edit3 className="h-4 w-4" />
                <span>{isEditing ? 'Preview' : 'Edit'}</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="flex items-center space-x-1"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center space-x-1"
              >
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Blog Post Content */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <CardTitle className="text-2xl">{result.seo_title}</CardTitle>
                    <CardDescription className="text-base">
                      {result.meta_description}
                    </CardDescription>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{result.estimated_read_time} min read</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FileText className="h-4 w-4" />
                        <span>{result.content.split(' ').length} words</span>
                      </div>
                    </div>
                  </div>
                  
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <Sparkles className="h-3 w-3" />
                    <span>AI Generated</span>
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <Label htmlFor="content-editor">Edit Content</Label>
                    <Textarea
                      id="content-editor"
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="min-h-[500px] font-mono text-sm"
                      placeholder="Edit your blog content here..."
                    />
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="prose prose-gray max-w-none"
                  >
                    <ReactMarkdown>{editedContent}</ReactMarkdown>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Images */}
            {result.featured_image_url && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ImageIcon className="h-5 w-5" />
                    <span>Generated Images</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Featured Image</Label>
                    <div className="mt-2 rounded-lg overflow-hidden border">
                      <img 
                        src={result.featured_image_url} 
                        alt="Featured image"
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  </div>
                  
                  {result.thumbnail_url && (
                    <div>
                      <Label>Social Thumbnail</Label>
                      <div className="mt-2 w-48 rounded-lg overflow-hidden border">
                        <img 
                          src={result.thumbnail_url} 
                          alt="Social thumbnail"
                          className="w-full h-36 object-cover"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Social Media Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Social Media Preview</CardTitle>
                <CardDescription>
                  See how your content will look on social platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SocialCardPreview
                  snippet={result.social_media_snippet}
                  thumbnail={result.thumbnail_url}
                  title={result.seo_title}
                  description={result.meta_description}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleCopy(result.content, 'content')}
                >
                  {copied === 'content' ? (
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  Copy Content
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleCopy(result.seo_title, 'title')}
                >
                  {copied === 'title' ? (
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  Copy Title
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleCopy(result.social_media_snippet, 'social')}
                >
                  {copied === 'social' ? (
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  Copy Social Snippet
                </Button>
              </CardContent>
            </Card>

            {/* SEO Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Tag className="h-5 w-5" />
                  <span>SEO Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    SEO TITLE ({result.seo_title.length}/60)
                  </Label>
                  <p className="text-sm mt-1">{result.seo_title}</p>
                </div>
                
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    META DESCRIPTION ({result.meta_description.length}/160)
                  </Label>
                  <p className="text-sm mt-1">{result.meta_description}</p>
                </div>
                
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    KEYWORDS
                  </Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {result.keywords.map((keyword, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    TAGS
                  </Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {result.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Content Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Word Count</span>
                    <span className="font-medium">{result.content.split(' ').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Read Time</span>
                    <span className="font-medium">{result.estimated_read_time} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Keywords</span>
                    <span className="font-medium">{result.keywords.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Images</span>
                    <span className="font-medium">
                      {(result.featured_image_url ? 1 : 0) + (result.thumbnail_url ? 1 : 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="p-8 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
        />
        <h3 className="text-lg font-semibold mb-2">Loading Result</h3>
        <p className="text-muted-foreground">
          Fetching your generated blog post...
        </p>
      </Card>
    </div>
  );
}

function ErrorState({ 
  error, 
  onBack, 
  onRetry 
}: { 
  error: string;
  onBack: () => void;
  onRetry: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="p-8 text-center max-w-md">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-red-600 text-xl">⚠</span>
        </div>
        
        <h3 className="text-lg font-semibold mb-2">Failed to Load Result</h3>
        <p className="text-muted-foreground mb-6">{error}</p>
        
        <div className="flex space-x-3">
          <Button onClick={onRetry}>Try Again</Button>
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Generate
          </Button>
        </div>
      </Card>
    </div>
  );
}