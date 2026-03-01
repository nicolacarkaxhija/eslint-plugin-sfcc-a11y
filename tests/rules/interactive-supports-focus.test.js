import { describe, it } from 'vitest';
import { RuleTester } from 'eslint';
import * as htmlParser from '@html-eslint/parser';
import rule from '../../lib/rules/interactive-supports-focus.js';

const ruleTester = new RuleTester({ languageOptions: { parser: htmlParser } });

describe('interactive-supports-focus', () => {
  it('requires elements with interactive ARIA roles to be focusable', () => {
    ruleTester.run('sfcc-a11y/interactive-supports-focus', rule, {
      valid: [
        // Natively focusable elements
        { code: '<button role="button">click</button>' },
        { code: '<a href="/" role="link">home</a>' },
        // Non-native element with interactive role + tabindex="0"
        { code: '<div role="button" tabindex="0">click</div>' },
        { code: '<span role="checkbox" tabindex="0" aria-checked="false">check</span>' },
        // Non-interactive role — no requirement
        { code: '<div role="dialog">modal</div>' },
        // No role
        { code: '<div>content</div>' },
        // Dynamic tabindex — cannot evaluate
        { code: '<div role="button" tabindex="__ISML_EXPR__">x</div>' },
        // Negative tabindex is also OK (programmatically focusable)
        { code: '<div role="button" tabindex="-1">x</div>' },
        // Boolean tabindex (no value) — treated as present, so focusable
        { code: '<div role="button" tabindex>x</div>' },
      ],
      invalid: [
        {
          code: '<div role="button">not focusable</div>',
          errors: [{ messageId: 'notFocusable' }],
        },
        {
          code: '<span role="link">missing tabindex</span>',
          errors: [{ messageId: 'notFocusable' }],
        },
        {
          code: '<li role="menuitem">item</li>',
          errors: [{ messageId: 'notFocusable' }],
        },
      ],
    });
  });
});
