import { describe, it } from 'vitest';
import { RuleTester } from 'eslint';
import * as htmlParser from '@html-eslint/parser';
import rule from '../../lib/rules/heading-has-content.js';

const ruleTester = new RuleTester({ languageOptions: { parser: htmlParser } });

describe('heading-has-content', () => {
  it('requires headings to have non-empty content', () => {
    ruleTester.run('sfcc-a11y/heading-has-content', rule, {
      valid: [
        { code: '<h1>Page title</h1>' },
        { code: '<h2><span>Nested text</span></h2>' },
        { code: '<h3>Title <em>with emphasis</em></h3>' },
        // Dynamic content via <isprint> sentinel
        { code: '<h1>__ISML_CONTENT__</h1>' },
        // aria-hidden headings are exempt (they are invisible to AT)
        { code: '<h1 aria-hidden="true"></h1>' },
        // All heading levels
        { code: '<h4>Level 4</h4>' },
        { code: '<h5>Level 5</h5>' },
        { code: '<h6>Level 6</h6>' },
      ],
      invalid: [
        {
          code: '<h1></h1>',
          errors: [{ messageId: 'emptyHeading' }],
        },
        {
          code: '<h2>   </h2>',
          errors: [{ messageId: 'emptyHeading' }],
        },
        {
          code: '<h3><span></span></h3>',
          errors: [{ messageId: 'emptyHeading' }],
        },
      ],
    });
  });
});
