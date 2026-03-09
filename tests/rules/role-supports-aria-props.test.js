import { describe, it } from 'vitest';
import { RuleTester } from 'eslint';
import * as htmlParser from '@html-eslint/parser';
import rule from '../../lib/rules/role-supports-aria-props.js';

const ruleTester = new RuleTester({ languageOptions: { parser: htmlParser } });

describe('role-supports-aria-props', () => {
  it('requires aria-* attributes to be supported by the element ARIA role', () => {
    ruleTester.run('sfcc-a11y/role-supports-aria-props', rule, {
      valid: [
        // aria-label is a global prop — supported by all roles
        { code: '<div role="button" aria-label="Close">x</div>' },
        { code: '<div role="checkbox" aria-checked="true">x</div>' },
        { code: '<div role="slider" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">x</div>' },
        // No role — not checked
        { code: '<div aria-label="test">x</div>' },
        // Dynamic role — skip
        { code: '<div role="__ISML_EXPR__" aria-checked="true">x</div>' },
        // Invalid role — skip (handled by aria-role rule)
        { code: '<div role="notarole" aria-checked="true">x</div>' },
        // Dynamic aria value on unsupported prop — skip (cannot validate)
        { code: '<div role="button" aria-checked="__ISML_EXPR__">x</div>' },
        // No aria attrs — ok
        { code: '<div role="button">Click</div>' },
      ],
      invalid: [
        // aria-checked is not supported by role="button"
        {
          code: '<div role="button" aria-checked="true">x</div>',
          errors: [{ messageId: 'unsupportedProp' }],
        },
        // aria-selected is not supported by role="textbox"
        {
          code: '<input role="textbox" aria-selected="true">',
          errors: [{ messageId: 'unsupportedProp' }],
        },
        // aria-level is not supported by role="button"
        {
          code: '<div role="button" aria-level="1">x</div>',
          errors: [{ messageId: 'unsupportedProp' }],
        },
      ],
    });
  });
});
