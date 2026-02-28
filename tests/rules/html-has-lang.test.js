import { describe, it } from 'vitest';
import { RuleTester } from 'eslint';
import * as htmlParser from '@html-eslint/parser';
import rule from '../../lib/rules/html-has-lang.js';

const ruleTester = new RuleTester({ languageOptions: { parser: htmlParser } });

describe('html-has-lang', () => {
  it('requires a non-empty lang attribute on <html>', () => {
    ruleTester.run('sfcc-a11y/html-has-lang', rule, {
      valid: [
        { code: '<html lang="en"><body></body></html>' },
        { code: '<html lang="fr-CA"><body></body></html>' },
        // Dynamic lang value — skip false positive
        { code: '<html lang="__ISML_EXPR__"><body></body></html>' },
        // Non-html elements are ignored
        { code: '<div></div>' },
      ],
      invalid: [
        {
          code: '<html><body></body></html>',
          errors: [{ messageId: 'missingLang' }],
        },
        {
          code: '<html lang=""><body></body></html>',
          errors: [{ messageId: 'emptyLang' }],
        },
      ],
    });
  });
});
