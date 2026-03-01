import { describe, it } from 'vitest';
import { RuleTester } from 'eslint';
import * as htmlParser from '@html-eslint/parser';
import rule from '../../lib/rules/scope-attr-valid.js';

const ruleTester = new RuleTester({ languageOptions: { parser: htmlParser } });

describe('scope-attr-valid', () => {
  it('requires scope attribute on th to have a valid value', () => {
    ruleTester.run('sfcc-a11y/scope-attr-valid', rule, {
      valid: [
        // Valid scope values
        { code: '<table><tr><th scope="col">Name</th></tr></table>' },
        { code: '<table><tr><th scope="row">Name</th></tr></table>' },
        { code: '<table><tr><th scope="colgroup">Name</th></tr></table>' },
        { code: '<table><tr><th scope="rowgroup">Name</th></tr></table>' },
        // No scope attribute — valid (inferred from position)
        { code: '<table><tr><th>Name</th></tr></table>' },
        // Dynamic scope — cannot validate
        { code: '<table><tr><th scope="__ISML_EXPR__">Name</th></tr></table>' },
        // Non-th elements with scope are ignored
        { code: '<table><tr><td scope="col">data</td></tr></table>' },
        // Case-insensitive matching
        { code: '<table><tr><th scope="COL">Name</th></tr></table>' },
      ],
      invalid: [
        // Invalid scope value
        {
          code: '<table><tr><th scope="column">Name</th></tr></table>',
          errors: [{ messageId: 'invalidScope' }],
        },
        {
          code: '<table><tr><th scope="invalid">Name</th></tr></table>',
          errors: [{ messageId: 'invalidScope' }],
        },
        // Boolean scope (no value)
        {
          code: '<table><tr><th scope>Name</th></tr></table>',
          errors: [{ messageId: 'booleanScope' }],
        },
      ],
    });
  });
});
