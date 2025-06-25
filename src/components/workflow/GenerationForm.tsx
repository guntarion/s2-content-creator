'use client';

/**
 * Form component for starting blog generation workflow
 * Features validation, dynamic fields, and great UX
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Sparkles, Target, Users, FileText, ImageIcon, Search } from 'lucide-react';
import { useSession, signOut } from "next-auth/react"

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

import { BlogRequest } from '@/lib/types';

// Form validation schema
const blogRequestSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters'),
  industry: z.string()
    .min(1, 'Industry is required'),
  purpose: z.enum(['educational', 'promotional', 'informational'], {
    required_error: 'Please select a purpose'
  }),
  target_audience: z.string().optional(),
  word_count: z.number()
    .min(300, 'Minimum 300 words')
    .max(5000, 'Maximum 5000 words')
    .optional(),
  include_images: z.boolean().optional(),
  seo_focus: z.boolean().optional(),
  target_keyword: z.string().optional(),
  keyword_research_enabled: z.boolean().optional(),
});

type FormData = z.infer<typeof blogRequestSchema>;

interface GenerationFormProps {
  onSubmit: (data: BlogRequest) => void;
  isLoading?: boolean;
  className?: string;
}

const POPULAR_INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Marketing',
  'E-commerce', 'Real Estate', 'Travel', 'Food & Beverage', 'Fashion',
  'Automotive', 'Gaming', 'Sports', 'Environment', 'Business'
];

const POPULAR_AUDIENCES = [
  'General public', 'Professionals', 'Students', 'Entrepreneurs', 
  'Developers', 'Marketers', 'Executives', 'Beginners', 'Experts'
];

export function GenerationForm({ onSubmit, isLoading = false, className }: GenerationFormProps) {
  const { data: session } = useSession()
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [customIndustry, setCustomIndustry] = useState<string>('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(blogRequestSchema),
    defaultValues: {
      word_count: 1000,
      include_images: true,
      seo_focus: true,
      keyword_research_enabled: true,
    },
    mode: 'onChange',
  });

  // Watch form values for dynamic UI updates
  const watchedValues = watch();
  const estimatedTime = Math.ceil((watchedValues.word_count || 1000) / 200) + 
                       (watchedValues.include_images ? 2 : 0) + 
                       (watchedValues.keyword_research_enabled ? 1 : 0);

  const handleFormSubmit = (data: FormData) => {
    const industry = customIndustry || selectedIndustry || data.industry;
    
    onSubmit({
      ...data,
      industry,
      word_count: data.word_count || 1000,
      include_images: data.include_images ?? true,
      seo_focus: data.seo_focus ?? true,
      keyword_research_enabled: data.keyword_research_enabled ?? true,
    });
  };

  const handleIndustrySelect = (industry: string) => {
    if (industry === 'custom') {
      setSelectedIndustry('');
      setCustomIndustry('');
    } else {
      setSelectedIndustry(industry);
      setCustomIndustry('');
      setValue('industry', industry);
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-blue-500" />
            <CardTitle className="text-2xl">Create Your Blog Post</CardTitle>
          </div>
          {session && (
            <div className="flex items-center space-x-2">
              <p>Welcome, {session.user?.name}</p>
              <Button onClick={() => signOut()}>Sign out</Button>
            </div>
          )}
        </div>
        <CardDescription>
          Tell us about your blog post and we&apos;ll create engaging, SEO-optimized content with images and social snippets.
        </CardDescription>
        
        {/* Estimated time indicator */}
        <div className="flex items-center justify-between text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
          <span>Estimated generation time:</span>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            ~{estimatedTime} minutes
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Title Section */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Blog Post Title *</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., The Future of AI in Healthcare"
              {...register('title')}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Industry Section */}
          <div className="space-y-3">
            <Label className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Industry/Niche *</span>
            </Label>
            
            <div className="grid grid-cols-3 gap-2">
              {POPULAR_INDUSTRIES.map((industry) => (
                <Button
                  key={industry}
                  type="button"
                  variant={selectedIndustry === industry ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleIndustrySelect(industry)}
                  className="text-xs"
                >
                  {industry}
                </Button>
              ))}
              <Button
                type="button"
                variant={customIndustry ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleIndustrySelect('custom')}
                className="text-xs"
              >
                Custom
              </Button>
            </div>

            {(!selectedIndustry || customIndustry !== '') && (
              <Input
                placeholder="Enter your industry or niche"
                value={customIndustry}
                onChange={(e) => {
                  setCustomIndustry(e.target.value);
                  setValue('industry', e.target.value);
                }}
                className={errors.industry ? 'border-red-500' : ''}
              />
            )}
            
            {errors.industry && (
              <p className="text-sm text-red-600">{errors.industry.message}</p>
            )}
          </div>

          {/* Purpose and Audience Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purpose">Content Purpose *</Label>
              <Select onValueChange={(value) => setValue('purpose', value as BlogRequest['purpose'])}>
                <SelectTrigger>
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="educational">📚 Educational</SelectItem>
                  <SelectItem value="promotional">📢 Promotional</SelectItem>
                  <SelectItem value="informational">📰 Informational</SelectItem>
                </SelectContent>
              </Select>
              {errors.purpose && (
                <p className="text-sm text-red-600">{errors.purpose.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_audience" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Target Audience</span>
              </Label>
              <Select onValueChange={(value) => setValue('target_audience', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select audience (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {POPULAR_AUDIENCES.map((audience) => (
                    <SelectItem key={audience} value={audience.toLowerCase()}>
                      {audience}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced Options */}
          <Separator />
          
          <div className="space-y-4">
            <h4 className="font-medium">Advanced Options</h4>
            
            {/* Word Count */}
            <div className="space-y-2">
              <Label htmlFor="word_count">Word Count</Label>
              <Input
                id="word_count"
                type="number"
                min="300"
                max="5000"
                step="100"
                {...register('word_count', { valueAsNumber: true })}
                className={errors.word_count ? 'border-red-500' : ''}
              />
              {errors.word_count && (
                <p className="text-sm text-red-600">{errors.word_count.message}</p>
              )}
            </div>

            {/* Target Keyword */}
            <div className="space-y-2">
              <Label htmlFor="target_keyword" className="flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <span>Target Keyword (Optional)</span>
              </Label>
              <Input
                id="target_keyword"
                placeholder="e.g., AI healthcare technology"
                {...register('target_keyword')}
              />
              <p className="text-xs text-muted-foreground">
                Leave blank to let AI research the best keywords
              </p>
            </div>

            {/* Feature Toggles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center space-x-2">
                    <Search className="h-4 w-4" />
                    <span>Keyword Research</span>
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Research trending keywords and optimize content structure
                  </p>
                </div>
                <Switch
                  checked={watchedValues.keyword_research_enabled}
                  onCheckedChange={(checked) => setValue('keyword_research_enabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4" />
                    <span>SEO Focus</span>
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Optimize for search engines with meta tags and structure
                  </p>
                </div>
                <Switch
                  checked={watchedValues.seo_focus}
                  onCheckedChange={(checked) => setValue('seo_focus', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center space-x-2">
                    <ImageIcon className="h-4 w-4" />
                    <span>Generate Images</span>
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Create AI-generated featured images and thumbnails
                  </p>
                </div>
                <Switch
                  checked={watchedValues.include_images}
                  onCheckedChange={(checked) => setValue('include_images', checked)}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            size="lg"
            disabled={!isValid || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Starting Generation...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Blog Post
              </>
            )}
          </Button>

          {/* Form validation summary */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800 font-medium">
                Please fix the following errors:
              </p>
              <ul className="text-sm text-red-700 mt-1 space-y-1">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>• {error.message}</li>
                ))}
              </ul>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}