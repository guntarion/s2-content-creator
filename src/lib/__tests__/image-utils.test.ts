/**
 * Tests for image utility functions
 */

import { 
  isDigitalOceanSpacesUrl, 
  getProxiedImageUrl, 
  processImageUrl,
  willUseProxy 
} from '../image-utils';

// Mock the config
jest.mock('../config', () => ({
  config: {
    apiBaseUrl: 'http://localhost:8000'
  }
}));

describe('Image Utils', () => {
  describe('isDigitalOceanSpacesUrl', () => {
    it('should detect DigitalOcean Spaces URLs', () => {
      expect(isDigitalOceanSpacesUrl('https://bucket-titianbakat-ai-project.sgp1.digitaloceanspaces.com/image.jpg')).toBe(true);
      expect(isDigitalOceanSpacesUrl('https://other-bucket.nyc3.digitaloceanspaces.com/image.png')).toBe(true);
    });

    it('should not detect non-DigitalOcean URLs', () => {
      expect(isDigitalOceanSpacesUrl('https://example.com/image.jpg')).toBe(false);
      expect(isDigitalOceanSpacesUrl('https://via.placeholder.com/400x300')).toBe(false);
      expect(isDigitalOceanSpacesUrl('')).toBe(false);
    });
  });

  describe('getProxiedImageUrl', () => {
    it('should proxy DigitalOcean Spaces URLs', () => {
      const originalUrl = 'https://bucket-titianbakat-ai-project.sgp1.digitaloceanspaces.com/image.jpg';
      const expected = 'http://localhost:8000/blog/image-proxy?url=' + encodeURIComponent(originalUrl);
      
      expect(getProxiedImageUrl(originalUrl)).toBe(expected);
    });

    it('should not proxy non-DigitalOcean URLs', () => {
      const originalUrl = 'https://example.com/image.jpg';
      expect(getProxiedImageUrl(originalUrl)).toBe(originalUrl);
    });

    it('should handle empty URLs', () => {
      expect(getProxiedImageUrl('')).toBe('');
    });
  });

  describe('processImageUrl', () => {
    it('should process DigitalOcean Spaces URLs', () => {
      const originalUrl = 'https://bucket-titianbakat-ai-project.sgp1.digitaloceanspaces.com/image.jpg';
      const result = processImageUrl(originalUrl);
      
      expect(result).toContain('http://localhost:8000/blog/image-proxy?url=');
    });

    it('should handle undefined URLs', () => {
      expect(processImageUrl(undefined)).toBeUndefined();
    });

    it('should pass through non-DigitalOcean URLs unchanged', () => {
      const originalUrl = 'https://via.placeholder.com/400x300';
      expect(processImageUrl(originalUrl)).toBe(originalUrl);
    });
  });

  describe('willUseProxy', () => {
    it('should return true for DigitalOcean URLs', () => {
      expect(willUseProxy('https://bucket-titianbakat-ai-project.sgp1.digitaloceanspaces.com/image.jpg')).toBe(true);
    });

    it('should return false for non-DigitalOcean URLs', () => {
      expect(willUseProxy('https://example.com/image.jpg')).toBe(false);
      expect(willUseProxy(undefined)).toBe(false);
    });
  });
});