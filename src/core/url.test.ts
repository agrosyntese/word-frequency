import { describe, expect, it } from 'vitest';
import { toHttpUrl } from './url';

describe('toHttpUrl', () => {
  it('keeps full http and https URLs', () => {
    expect(toHttpUrl('https://example.com/a?b=1')).toBe('https://example.com/a?b=1');
    expect(toHttpUrl('  http://example.com  ')).toBe('http://example.com/');
  });

  it('adds https:// when the scheme is missing', () => {
    expect(toHttpUrl('exemplo.com.br/artigo')).toBe('https://exemplo.com.br/artigo');
    expect(toHttpUrl('www.example.com:443/x')).toBe('https://www.example.com/x');
  });

  it('rejects other schemes', () => {
    expect(toHttpUrl('ftp://example.com')).toBeNull();
    expect(toHttpUrl('javascript:alert(1)')).toBeNull();
    expect(toHttpUrl('mailto:a@b.com')).toBeNull();
  });

  it('rejects empty input and things that are not addresses', () => {
    expect(toHttpUrl('')).toBeNull();
    expect(toHttpUrl('   ')).toBeNull();
    expect(toHttpUrl('palavra')).toBeNull();
    expect(toHttpUrl('https://')).toBeNull();
  });
});
