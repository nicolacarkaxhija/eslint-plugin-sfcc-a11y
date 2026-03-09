import { describe, it } from 'vitest';
import { RuleTester } from 'eslint';
import * as htmlParser from '@html-eslint/parser';
import rule from '../../lib/rules/lang-value.js';

const ruleTester = new RuleTester({ languageOptions: { parser: htmlParser } });

describe('lang-value', () => {
  it('requires a valid BCP 47 language tag on <html lang>', () => {
    ruleTester.run('sfcc-a11y/lang-value', rule, {
      valid: [
        { code: '<html lang="en"><body></body></html>' },
        { code: '<html lang="fr-CA"><body></body></html>' },
        { code: '<html lang="zh-Hans-CN"><body></body></html>' },
        // Dynamic value — skip
        { code: '<html lang="__ISML_EXPR__"><body></body></html>' },
        // Missing lang — handled by html-has-lang, not this rule
        { code: '<html><body></body></html>' },
        // Empty lang — handled by html-has-lang, not this rule
        { code: '<html lang=""><body></body></html>' },
        // Non-html elements are ignored
        { code: '<div lang="invalid value!"></div>' },
      ],
      invalid: [
        {
          code: '<html lang="not valid!"><body></body></html>',
          errors: [{ messageId: 'invalidLang' }],
        },
        {
          code: '<html lang="123"><body></body></html>',
          errors: [{ messageId: 'invalidLang' }],
        },
        {
          code: '<html lang="en-"><body></body></html>',
          errors: [{ messageId: 'invalidLang' }],
        },
      ],
    });
  });
});
