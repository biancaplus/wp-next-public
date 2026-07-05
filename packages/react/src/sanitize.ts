// @wp-next/react — HTML sanitization
// Uses DOMPurify for XSS protection.

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML string to prevent XSS attacks.
 * Allows common content tags and attributes, strips everything else.
 *
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'img',
      'a',
      'ul',
      'ol',
      'li',
      'pre',
      'code',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'blockquote',
      'strong',
      'em',
      'br',
      'hr',
      'figure',
      'figcaption',
      'div',
      'span',
    ],
    ALLOWED_ATTR: [
      'src',
      'srcset',
      'sizes',
      'alt',
      'href',
      'target',
      'rel',
      'class',
      'id',
      'width',
      'height',
      'loading',
      'decoding',
      'aria-label',
      'title',
      'data-language',
    ],
    ALLOWED_URI_REGEXP:
      /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'svg', 'math'],
    FORBID_ATTR: ['style'],
  });
}
