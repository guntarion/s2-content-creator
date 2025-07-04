'use client';

/**
 * Result Page - Shows the completed blog post with editing and sharing options
 * Features content preview, SEO details, and export capabilities
 */

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
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
  Check,
  Sparkles,
  X
} from 'lucide-react';
import Image from 'next/image'; // Importing Image from next/image

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

import { SocialCardPreview } from '@/components/workflow/SocialCardPreview';
import { BlogPostResult } from '@/lib/types';
import { processImageUrl } from '@/lib/image-utils';
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const workflowId = params.workflowId as string;

  const fetchResult = useCallback(async () => {
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
  }, [workflowId]);

  useEffect(() => {
    if (workflowId) {
      fetchResult();
    }
  }, [workflowId, fetchResult]);

  // Handle ESC key to close image modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedImage) {
        setSelectedImage(null);
      }
    };

    if (selectedImage) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedImage]);

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
                    className="prose prose-gray prose-lg max-w-none prose-headings:text-gray-900 prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-gray-700 prose-p:leading-7 prose-strong:text-gray-900 prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:text-gray-700"
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                      components={{
                        h1: ({...props}) => <h1 className="text-3xl font-bold text-gray-900 mb-6 mt-8 first:mt-0" {...props} />,
                        h2: ({...props}) => <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-6" {...props} />,
                        h3: ({...props}) => <h3 className="text-xl font-medium text-gray-900 mb-3 mt-5" {...props} />,
                        h4: ({...props}) => <h4 className="text-lg font-medium text-gray-900 mb-2 mt-4" {...props} />,
                        p: ({...props}) => <p className="text-gray-700 leading-7 mb-4" {...props} />,
                        ul: ({...props}) => <ul className="list-disc list-inside mb-4 text-gray-700 space-y-1" {...props} />,
                        ol: ({...props}) => <ol className="list-decimal list-inside mb-4 text-gray-700 space-y-1" {...props} />,
                        li: ({...props}) => <li className="text-gray-700" {...props} />,
                        blockquote: ({...props}) => (
                          <blockquote className="border-l-4 border-blue-500 bg-blue-50 py-2 px-4 mb-4 italic text-gray-700" {...props} />
                        ),
                        code: ({inline, ...props}: {inline?: boolean} & React.HTMLAttributes<HTMLElement>) => 
                          inline ? (
                            <code className="text-blue-600 bg-blue-50 px-1 py-0.5 rounded text-sm font-mono" {...props} />
                          ) : (
                            <code className="block bg-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto mb-4" {...props} />
                          ),
                        pre: ({...props}) => (
                          <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4" {...props} />
                        ),
                        strong: ({...props}) => <strong className="font-semibold text-gray-900" {...props} />,
                        em: ({...props}) => <em className="italic text-gray-700" {...props} />,
                        a: ({...props}) => (
                          <a className="text-blue-600 hover:text-blue-800 underline" {...props} />
                        ),
                      }}
                    >
                      {editedContent}
                    </ReactMarkdown>
                  </motion.div>
                )}
              </CardContent>
            </Card>


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

            {/* Image Viewer */}
            {(result.featured_image_url || result.thumbnail_url) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ImageIcon className="h-5 w-5" />
                    <span>Generated Images</span>
                  </CardTitle>
                  <CardDescription>
                    View and download your generated images
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {result.featured_image_url && (
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">
                        FEATURED IMAGE
                      </Label>
                      <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden cursor-pointer" onClick={() => setSelectedImage(result.featured_image_url || null)}>
<Image
  src={processImageUrl(result.featured_image_url) || result.featured_image_url}
  alt="Featured image preview"
  width={800}
  height={128}
  className="w-full h-32 object-cover"
/>
                      </div>
                      <div className="mt-2 flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => setSelectedImage(result.featured_image_url || null)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => handleCopy(result.featured_image_url || '', 'featured-image')}
                        >
                          {copied === 'featured-image' ? (
                            <Check className="h-3 w-3 mr-1 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3 mr-1" />
                          )}
                          Copy URL
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {result.thumbnail_url && (
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">
                        SOCIAL THUMBNAIL
                      </Label>
                      <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden cursor-pointer" onClick={() => setSelectedImage(result.thumbnail_url || null)}>
<Image
  src={processImageUrl(result.thumbnail_url) || result.thumbnail_url}
  alt="Thumbnail preview"
  width={800}
  height={128}
  className="w-full h-32 object-cover"
/>
                      </div>
                      <div className="mt-2 flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => setSelectedImage(result.thumbnail_url || null)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => handleCopy(result.thumbnail_url || '', 'thumbnail')}
                        >
                          {copied === 'thumbnail' ? (
                            <Check className="h-3 w-3 mr-1 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3 mr-1" />
                          )}
                          Copy URL
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

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

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl max-h-full">
            <Button
              variant="ghost"
              size="sm"
              className="absolute -top-12 right-0 text-white hover:text-gray-300 hover:bg-white/10"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-6 w-6" />
              <span className="ml-2">Close</span>
            </Button>
            
            <div 
              className="bg-white rounded-lg overflow-hidden shadow-2xl max-h-[90vh] max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <Image
                  src={selectedImage}
                  alt="Full size image"
                  width={1920}
                  height={1080}
                  className="max-w-full max-h-[80vh] object-contain"
                  onError={() => {
                    console.error('Modal image failed to load:', selectedImage);
                  }}
                />
              </div>
              
              <div className="p-4 bg-gray-50 flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Click image or press ESC to close
                </span>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(selectedImage, 'modal-image')}
                  >
                    {copied === 'modal-image' ? (
                      <Check className="h-4 w-4 mr-2 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4 mr-2" />
                    )}
                    Copy URL
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = selectedImage;
                      link.download = 'generated-image.jpg';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
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
