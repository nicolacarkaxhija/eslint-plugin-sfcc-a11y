import { describe, it, expect } from 'vitest';
import plugin from '../index.js';

describe('plugin structure', () => {
  it('exports rules', () => {
    expect(typeof plugin.rules).toBe('object');
    expect(Object.keys(plugin.rules).length).toBeGreaterThan(0);
  });

  describe('processors', () => {
    it('exports .xml processor', () => {
      expect(typeof plugin.processors['.xml'].preprocess).toBe('function');
      expect(typeof plugin.processors['.xml'].postprocess).toBe('function');
    });

    it('exports isml-sanitizer processor', () => {
      const p = plugin.processors['isml-sanitizer'];
      expect(typeof p.preprocess).toBe('function');
      expect(typeof p.postprocess).toBe('function');
    });
  });

  describe('configs.recommended (v8)', () => {
    const { recommended } = plugin.configs;

    it('registers the plugin', () => {
      expect(recommended.plugins).toContain('sfcc-a11y');
    });

    it('has exactly 4 overrides', () => {
      expect(recommended.overrides).toHaveLength(4);
    });

    it('override 0: ISML sanitizer processor on *.isml', () => {
      const o = recommended.overrides[0];
      expect(o.files).toContain('**/*.isml');
      expect(o.processor).toBe('sfcc-a11y/isml-sanitizer');
      expect(o.rules).toBeUndefined();
    });

    it('override 1: html-eslint parser + rules on *.isml/__sanitized.html', () => {
      const o = recommended.overrides[1];
      expect(o.files).toContain('**/*.isml/__sanitized.html');
      expect(o.parser).toBe('@html-eslint/parser');
      expect(typeof o.rules).toBe('object');
    });

    it('override 2: XML processor on libraries/**/*.xml', () => {
      const o = recommended.overrides[2];
      expect(o.files).toContain('**/libraries/**/*.xml');
      expect(o.processor).toBe('sfcc-a11y/.xml');
      expect(o.rules).toBeUndefined();
    });

    it('override 3: html-eslint parser + rules on XML block virtual files', () => {
      const o = recommended.overrides[3];
      expect(o.files).toContain('**/libraries/**/*.xml/block_*.html');
      expect(o.parser).toBe('@html-eslint/parser');
      expect(typeof o.rules).toBe('object');
    });
  });

  describe('configs["flat/recommended"] (v9)', () => {
    const flat = plugin.configs['flat/recommended'];

    it('has exactly 4 entries', () => {
      expect(flat).toHaveLength(4);
    });

    it('entry 0: ISML sanitizer processor on *.isml', () => {
      const e = flat[0];
      expect(e.files).toContain('**/*.isml');
      expect(typeof e.processor.preprocess).toBe('function');
      expect(e.rules).toBeUndefined();
    });

    it('entry 1: html-eslint parser + rules on *.isml/__sanitized.html', () => {
      const e = flat[1];
      expect(e.files).toContain('**/*.isml/__sanitized.html');
      expect(e.languageOptions.parser).toBeDefined();
      expect(typeof e.rules).toBe('object');
    });

    it('entry 2: XML processor on libraries/**/*.xml', () => {
      const e = flat[2];
      expect(e.files).toContain('**/libraries/**/*.xml');
      expect(typeof e.processor.preprocess).toBe('function');
      expect(e.rules).toBeUndefined();
    });

    it('entry 3: html-eslint parser + rules on XML block virtual files', () => {
      const e = flat[3];
      expect(e.files).toContain('**/libraries/**/*.xml/block_*.html');
      expect(e.languageOptions.parser).toBeDefined();
      expect(typeof e.rules).toBe('object');
    });
  });
});
