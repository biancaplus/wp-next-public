// @wp-next-public/react — Content processor interface and pipeline

import type { ReactNode } from 'react';

/**
 * A content processor transforms specific HTML elements into React nodes.
 * Processors run in registration order. The first matching processor wins.
 */
export interface ContentProcessor {
  /** Unique name for debugging */
  name: string;
  /** Test: return true if this processor should handle the element */
  test: (element: Element) => boolean;
  /** Process: return a ReactNode to replace the element, or null to skip */
  process: (element: Element) => ReactNode;
  /** Optional: transform the full HTML before parsing */
  transformHtml?: (html: string) => string;
  /** Priority: lower runs first (default 100) */
  priority?: number;
}
