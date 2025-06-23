/**
 * Image utility functions for handling DigitalOcean Spaces URLs and CORS
 */

import { config } from './config';

/**
 * Check if a URL is from DigitalOcean Spaces
 */
export function isDigitalOceanSpacesUrl(url: string): boolean {
  if (!url) return false;
  
  // Match any DigitalOcean Spaces URL pattern
  const spacesPatterns = [
    /\.digitaloceanspaces\.com/,
    /bucket-titianbakat-ai-project\.sgp1\.digitaloceanspaces\.com/
  ];
  
  return spacesPatterns.some(pattern => pattern.test(url));
}

/**
 * Convert a DigitalOcean Spaces URL to use the backend image proxy
 * This avoids CORS issues by proxying images through our backend
 */
export function getProxiedImageUrl(originalUrl: string): string {
  if (!originalUrl) return originalUrl;
  
  // Only proxy DigitalOcean Spaces URLs
  if (!isDigitalOceanSpacesUrl(originalUrl)) {
    return originalUrl;
  }
  
  // Create proxy URL using the backend endpoint
  const encodedUrl = encodeURIComponent(originalUrl);
  return `${config.apiBaseUrl}/blog/image-proxy?url=${encodedUrl}`;
}

/**
 * Process image URL for display - applies proxy conversion if needed
 * This is the main function components should use for image URLs
 */
export function processImageUrl(imageUrl?: string): string | undefined {
  if (!imageUrl) return undefined;
  
  return getProxiedImageUrl(imageUrl);
}

/**
 * Batch process multiple image URLs
 */
export function processImageUrls(imageUrls: (string | undefined)[]): (string | undefined)[] {
  return imageUrls.map(url => processImageUrl(url));
}

/**
 * Extract domain from URL for debugging/logging purposes
 */
export function getImageUrlDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return 'invalid-url';
  }
}

/**
 * Check if an image URL will need proxying
 * Useful for components that want to show different loading states
 */
export function willUseProxy(imageUrl?: string): boolean {
  if (!imageUrl) return false;
  return isDigitalOceanSpacesUrl(imageUrl);
}