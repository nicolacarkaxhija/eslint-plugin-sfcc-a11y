import { describe, it, expect } from 'vitest';
import plugin from '../../index.js';

const processor = plugin.processors['isml-sanitizer'];
const { preprocess, postprocess } = processor;

describe('isml-sanitizer processor', () => {
  describe('preprocess', () => {
    it('returns a single virtual block', () => {
      const blocks = preprocess('<p>Hello</p>', 'file.isml');
      expect(blocks).toHaveLength(1);
    });

    it('assigns a virtual filename ending in /__sanitized.html', () => {
      const [block] = preprocess('<p>Hello</p>', '/path/to/checkout.isml');
      expect(block.filename).toBe('/path/to/checkout.isml/__sanitized.html');
    });

    it('sanitizes ISML expressions out of the returned text', () => {
      const [block] = preprocess('<img src="${product.image}" alt="${product.alt}">', 'f.isml');
      expect(block.text).not.toContain('${');
    });

    it('passes through static HTML unchanged (modulo whitespace/sentinels)', () => {
      const [block] = preprocess('<img src="logo.png" alt="Logo">', 'f.isml');
      expect(block.text).toContain('alt="Logo"');
    });
  });

  describe('postprocess', () => {
    it('unwraps the outer array (one block → flat message list)', () => {
      const msgs = [{ ruleId: 'sfcc-a11y/img-alt', message: 'missing alt' }];
      expect(postprocess([msgs])).toBe(msgs);
    });

    it('returns an empty array when the block has no messages', () => {
      expect(postprocess([[]])).toEqual([]);
    });
  });

  describe('meta', () => {
    it('exposes meta.name and meta.version', () => {
      expect(processor.meta.name).toBe('sfcc-a11y/isml-sanitizer');
      expect(typeof processor.meta.version).toBe('string');
    });

    it('sets supportsAutofix to false', () => {
      expect(processor.supportsAutofix).toBe(false);
    });
  });
});
