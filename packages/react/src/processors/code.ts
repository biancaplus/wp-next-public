// @wp-next-public/react — Code block processor (HTML transform mode)
// Adds language markers to <pre><code> blocks

import type { ContentProcessor } from '../processor.js';

function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Processor: enhances <pre><code> blocks.
 *
 * Extracts language from class names and normalizes the structure.
 * Downstream syntax highlighters (Shiki, Prism) can use these markers.
 */
export const codeProcessor: ContentProcessor = {
  name: 'wp-next/code',
  priority: 10,
  test: () => true,
  process: () => null,
  transformHtml(html: string): string {
    // Normalize <pre> wrapping and extract language
    return html.replace(
      /<pre\b([^>]*?)><code\b([^>]*?)>([\s\S]*?)<\/code><\/pre>/gi,
      (_match, preAttrs: string, codeAttrs: string, code: string) => {
        // Extract language from class
        let language = '';
        const classMatch = codeAttrs.match(/class\s*=\s*["']([^"']*)["']/i);
        if (classMatch) {
          const classes = classMatch[1].split(/\s+/);
          const langClass = classes.find((c) => c.startsWith('language-'));
          if (langClass) {
            language = langClass.replace('language-', '');
          }
        }

        const langAttr = language
          ? ` data-language="${escapeAttribute(language)}"`
          : '';
        return `<pre${preAttrs}${langAttr}><code${codeAttrs}>${code}</code></pre>`;
      },
    );
  },
};
