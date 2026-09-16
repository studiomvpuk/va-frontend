import { describe, expect, it } from 'vitest';
import { hostOf } from './basis-label';

describe('hostOf', () => {
  it('shows the host, not the whole URL', () => {
    expect(hostOf('https://www.example.com/news/2026/sky-capital')).toBe('example.com');
  });

  it('keeps a subdomain that is not www', () => {
    expect(hostOf('https://news.example.com/x')).toBe('news.example.com');
  });

  it('falls back to the raw string rather than throwing', () => {
    // A hand-edited row should not take the page down.
    expect(hostOf('not a url')).toBe('not a url');
  });
});
