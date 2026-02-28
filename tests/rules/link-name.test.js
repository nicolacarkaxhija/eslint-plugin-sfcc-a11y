import { describe, it } from 'vitest';
import { RuleTester } from 'eslint';
import * as htmlParser from '@html-eslint/parser';
import rule from '../../lib/rules/link-name.js';

const ruleTester = new RuleTester({ languageOptions: { parser: htmlParser } });

describe('link-name', () => {
  it('requires links to have a discernible accessible name', () => {
    ruleTester.run('sfcc-a11y/link-name', rule, {
      valid: [
        { code: '<a href="/home">Home</a>' },
        { code: '<a href="/about" aria-label="About us">About</a>' },
        { code: '<a href="/contact" aria-labelledby="lbl">Contact</a>' },
        // Icon link with screen-reader text
        {
          code: '<a href="/"><span aria-hidden="true">★</span><span class="sr-only">Home</span></a>',
        },
        // Dynamic content
        { code: '<a href="__ISML_EXPR__">__ISML_CONTENT__</a>' },
        // aria-hidden link — exempt
        { code: '<a href="/" aria-hidden="true"></a>' },
        // Dynamic aria-label
        { code: '<a href="/" aria-label="__ISML_EXPR__">x</a>' },
        // <area> without href is not a link — no name required
        { code: '<area shape="default">' },
        // <area href> with meaningful alt
        { code: '<area href="/home" alt="Home">' },
        // <area href> with aria-label
        { code: '<area href="/home" aria-label="Home section">' },
        // <area href> with aria-hidden — exempt
        { code: '<area href="/home" aria-hidden="true">' },
        // <area href> with dynamic alt
        { code: '<area href="/home" alt="__ISML_EXPR__">' },
      ],
      invalid: [
        {
          code: '<a href="/home"></a>',
          errors: [{ messageId: 'missingName' }],
        },
        {
          code: '<a href="/home">   </a>',
          errors: [{ messageId: 'missingName' }],
        },
        {
          code: '<a href="/"><img src="logo.png"></a>',
          errors: [{ messageId: 'missingName' }],
        },
        // <area href> with no alt
        {
          code: '<area href="/home">',
          errors: [{ messageId: 'missingAreaName' }],
        },
        // <area href> with empty alt and no aria-label
        {
          code: '<area href="/home" alt="">',
          errors: [{ messageId: 'missingAreaName' }],
        },
      ],
    });
  });
});
