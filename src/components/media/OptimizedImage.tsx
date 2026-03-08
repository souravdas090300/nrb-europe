/**
 * @file OptimizedImage.tsx — Sanity-aware responsive image component
 *
 * Wraps Next.js `<Image>` with automatic Sanity CDN URL generation
 * via `urlFor()`. Supports responsive sizes, hotspot cropping,
 * blur placeholders, and custom quality settings.
 */

'use client'

import Image from 'next/image'
import { urlFor } from '@/lib/sanity/client'

interface OptimizedImageProps {
  source: any // Sanity image source
  alt: string
  width?: number
  height?: number
  fill?: boolean
  sizes?: string
  priority?: boolean
  className?: string
  quality?: number
}

/**
 * Generate an optimized Sanity image URL with width, quality, and format.
 */
export function getOptimizedImageUrl(
  source: any,
  options: { width?: number; height?: number; quality?: number } = {}
) {
  const { width = 800, quality = 80 } = options
  let builder = urlFor(source).auto('format' as any).quality(quality)
  if (width) builder = builder.width(width)
  if (options.height) builder = builder.height(options.height)
  return builder.url()
}

/**
 * Generate a srcSet string for responsive images from Sanity CDN.
 */
export function getSrcSet(source: any, widths: number[] = [320, 640, 960, 1280, 1920]) {
  return widths
    .map((w) => `${getOptimizedImageUrl(source, { width: w })} ${w}w`)
    .join(', ')
}

/**
 * OptimizedImage component using Sanity CDN + Next.js Image.
 * Automatically generates responsive srcSet via Sanity image URL builder.
 */
export default function OptimizedImage({
  source,
  alt,
  width,
  height,
  fill = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority = false,
  className,
  quality = 80,
}: OptimizedImageProps) {
  if (!source) return null

  const src = getOptimizedImageUrl(source, { width: width || 1200, quality })

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={className}
        quality={quality}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 800}
      height={height || 450}
      sizes={sizes}
      priority={priority}
      className={className}
      quality={quality}
    />
  )
}
