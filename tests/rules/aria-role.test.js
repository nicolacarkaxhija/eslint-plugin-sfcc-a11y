import { describe, it } from 'vitest';
import { RuleTester } from 'eslint';
import * as htmlParser from '@html-eslint/parser';
import rule from '../../lib/rules/aria-role.js';

const ruleTester = new RuleTester({ languageOptions: { parser: htmlParser } });

describe('aria-role', () => {
  it('requires role values to be valid non-abstract ARIA roles', () => {
    ruleTester.run('sfcc-a11y/aria-role', rule, {
      valid: [
        { code: '<div role="button">click</div>' },
        { code: '<div role="navigation">nav</div>' },
        { code: '<div role="alert">message</div>' },
        { code: '<div role="dialog">modal</div>' },
        // Multiple valid roles — loop iterates all of them
        { code: '<div role="menuitem">item</div>' },
        { code: '<div role="button navigation">x</div>' },
        // Boolean role attribute (no value) — skip
        { code: '<div role>x</div>' },
        // No role — valid
        { code: '<div>content</div>' },
        // Dynamic role
        { code: '<div role="__ISML_EXPR__">x</div>' },
      ],
      invalid: [
        {
          code: '<div role="fake-role">x</div>',
          errors: [{ messageId: 'invalidRole' }],
        },
        {
          code: '<div role="widget">x</div>',
          errors: [{ messageId: 'abstractRole' }],
        },
        {
          code: '<div role="">x</div>',
          errors: [{ messageId: 'emptyRole' }],
        },
      ],
    });
  });
});
