import { describe, it } from 'vitest';
import { RuleTester } from 'eslint';
import * as htmlParser from '@html-eslint/parser';
import rule from '../../lib/rules/no-noninteractive-tabindex.js';

const ruleTester = new RuleTester({ languageOptions: { parser: htmlParser } });

describe('no-noninteractive-tabindex', () => {
  it('disallows tabindex >= 0 on non-interactive elements', () => {
    ruleTester.run('sfcc-a11y/no-noninteractive-tabindex', rule, {
      valid: [
        // Natively focusable — ok
        { code: '<button tabindex="0">Click</button>' },
        { code: '<input tabindex="0">' },
        { code: '<a href="#" tabindex="0">Link</a>' },
        { code: '<select tabindex="0"><option>A</option></select>' },
        { code: '<textarea tabindex="0"></textarea>' },
        // tabindex="-1" on non-interactive — ok (programmatic focus)
        { code: '<div tabindex="-1">x</div>' },
        { code: '<article tabindex="-1">x</article>' },
        // Interactive role — ok
        { code: '<div role="button" tabindex="0">x</div>' },
        { code: '<div role="link" tabindex="0">x</div>' },
        // No tabindex — ok
        { code: '<div>x</div>' },
        // Dynamic tabindex — skip
        { code: '<div tabindex="__ISML_EXPR__">x</div>' },
        // Boolean tabindex — skip
        { code: '<div tabindex>x</div>' },
        // Dynamic role — skip
        { code: '<div role="__ISML_EXPR__" tabindex="0">x</div>' },
      ],
      invalid: [
        {
          code: '<div tabindex="0">x</div>',
          errors: [{ messageId: 'noninteractiveTabindex' }],
        },
        {
          code: '<article tabindex="0">x</article>',
          errors: [{ messageId: 'noninteractiveTabindex' }],
        },
        {
          code: '<div role="article" tabindex="0">x</div>',
          errors: [{ messageId: 'noninteractiveTabindex' }],
        },
        {
          code: '<span tabindex="1">x</span>',
          errors: [{ messageId: 'noninteractiveTabindex' }],
        },
      ],
    });
  });
});
