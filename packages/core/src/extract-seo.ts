import { decodeHtmlEntities } from './decode-html.js';

export interface ExtractedSeo {
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  ogImage?: string;
}

function pickOgImage(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value) && value[0]) {
    const first = value[0];
    if (typeof first === 'string') {
      return first;
    }
    if (typeof first === 'object' && first && 'url' in first) {
      return String((first as { url: string }).url);
    }
  }

  return undefined;
}

function assignString(
  target: ExtractedSeo,
  key: keyof Pick<ExtractedSeo, 'seoTitle' | 'seoDescription' | 'canonicalUrl' | 'ogImage'>,
  value: unknown,
  decode = false,
): void {
  if (target[key] || typeof value !== 'string' || !value) {
    return;
  }

  target[key] = decode ? decodeHtmlEntities(value) : value;
}

/**
 * Normalize SEO fields from popular WordPress SEO plugins into WPPost fields.
 *
 * Priority: Yoast → Rank Math → AIOSEO. First plugin with data wins per field.
 */
export function extractSeoFields(raw: Record<string, unknown>): ExtractedSeo {
  const seo: ExtractedSeo = {};

  const yoast = raw.yoast_head_json as Record<string, unknown> | undefined;
  if (yoast) {
    assignString(seo, 'seoTitle', yoast.title, true);
    assignString(seo, 'seoDescription', yoast.description, true);
    assignString(seo, 'canonicalUrl', yoast.canonical);
    assignString(seo, 'ogImage', pickOgImage(yoast.og_image));
  }

  assignString(seo, 'seoTitle', raw.rank_math_title, true);
  assignString(seo, 'seoDescription', raw.rank_math_description, true);
  assignString(seo, 'canonicalUrl', raw.rank_math_canonical_url);
  assignString(seo, 'ogImage', raw.rank_math_facebook_image);

  const rankMath = raw.rank_math as Record<string, unknown> | undefined;
  if (rankMath) {
    assignString(seo, 'seoTitle', rankMath.title, true);
    assignString(seo, 'seoDescription', rankMath.description, true);
    assignString(seo, 'canonicalUrl', rankMath.canonical_url);
    assignString(seo, 'ogImage', pickOgImage(rankMath.facebook_image));
  }

  const aio = raw.aioseo_head_json as Record<string, unknown> | undefined;
  if (aio) {
    assignString(seo, 'seoTitle', aio.title, true);
    assignString(seo, 'seoDescription', aio.description, true);
    assignString(seo, 'canonicalUrl', aio.canonical);
    assignString(seo, 'ogImage', pickOgImage(aio.og_image));
  }

  assignString(seo, 'seoTitle', raw.aioseo_title, true);
  assignString(seo, 'seoDescription', raw.aioseo_description, true);

  const aioMeta = raw.aioseo as Record<string, unknown> | undefined;
  if (aioMeta) {
    assignString(seo, 'seoTitle', aioMeta.title, true);
    assignString(seo, 'seoDescription', aioMeta.description, true);
    assignString(seo, 'canonicalUrl', aioMeta.canonical_url);
    assignString(seo, 'ogImage', pickOgImage(aioMeta.og_image));
  }

  return seo;
}
