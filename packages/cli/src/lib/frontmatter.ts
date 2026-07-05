// @wp-next/cli — Frontmatter 格式化工具
// 共享于 pull 和 sync 命令

import type { WPPost } from '@wp-next/core';
import YAML from 'yaml';

/**
 * Format post metadata as YAML frontmatter for MDX output
 */
export function toFrontmatter(post: WPPost): string {
  const metadata: Record<string, unknown> = {
    title: post.title,
    slug: post.slug,
    date: post.date,
  };

  if (post.modified) metadata.modified = post.modified;
  if (post.seoTitle) metadata.seoTitle = post.seoTitle;
  if (post.seoDescription) metadata.seoDescription = post.seoDescription;

  if (Array.isArray(post.categories) && post.categories.length > 0) {
    // Support both WPTerm[] and number[]
    if (typeof post.categories[0] === 'object') {
      metadata.categories = (post.categories as Array<{ name: string }>).map(
        (c) => c.name,
      );
    }
  }

  if (Array.isArray(post.tags) && post.tags.length > 0) {
    if (typeof post.tags[0] === 'object') {
      metadata.tags = (post.tags as Array<{ name: string }>).map((t) => t.name);
    }
  }

  if (post.author?.name) {
    metadata.author = post.author.name;
  }

  if (post.featuredMedia?.url) {
    metadata.featuredImage = post.featuredMedia.url;
  }

  const yaml = YAML.stringify(metadata).trimEnd();
  return `---\n${yaml}\n---\n\n`;
}
