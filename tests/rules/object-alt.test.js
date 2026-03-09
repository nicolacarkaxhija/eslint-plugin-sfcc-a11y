import { describe, it } from 'vitest';
import { RuleTester } from 'eslint';
import * as htmlParser from '@html-eslint/parser';
import rule from '../../lib/rules/object-alt.js';

const ruleTester = new RuleTester({ languageOptions: { parser: htmlParser } });

describe('object-alt', () => {
  it('requires an accessible text alternative on <object>', () => {
    ruleTester.run('sfcc-a11y/object-alt', rule, {
      valid: [
        // aria-label
        { code: '<object aria-label="Embedded PDF"></object>' },
        // aria-labelledby
        { code: '<object aria-labelledby="caption"></object>' },
        // title attribute
        { code: '<object title="Interactive chart"></object>' },
        // text content inside
        { code: '<object>A description of the embedded content</object>' },
        // dynamic title — skip
        { code: '<object title="__ISML_EXPR__"></object>' },
        // Non-object elements are ignored
        { code: '<div></div>' },
      ],
      invalid: [
        {
          code: '<object></object>',
          errors: [{ messageId: 'missingAlt' }],
        },
        {
          code: '<object title=""></object>',
          errors: [{ messageId: 'missingAlt' }],
        },
        {
          code: '<object title="   "></object>',
          errors: [{ messageId: 'missingAlt' }],
        },
      ],
    });
  });
});
