import React from 'react';

export interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
}

/**
 * SEO Component for Next.js App Router
 * Note: In Next.js App Router, use generateMetadata() in layout.tsx or page.tsx
 * instead of this component. This is kept for reference or client-side meta updates.
 */
export default function SEO({
  title,
  description,
  canonical,
  ogImage,
  ogType = 'website',
  twitterCard = 'summary_large_image',
}: SEOProps) {
  // In App Router, metadata should be set via generateMetadata() or metadata export
  // This component is primarily for documentation purposes
  
  return null;
}
