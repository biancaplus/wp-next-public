// @wp-next-public/react — ContentRenderer component
// Renders HTML content with optional processor pipeline.
// Falls back to dangerouslySetInnerHTML when no processors match.

import type { FC, ReactNode } from 'react';
import React from 'react';
import type { ContentProcessor } from './processor.js';
import { sanitizeHtml } from './sanitize.js';

export interface ContentRendererProps {
  /** Raw HTML content from WordPress */
  html: string;
  /** Optional processors to apply (run in priority order) */
  processors?: ContentProcessor[];
  /** Wrapper element tag (default: 'div') */
  as?: keyof React.JSX.IntrinsicElements;
  /** Additional className for the wrapper */
  className?: string;
}

/**
 * ContentRenderer — renders WP HTML content with processor pipeline.
 *
 * Processors are applied to the HTML string BEFORE rendering:
 * - Each processor's `transformHtml()` is called in priority order
 * - The final transformed HTML is rendered via dangerouslySetInnerHTML
 *
 * Without processors, behaves exactly like dangerouslySetInnerHTML.
 *
 * @example
 * ```tsx
 * <ContentRenderer
 *   html={post.content}
 *   processors={[imageProcessor, codeProcessor]}
 * />
 * ```
 */
export function ContentRenderer({
  html,
  processors = [],
  as: Wrapper = 'div',
  className,
}: ContentRendererProps) {
  // Sanitize HTML
  let processedHtml = sanitizeHtml(html);

  // Apply processor HTML transformations
  // Processors modify the HTML string (e.g., wrap <img> in optimized containers)
  const sorted = [...processors].sort(
    (a, b) => (a.priority ?? 100) - (b.priority ?? 100),
  );

  for (const processor of sorted) {
    if (processor.transformHtml) {
      processedHtml = processor.transformHtml(processedHtml);
    }
  }

  return (
    <Wrapper
      className={className}
      dangerouslySetInnerHTML={{ __html: processedHtml }}
    />
  );
}
