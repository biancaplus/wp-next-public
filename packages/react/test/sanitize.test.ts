import { describe, expect, it } from 'vitest';
import { sanitizeHtml } from '../src/sanitize.js';

describe('sanitizeHtml', () => {
  it('removes scriptable HTML while preserving common content markup', () => {
    const html = `
      <p>Hello <strong>world</strong></p>
      <script>alert("xss")</script>
      <img src="javascript:alert(1)" onerror="alert(1)" alt="bad">
      <svg onload="alert(1)"></svg>
      <object data="https://evil.example/payload"></object>
      <a href="javascript:alert(1)" onclick="alert(1)">bad link</a>
    `;

    const sanitized = sanitizeHtml(html);

    expect(sanitized).toContain('<p>Hello <strong>world</strong></p>');
    expect(sanitized).not.toContain('<script');
    expect(sanitized).not.toContain('onerror');
    expect(sanitized).not.toContain('onclick');
    expect(sanitized).not.toContain('javascript:');
    expect(sanitized).not.toContain('<svg');
    expect(sanitized).not.toContain('<object');
  });
});
