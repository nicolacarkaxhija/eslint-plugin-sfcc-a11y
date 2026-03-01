import { describe, it } from 'vitest';
import { RuleTester } from 'eslint';
import * as htmlParser from '@html-eslint/parser';
import rule from '../../lib/rules/aria-props.js';

const ruleTester = new RuleTester({ languageOptions: { parser: htmlParser } });

describe('aria-props', () => {
  it('requires aria-* attribute names to be valid ARIA properties', () => {
    ruleTester.run('sfcc-a11y/aria-props', rule, {
      valid: [
        { code: '<div aria-label="description">x</div>' },
        { code: '<input aria-required="true">' },
        { code: '<div aria-expanded="false">menu</div>' },
        { code: '<div aria-hidden="true">icon</div>' },
        // No aria attributes — valid
        { code: '<p>content</p>' },
        // Mix of non-aria and aria attributes — non-aria are skipped
        { code: '<div class="foo" aria-label="bar">x</div>' },
      ],
      invalid: [
        {
          code: '<div aria-labeledby="id">x</div>',
          errors: [{ messageId: 'invalidProp' }],
        },
        {
          code: '<div aria-fake="value">x</div>',
          errors: [{ messageId: 'invalidProp' }],
        },
        {
          code: '<div aria-role="button">x</div>',
          errors: [{ messageId: 'invalidProp' }],
        },
      ],
    });
  });
});
