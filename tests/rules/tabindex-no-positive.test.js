import { describe, it } from 'vitest';
import { RuleTester } from 'eslint';
import * as htmlParser from '@html-eslint/parser';
import rule from '../../lib/rules/tabindex-no-positive.js';

const ruleTester = new RuleTester({ languageOptions: { parser: htmlParser } });

describe('tabindex-no-positive', () => {
  it('allows valid tabindex values', () => {
    ruleTester.run('sfcc-a11y/tabindex-no-positive', rule, {
      valid: [
        { code: '<div tabindex="0">focusable</div>' },
        { code: '<div tabindex="-1">programmatically focusable</div>' },
        { code: '<p>no tabindex</p>' },
        // Dynamic value — cannot evaluate, skip
        { code: '<div tabindex="__ISML_EXPR__">x</div>' },
      ],
      invalid: [
        {
          code: '<div tabindex="1">wrong</div>',
          errors: [{ messageId: 'noPositiveTabindex' }],
        },
        {
          code: '<button tabindex="5">wrong</button>',
          errors: [{ messageId: 'noPositiveTabindex' }],
        },
        {
          code: '<a tabindex="999">link</a>',
          errors: [{ messageId: 'noPositiveTabindex' }],
        },
      ],
    });
  });
});
