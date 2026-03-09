import { describe, it } from 'vitest';
import { RuleTester } from 'eslint';
import * as htmlParser from '@html-eslint/parser';
import rule from '../../lib/rules/aria-hidden-on-focusable.js';

const ruleTester = new RuleTester({ languageOptions: { parser: htmlParser } });

describe('aria-hidden-on-focusable', () => {
  it('disallows aria-hidden="true" on focusable elements', () => {
    ruleTester.run('sfcc-a11y/aria-hidden-on-focusable', rule, {
      valid: [
        // Not aria-hidden="true"
        { code: '<button aria-hidden="false">Click</button>' },
        { code: '<input aria-hidden="false">' },
        // Non-focusable element
        { code: '<div aria-hidden="true">Hidden</div>' },
        // <a> without href — not reachable via keyboard
        { code: '<a aria-hidden="true">Decorative</a>' },
        // <input type="hidden"> — removed from tab order
        { code: '<input type="hidden" aria-hidden="true">' },
        // Dynamic aria-hidden — skip
        { code: '<button aria-hidden="__ISML_EXPR__">Click</button>' },
        // tabindex="-1" — removed from tab order
        { code: '<div aria-hidden="true" tabindex="-1">Hidden</div>' },
        // Dynamic tabindex — skip
        { code: '<div aria-hidden="true" tabindex="__ISML_EXPR__">x</div>' },
      ],
      invalid: [
        {
          code: '<button aria-hidden="true">Click</button>',
          errors: [{ messageId: 'ariaHiddenOnFocusable' }],
        },
        {
          code: '<input aria-hidden="true">',
          errors: [{ messageId: 'ariaHiddenOnFocusable' }],
        },
        {
          code: '<a href="/page" aria-hidden="true">Link</a>',
          errors: [{ messageId: 'ariaHiddenOnFocusable' }],
        },
        {
          code: '<select aria-hidden="true"><option>A</option></select>',
          errors: [{ messageId: 'ariaHiddenOnFocusable' }],
        },
        {
          code: '<textarea aria-hidden="true"></textarea>',
          errors: [{ messageId: 'ariaHiddenOnFocusable' }],
        },
        // tabindex >= 0 on a div makes it focusable
        {
          code: '<div aria-hidden="true" tabindex="0">x</div>',
          errors: [{ messageId: 'ariaHiddenOnFocusable' }],
        },
      ],
    });
  });
});
