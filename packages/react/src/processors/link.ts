// @wp-next/react — Link processor (HTML transform mode)
// Adds target="_blank" rel="noopener noreferrer" to external links

import type { ContentProcessor } from '../processor.js';

/**
 * Processor: adds security attributes to external links.
 *
 * Adds target="_blank" and rel="noopener noreferrer" to <a> tags
 * that point to external domains. Leaves internal links unchanged.
 */
export const linkProcessor: ContentProcessor = {
  name: 'wp-next/link',
  priority: 80,
  test: () => true,
  process: () => null,
  transformHtml(html: string): string {
    // Add target and rel to all links that don't have them
    // and point to http/https URLs (external assumption)
    return html.replace(
      /<a\b([^>]*?)>/gi,
      (_match, attrs: string) => {
        // Skip if already has target or is internal
        if (/target\s*=/i.test(attrs)) {
          return `<a${attrs}>`;
        }

        // Check if the href is an external URL
        const hrefMatch = attrs.match(/href\s*=\s*["'](https?:\/\/[^"']*)["']/i);
        if (!hrefMatch) {
          return `<a${attrs}>`; // anchor or relative link
        }

        // Add target="_blank" rel="noopener noreferrer"
        return `<a${attrs} target="_blank" rel="noopener noreferrer">`;
      },
    );
  },
};
