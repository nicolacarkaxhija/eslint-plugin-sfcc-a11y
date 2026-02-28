import { describe, it } from 'vitest';
import { RuleTester } from 'eslint';
import * as htmlParser from '@html-eslint/parser';
import rule from '../../lib/rules/anchor-is-valid.js';

const ruleTester = new RuleTester({ languageOptions: { parser: htmlParser } });

describe('anchor-is-valid', () => {
  it('requires anchors to have a valid href', () => {
    ruleTester.run('sfcc-a11y/anchor-is-valid', rule, {
      valid: [
        { code: '<a href="/products">Products</a>' },
        { code: '<a href="https://example.com">External</a>' },
        { code: '<a href="#section-1">Jump to section</a>' },
        { code: '<a href="mailto:info@example.com">Email</a>' },
        // Dynamic href — cannot validate
        { code: '<a href="__ISML_EXPR__">Link</a>' },
        // Non-anchor elements are ignored
        { code: '<button>Not an anchor</button>' },
      ],
      invalid: [
        // No href
        {
          code: '<a>Click me</a>',
          errors: [{ messageId: 'missingHref' }],
        },
        // Boolean href (attribute present but no value) — treated as missing
        {
          code: '<a href>Click</a>',
          errors: [{ messageId: 'missingHref' }],
        },
        // Empty href
        {
          code: '<a href="">Empty</a>',
          errors: [{ messageId: 'invalidHref' }],
        },
        // Bare hash
        {
          code: '<a href="#">Hash only</a>',
          errors: [{ messageId: 'invalidHref' }],
        },
        // javascript:void
        {
          code: '<a href="javascript:void(0)">JS void</a>',
          errors: [{ messageId: 'invalidHref' }],
        },
        // javascript: (any variant)
        {
          code: '<a href="javascript:;">JS semi</a>',
          errors: [{ messageId: 'invalidHref' }],
        },
      ],
    });
  });
});
