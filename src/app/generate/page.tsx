'use client';

/**
 * Blog Generation Form Page
 * Entry point for starting the blog generation workflow
 */

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Zap, Target, Image, Share2 } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { GenerationForm } from '@/components/workflow/GenerationForm';
import { useWorkflowTracking } from '@/hooks/useWorkflowTracking';
import { BlogRequest } from '@/lib/types';

const FEATURE_HIGHLIGHTS = [
  {
    icon: Target,
    title: 'Smart Keyword Research',
    description: 'AI analyzes search trends to find the best keywords for your content'
  },
  {
    icon: Zap,
    title: 'SEO Optimization',
    description: 'Automatically optimized titles, meta descriptions, and content structure'
  },
  {
    icon: Image,
    title: 'AI-Generated Images',
    description: 'Custom visuals created specifically for your blog post content'
  },
  {
    icon: Share2,
    title: 'Social Ready',
    description: 'Pre-written social media snippets optimized for each platform'
  }
];

export default function GeneratePage() {
  const router = useRouter();
  const { startGeneration, isLoading, error } = useWorkflowTracking();

  const handleSubmit = async (data: BlogRequest) => {
    try {
      const response = await startGeneration(data);
      
      // Use the actual workflow ID from the backend response
      if (response?.workflow_id) {
        router.push(`/workflow/${response.workflow_id}`);
      } else {
        console.error('No workflow ID received from backend');
      }
    } catch (err) {
      console.error('Failed to start generation:', err);
    }
  };

  const handleDemoClick = () => {
    const demoData: BlogRequest = {
      title: 'The Future of AI in Healthcare: Transforming Patient Care',
      industry: 'healthcare',
      purpose: 'educational',
      target_audience: 'healthcare professionals',
      word_count: 1200,
      include_images: true,
      seo_focus: true,
      keyword_research_enabled: true,
    };
    
    handleSubmit(demoData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <Sparkles className="h-16 w-16 text-blue-500" />
              <motion.div
                className="absolute -top-1 -right-1 w-6 h-6 bg-purple-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            AI Content{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Assembly Line
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Watch your blog post come to life in real-time. From keyword research to social snippets, 
            our AI creates everything you need in one seamless workflow.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Badge variant="secondary" className="text-sm px-4 py-2">
              🚀 7-Step AI Workflow
            </Badge>
            <Badge variant="secondary" className="text-sm px-4 py-2">
              ⚡ 2-5 Minute Generation
            </Badge>
            <Badge variant="secondary" className="text-sm px-4 py-2">
              📱 Social Media Ready
            </Badge>
          </div>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {FEATURE_HIGHLIGHTS.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
              >
                <Card className="text-center h-full bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Generation Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <GenerationForm 
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="space-y-6"
          >
            {/* Quick Demo */}
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  <span>Try the Demo</span>
                </CardTitle>
                <CardDescription>
                  See the AI Assembly Line in action with a sample blog post about AI in healthcare.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleDemoClick}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Start Demo Workflow
                </Button>
              </CardContent>
            </Card>

            {/* Process Overview */}
            <Card>
              <CardHeader>
                <CardTitle>The AI Assembly Line Process</CardTitle>
                <CardDescription>
                  Here&apos;s what happens behind the scenes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { step: 1, name: 'Keyword Research', time: '30s' },
                    { step: 2, name: 'Content Generation', time: '90s' },
                    { step: 3, name: 'SEO Optimization', time: '45s' },
                    { step: 4, name: 'Image Creation', time: '60s' },
                    { step: 5, name: 'Thumbnail Design', time: '30s' },
                    { step: 6, name: 'Social Snippets', time: '45s' },
                  ].map((item) => (
                    <div key={item.step} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">{item.step}</span>
                        </div>
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        ~{item.time}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle>💡 Pro Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>• Be specific with your title for better keyword targeting</p>
                <p>• Choose your industry carefully - it affects content style</p>
                <p>• Enable keyword research for maximum SEO impact</p>
                <p>• Include images for better social media engagement</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-red-800 font-medium">Error starting generation:</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}