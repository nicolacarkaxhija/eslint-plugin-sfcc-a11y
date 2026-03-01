import { describe, it } from 'vitest';
import { RuleTester } from 'eslint';
import * as htmlParser from '@html-eslint/parser';
import rule from '../../lib/rules/aria-required-attr.js';

const ruleTester = new RuleTester({ languageOptions: { parser: htmlParser } });

describe('aria-required-attr', () => {
  it('requires mandatory ARIA attributes for roles that need them', () => {
    ruleTester.run('sfcc-a11y/aria-required-attr', rule, {
      valid: [
        // checkbox requires aria-checked
        { code: '<div role="checkbox" aria-checked="false">item</div>' },
        // combobox requires aria-expanded + aria-controls (ARIA 1.2)
        {
          code: '<div role="combobox" aria-expanded="false" aria-controls="listbox-id">combo</div>',
        },
        // No required props for button
        { code: '<div role="button">click</div>' },
        // No role — skip
        { code: '<div>content</div>' },
        // Dynamic required attr — skip
        { code: '<div role="checkbox" aria-checked="__ISML_EXPR__">item</div>' },
      ],
      invalid: [
        {
          code: '<div role="checkbox">missing checked</div>',
          errors: [{ messageId: 'missingRequiredAttr' }],
        },
      ],
    });
  });
});
