import { describe, it } from 'vitest';
import { RuleTester } from 'eslint';
import * as htmlParser from '@html-eslint/parser';
import rule from '../../lib/rules/no-autofocus.js';

const ruleTester = new RuleTester({ languageOptions: { parser: htmlParser } });

describe('no-autofocus', () => {
  it('disallows the autofocus attribute', () => {
    ruleTester.run('sfcc-a11y/no-autofocus', rule, {
      valid: [
        { code: '<input type="text" name="query">' },
        { code: '<button>Submit</button>' },
        { code: '<textarea name="bio"></textarea>' },
        { code: '<select name="color"><option>Red</option></select>' },
      ],
      invalid: [
        {
          code: '<input type="text" autofocus>',
          errors: [{ messageId: 'noAutofocus' }],
        },
        {
          code: '<button autofocus>Submit</button>',
          errors: [{ messageId: 'noAutofocus' }],
        },
        {
          code: '<textarea autofocus></textarea>',
          errors: [{ messageId: 'noAutofocus' }],
        },
        // autofocus with explicit value
        {
          code: '<input type="text" autofocus="autofocus">',
          errors: [{ messageId: 'noAutofocus' }],
        },
      ],
    });
  });
});
