# Image Proxy Integration

This document describes the integration of the backend image proxy endpoint to resolve CORS issues with DigitalOcean Spaces images.

## Overview

To avoid CORS issues when displaying images from DigitalOcean Spaces, all DigitalOcean Spaces URLs are now automatically proxied through the backend's `/blog/image-proxy` endpoint.

## Backend Endpoint

The backend provides the following endpoint:
- `GET /blog/image-proxy?url={encoded_image_url}` - Proxies images from DigitalOcean Spaces

## Frontend Changes

### New Utility Module

Created `/src/lib/image-utils.ts` with the following functions:

- **`isDigitalOceanSpacesUrl(url: string): boolean`** - Checks if a URL is from DigitalOcean Spaces
- **`getProxiedImageUrl(originalUrl: string): string`** - Converts DO Spaces URLs to proxy URLs
- **`processImageUrl(imageUrl?: string): string | undefined`** - Main function for processing image URLs
- **`willUseProxy(imageUrl?: string): boolean`** - Check if an image will be proxied

### Updated Components

The following components have been updated to use the image proxy:

1. **`/src/components/workflow/LiveCanvas.tsx`**
   - Featured images in the ImageSection
   - Thumbnails in the SocialSection

2. **`/src/components/workflow/SocialCardPreview.tsx`**
   - All social media platform preview images
   - Twitter, LinkedIn, and Instagram card thumbnails

3. **`/src/app/result/[workflowId]/page.tsx`**
   - Featured image display
   - Social thumbnail display
   - Social card preview thumbnails

### How It Works

1. When an image URL is processed, the utility checks if it's from DigitalOcean Spaces
2. If it is, the URL is encoded and passed to the backend proxy endpoint
3. If it's not, the original URL is used unchanged
4. Non-DigitalOcean URLs (like placeholders) are passed through without modification

### Example

```typescript
// Original DigitalOcean Spaces URL
const originalUrl = 'https://bucket-titianbakat-ai-project.sgp1.digitaloceanspaces.com/image.jpg';

// Processed URL (proxied)
const processedUrl = processImageUrl(originalUrl);
// Result: 'http://localhost:8000/blog/image-proxy?url=https%3A//bucket-titianbakat-ai-project.sgp1.digitaloceanspaces.com/image.jpg'

// Non-DigitalOcean URL
const externalUrl = 'https://via.placeholder.com/400x300';
const processedExternal = processImageUrl(externalUrl);
// Result: 'https://via.placeholder.com/400x300' (unchanged)
```

## Testing

Unit tests have been created in `/src/lib/__tests__/image-utils.test.ts` to verify:
- DigitalOcean Spaces URL detection
- Proper proxy URL generation
- Handling of edge cases (empty URLs, non-DO URLs)

## Configuration

The proxy uses the configured API base URL from `/src/lib/config.ts`:
- `config.apiBaseUrl` (default: 'http://localhost:8000')

## Benefits

1. **CORS Resolution**: Eliminates CORS issues when loading DigitalOcean Spaces images
2. **Automatic Detection**: Only proxies DigitalOcean Spaces URLs, leaving other URLs unchanged
3. **Backward Compatibility**: Existing code continues to work without modification
4. **Performance**: Direct loading for non-problematic URLs, proxy only when needed

## Usage

Simply import and use the `processImageUrl` function wherever you display images:

```typescript
import { processImageUrl } from '@/lib/image-utils';

// In your component
<img src={processImageUrl(imageUrl)} alt="Description" />
```