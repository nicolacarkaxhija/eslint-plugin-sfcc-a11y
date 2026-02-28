import { describe, it } from 'vitest';
import { RuleTester } from 'eslint';
import * as htmlParser from '@html-eslint/parser';
import rule from '../../lib/rules/img-alt.js';

const ruleTester = new RuleTester({ languageOptions: { parser: htmlParser } });

describe('img-alt', () => {
  it('requires meaningful or explicitly decorative alt attributes', () => {
    ruleTester.run('sfcc-a11y/img-alt', rule, {
      valid: [
        // Non-img container elements are ignored by this rule
        { code: '<figure><img alt="product" src="x.jpg"></figure>' },
        // Meaningful alt
        { code: '<img alt="product photo" src="x.jpg">' },
        // Dynamic alt — cannot validate
        { code: '<img alt="__ISML_EXPR__" src="x.jpg">' },
        // Explicitly decorative: empty alt + role="presentation"
        { code: '<img alt="" role="presentation" src="x.jpg">' },
        // Explicitly decorative: empty alt + aria-hidden
        { code: '<img alt="" aria-hidden="true" src="x.jpg">' },
        // aria-label as accessible name fallback
        { code: '<img aria-label="logo" src="logo.png">' },
        // role="none" is also a valid decorative marker
        { code: '<img alt="" role="none" src="x.jpg">' },
        // input type="image" with meaningful alt
        { code: '<input type="image" alt="Submit order" src="btn.png">' },
        // input type="image" with aria-label
        { code: '<input type="image" aria-label="Submit" src="btn.png">' },
        // aria-labelledby as accessible name for both img and input type=image
        { code: '<img aria-labelledby="caption" src="x.jpg">' },
        { code: '<input type="image" aria-labelledby="lbl" src="btn.png">' },
        // input type="image" with dynamic alt
        { code: '<input type="image" alt="__ISML_EXPR__" src="btn.png">' },
        // non-image input types are ignored
        { code: '<input type="text">' },
        { code: '<input type="submit" value="Go">' },
      ],
      invalid: [
        // Boolean aria-label (no value) is not an accessible name — alt still required
        {
          code: '<img aria-label src="x.jpg">',
          errors: [{ messageId: 'missingAlt' }],
        },
        // No alt at all
        {
          code: '<img src="x.jpg">',
          errors: [{ messageId: 'missingAlt' }],
        },
        // Empty alt without presentation role or aria-hidden
        {
          code: '<img alt="" src="x.jpg">',
          errors: [{ messageId: 'decorativeAlt' }],
        },
        // Whitespace-only alt
        {
          code: '<img alt="   " src="x.jpg">',
          errors: [{ messageId: 'decorativeAlt' }],
        },
        // input type="image" with no alt
        {
          code: '<input type="image" src="btn.png">',
          errors: [{ messageId: 'missingInputAlt' }],
        },
        // input type="image" with empty alt — button has no accessible name
        {
          code: '<input type="image" alt="" src="btn.png">',
          errors: [{ messageId: 'missingInputAlt' }],
        },
        // input type="image" with boolean alt (no value)
        {
          code: '<input type="image" alt src="btn.png">',
          errors: [{ messageId: 'missingInputAlt' }],
        },
      ],
    });
  });
});
