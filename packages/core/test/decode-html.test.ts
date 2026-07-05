import { describe, expect, it } from 'vitest';
import { decodeHtmlEntities } from '../src/decode-html.js';

describe('decodeHtmlEntities', () => {
  it('decodes decimal numeric entities', () => {
    expect(decodeHtmlEntities('WordPress &#8211; child theme')).toBe(
      'WordPress – child theme',
    );
  });

  it('decodes hex numeric entities', () => {
    expect(decodeHtmlEntities('A&#x2014;B')).toBe('A—B');
  });

  it('decodes named entities', () => {
    expect(decodeHtmlEntities('Tom &amp; Jerry &hellip;')).toBe('Tom & Jerry …');
  });

  it('returns text unchanged when no entities are present', () => {
    expect(decodeHtmlEntities('Plain title')).toBe('Plain title');
  });
});
