// @wp-next/react — Image processor (HTML transform mode)
// Wraps <img> tags with data attributes for downstream optimization

import type { ContentProcessor } from '../processor.js';

/**
 * Processor: enhances <img> tags for responsive loading.
 *
 * Adds loading="lazy" to all images and preserves srcSet/sizes attributes.
 * This processor operates on the HTML string level.
 */
export const imageProcessor: ContentProcessor = {
  name: 'wp-next/image',
  priority: 50,
  test: () => true, // transformHtml handles everything
  process: () => null,
  transformHtml(html: string): string {
    // Add loading="lazy" to images that don't have it
    return html.replace(
      /<img\b([^>]*?)>/gi,
      (_match, attrs: string) => {
        // Skip if already has loading attribute
        if (/loading\s*=/i.test(attrs)) {
          return `<img${attrs}>`;
        }
        return `<img${attrs} loading="lazy">`;
      },
    );
  },
};
