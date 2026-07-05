import { describe, expect, it } from 'vitest';
import { extractSeoFields } from '../src/extract-seo.js';

describe('extractSeoFields', () => {
  it('reads Yoast yoast_head_json fields', () => {
    const seo = extractSeoFields({
      yoast_head_json: {
        title: 'SEO Title &#8211; Site',
        description: 'Meta description',
        canonical: 'https://wp.example.com/post/',
        og_image: [{ url: 'https://wp.example.com/image.jpg' }],
      },
    });

    expect(seo.seoTitle).toBe('SEO Title – Site');
    expect(seo.seoDescription).toBe('Meta description');
    expect(seo.canonicalUrl).toBe('https://wp.example.com/post/');
    expect(seo.ogImage).toBe('https://wp.example.com/image.jpg');
  });

  it('falls back to Rank Math fields when Yoast is absent', () => {
    const seo = extractSeoFields({
      rank_math_title: 'Rank Math title',
      rank_math_description: 'Rank Math description',
      rank_math_canonical_url: 'https://wp.example.com/rank-math/',
      rank_math_facebook_image: 'https://wp.example.com/rm.jpg',
    });

    expect(seo.seoTitle).toBe('Rank Math title');
    expect(seo.seoDescription).toBe('Rank Math description');
    expect(seo.canonicalUrl).toBe('https://wp.example.com/rank-math/');
    expect(seo.ogImage).toBe('https://wp.example.com/rm.jpg');
  });

  it('prefers Yoast over Rank Math when both are present', () => {
    const seo = extractSeoFields({
      yoast_head_json: { title: 'Yoast title', description: 'Yoast desc' },
      rank_math_title: 'Rank Math title',
      rank_math_description: 'Rank Math desc',
    });

    expect(seo.seoTitle).toBe('Yoast title');
    expect(seo.seoDescription).toBe('Yoast desc');
  });
});
