import { describe, it } from 'vitest';
import { RuleTester } from 'eslint';
import * as htmlParser from '@html-eslint/parser';
import rule from '../../lib/rules/aria-proptypes.js';

const ruleTester = new RuleTester({ languageOptions: { parser: htmlParser } });

describe('aria-proptypes', () => {
  it('requires aria-* attribute values to match their expected type', () => {
    ruleTester.run('sfcc-a11y/aria-proptypes', rule, {
      valid: [
        // boolean
        { code: '<div aria-hidden="true">x</div>' },
        { code: '<div aria-hidden="false">x</div>' },
        // tristate (boolean + "mixed")
        { code: '<input aria-checked="true">' },
        { code: '<input aria-checked="false">' },
        { code: '<input aria-checked="mixed">' },
        // token
        { code: '<div aria-sort="ascending">col</div>' },
        { code: '<th aria-sort="none">col</th>' },
        // aria-haspopup: aria-query stores boolean primitives (true/false) as valid token values
        { code: '<button aria-haspopup="true">menu</button>' },
        { code: '<button aria-haspopup="false">menu</button>' },
        { code: '<button aria-haspopup="menu">menu</button>' },
        // tokenlist
        { code: '<div aria-dropeffect="copy move">x</div>' },
        { code: '<div aria-dropeffect="none">x</div>' },
        // string / id / idlist — any value is valid
        { code: '<div aria-label="description">x</div>' },
        { code: '<div aria-controls="listbox-1">x</div>' },
        // integer
        { code: '<table aria-colcount="3">x</table>' },
        // number
        { code: '<div role="slider" aria-valuemax="100">x</div>' },
        // Dynamic — skip
        { code: '<div aria-hidden="__ISML_EXPR__">x</div>' },
        // Boolean attribute (no value) on aria prop — skip
        { code: '<div aria-hidden>x</div>' },
        // Unknown prop — handled by aria-props rule, not this one
        { code: '<div aria-fake="true">x</div>' },
      ],
      invalid: [
        // boolean with invalid value
        {
          code: '<div aria-hidden="yes">x</div>',
          errors: [{ messageId: 'invalidType' }],
        },
        {
          code: '<input aria-required="1">',
          errors: [{ messageId: 'invalidType' }],
        },
        // tristate with invalid value
        {
          code: '<input aria-checked="maybe">',
          errors: [{ messageId: 'invalidType' }],
        },
        // token with invalid value
        {
          code: '<div aria-sort="diagonal">col</div>',
          errors: [{ messageId: 'invalidType' }],
        },
        // tokenlist with invalid value
        {
          code: '<div aria-dropeffect="fly">x</div>',
          errors: [{ messageId: 'invalidType' }],
        },
        // integer with non-integer
        {
          code: '<table aria-colcount="3.5">x</table>',
          errors: [{ messageId: 'invalidType' }],
        },
      ],
    });
  });
});
