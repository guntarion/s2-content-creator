'use client';

/**
 * Social Card Preview component
 * Renders realistic social media card previews for different platforms
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal, Twitter, Linkedin, Instagram } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

import { SocialPlatform } from '@/lib/types';

interface SocialCardPreviewProps {
  snippet: string;
  thumbnail?: string;
  title?: string;
  description?: string;
  className?: string;
}

export function SocialCardPreview({ 
  snippet, 
  thumbnail, 
  title, 
  description,
  className 
}: SocialCardPreviewProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>('twitter');

  const platforms = [
    { id: 'twitter' as const, name: 'Twitter', icon: Twitter, color: 'text-blue-500' },
    { id: 'linkedin' as const, name: 'LinkedIn', icon: Linkedin, color: 'text-blue-600' },
    { id: 'instagram' as const, name: 'Instagram', icon: Instagram, color: 'text-pink-500' },
  ];

  return (
    <div className={className}>
      <Tabs value={selectedPlatform} onValueChange={(value) => setSelectedPlatform(value as SocialPlatform)}>
        <TabsList className="grid w-full grid-cols-3">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <TabsTrigger 
                key={platform.id} 
                value={platform.id}
                className="flex items-center space-x-2"
              >
                <Icon className={`h-4 w-4 ${platform.color}`} />
                <span>{platform.name}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <div className="mt-4">
          <TabsContent value="twitter">
            <TwitterCard 
              snippet={snippet} 
              thumbnail={thumbnail} 
              title={title}
              description={description}
            />
          </TabsContent>

          <TabsContent value="linkedin">
            <LinkedInCard 
              snippet={snippet} 
              thumbnail={thumbnail} 
              title={title}
              description={description}
            />
          </TabsContent>

          <TabsContent value="instagram">
            <InstagramCard 
              snippet={snippet} 
              thumbnail={thumbnail} 
              title={title}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function TwitterCard({ 
  snippet, 
  thumbnail, 
  title,
  description 
}: {
  snippet: string;
  thumbnail?: string;
  title?: string;
  description?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="max-w-md mx-auto border border-gray-200 bg-white">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 text-sm">
                <span className="font-bold text-gray-900">AI Content Creator</span>
                <span className="text-gray-500">@aicontentcreator</span>
                <span className="text-gray-500">·</span>
                <span className="text-gray-500">now</span>
                <MoreHorizontal className="h-4 w-4 text-gray-400 ml-auto" />
              </div>
              
              {/* Tweet Content */}
              <div className="mt-1">
                <p className="text-gray-900 text-sm leading-relaxed">
                  {snippet}
                </p>

                {/* Link Preview */}
                {(thumbnail || title || description) && (
                  <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden">
                    {thumbnail && (
                      <img 
                        src={thumbnail} 
                        alt="Preview" 
                        className="w-full h-32 object-cover"
                      />
                    )}
                    {(title || description) && (
                      <div className="p-3 space-y-1">
                        {title && (
                          <p className="font-medium text-sm text-gray-900 line-clamp-2">
                            {title}
                          </p>
                        )}
                        {description && (
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {description}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between mt-3 max-w-md">
                <div className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 cursor-pointer">
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-xs">12</span>
                </div>
                <div className="flex items-center space-x-1 text-gray-500 hover:text-green-500 cursor-pointer">
                  <Repeat2 className="h-4 w-4" />
                  <span className="text-xs">8</span>
                </div>
                <div className="flex items-center space-x-1 text-gray-500 hover:text-red-500 cursor-pointer">
                  <Heart className="h-4 w-4" />
                  <span className="text-xs">24</span>
                </div>
                <div className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 cursor-pointer">
                  <Share className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function LinkedInCard({ 
  snippet, 
  thumbnail, 
  title,
  description 
}: {
  snippet: string;
  thumbnail?: string;
  title?: string;
  description?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="max-w-md mx-auto border border-gray-200 bg-white">
        <CardContent className="p-0">
          {/* Header */}
          <div className="p-4 pb-2">
            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">AI</span>
              </div>
              
              <div className="flex-1">
                <div className="space-y-0.5">
                  <h4 className="font-semibold text-gray-900">AI Content Creator</h4>
                  <p className="text-sm text-gray-600">Content Generation Specialist</p>
                  <p className="text-xs text-gray-500">now</p>
                </div>
              </div>
              
              <MoreHorizontal className="h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Post Content */}
          <div className="px-4 pb-3">
            <p className="text-sm text-gray-900 leading-relaxed">
              {snippet}
            </p>
          </div>

          {/* Media/Link Preview */}
          {(thumbnail || title || description) && (
            <div className="border-t border-gray-100">
              {thumbnail && (
                <img 
                  src={thumbnail} 
                  alt="Preview" 
                  className="w-full h-40 object-cover"
                />
              )}
              {(title || description) && (
                <div className="p-4 space-y-2">
                  {title && (
                    <h4 className="font-medium text-gray-900 line-clamp-2">
                      {title}
                    </h4>
                  )}
                  {description && (
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {description}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="border-t border-gray-100 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 cursor-pointer">
                  <Heart className="h-4 w-4" />
                  <span className="text-sm">Like</span>
                </div>
                <div className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 cursor-pointer">
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-sm">Comment</span>
                </div>
                <div className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 cursor-pointer">
                  <Share className="h-4 w-4" />
                  <span className="text-sm">Share</span>
                </div>
              </div>
            </div>
            
            <div className="mt-2 pt-2 border-t border-gray-50">
              <p className="text-xs text-gray-500">18 likes · 5 comments</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function InstagramCard({ 
  snippet, 
  thumbnail, 
  title 
}: {
  snippet: string;
  thumbnail?: string;
  title?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="max-w-sm mx-auto border border-gray-200 bg-white">
        <CardContent className="p-0">
          {/* Header */}
          <div className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">aicontentcreator</h4>
                </div>
              </div>
              <MoreHorizontal className="h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Image */}
          {thumbnail && (
            <div className="aspect-square">
              <img 
                src={thumbnail} 
                alt="Instagram post" 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Actions */}
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Heart className="h-6 w-6 text-gray-700" />
                <MessageCircle className="h-6 w-6 text-gray-700" />
                <Share className="h-6 w-6 text-gray-700" />
              </div>
            </div>

            {/* Likes */}
            <p className="font-semibold text-sm">42 likes</p>

            {/* Caption */}
            <div className="space-y-1">
              <p className="text-sm">
                <span className="font-semibold">aicontentcreator</span>{' '}
                {snippet}
              </p>
              
              {/* Hashtags */}
              <div className="flex flex-wrap gap-1">
                {['#ai', '#content', '#blog', '#marketing'].map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs text-blue-600 border-none p-0">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div className="text-sm text-gray-500 space-y-1">
              <p>View all 8 comments</p>
              <p className="text-xs">2 HOURS AGO</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}