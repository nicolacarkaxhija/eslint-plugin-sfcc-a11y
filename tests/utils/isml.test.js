import { describe, it, expect } from 'vitest';
import { isDynamic, EXPR_SENTINEL, CONTENT_SENTINEL } from '../../lib/utils/isml.js';

describe('isDynamic', () => {
  it('returns true when the value contains the ISML expression sentinel', () => {
    expect(isDynamic('__ISML_EXPR__')).toBe(true);
    expect(isDynamic('prefix__ISML_EXPR__suffix')).toBe(true);
  });

  it('returns false for static values', () => {
    expect(isDynamic('true')).toBe(false);
    expect(isDynamic('')).toBe(false);
    expect(isDynamic('en')).toBe(false);
  });

  it('returns false for non-string inputs', () => {
    expect(isDynamic(null)).toBe(false);
    expect(isDynamic(undefined)).toBe(false);
    expect(isDynamic(true)).toBe(false);
  });
});

describe('sentinels', () => {
  it('exports the EXPR_SENTINEL string', () => {
    expect(typeof EXPR_SENTINEL).toBe('string');
    expect(EXPR_SENTINEL.length).toBeGreaterThan(0);
  });

  it('exports the CONTENT_SENTINEL string', () => {
    expect(typeof CONTENT_SENTINEL).toBe('string');
    expect(CONTENT_SENTINEL.length).toBeGreaterThan(0);
  });
});
