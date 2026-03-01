import { describe, it } from 'vitest';
import { RuleTester } from 'eslint';
import * as htmlParser from '@html-eslint/parser';
import rule from '../../lib/rules/no-redundant-role.js';

const ruleTester = new RuleTester({ languageOptions: { parser: htmlParser } });

describe('no-redundant-role', () => {
  it("flags explicit roles that duplicate the element's implicit role", () => {
    ruleTester.run('sfcc-a11y/no-redundant-role', rule, {
      valid: [
        // No role
        { code: '<nav>menu</nav>' },
        // Explicit role that overrides the implicit one
        { code: '<nav role="menubar">menu</nav>' },
        // Non-semantic element with role
        { code: '<div role="navigation">nav</div>' },
        // <div role="button"> is valid override — <div> has no implicit role
        { code: '<div role="button">click</div>' },
        // Dynamic role — skip
        { code: '<nav role="__ISML_EXPR__">nav</nav>' },
        // <a> without href has implicit role "generic", not "link"
        { code: '<a role="link">not a real link</a>' },
        // <input type="password"> has no clear implicit ARIA role — skip
        { code: '<input type="password" role="textbox">' },
        // <input type="file"> has no matching ARIA role — skip
        { code: '<input type="file" role="button">' },
      ],
      invalid: [
        {
          code: '<nav role="navigation">menu</nav>',
          errors: [{ messageId: 'redundantRole' }],
        },
        {
          code: '<button role="button">click</button>',
          errors: [{ messageId: 'redundantRole' }],
        },
        {
          code: '<main role="main">content</main>',
          errors: [{ messageId: 'redundantRole' }],
        },
        {
          code: '<ul role="list">items</ul>',
          errors: [{ messageId: 'redundantRole' }],
        },
        // <a href> has implicit role "link" — role="link" is redundant
        {
          code: '<a href="/home" role="link">Home</a>',
          errors: [{ messageId: 'redundantRole' }],
        },
        // <input type="checkbox"> implicit role is "checkbox"
        {
          code: '<input type="checkbox" role="checkbox">',
          errors: [{ messageId: 'redundantRole' }],
        },
        // <input type="text"> (explicit) implicit role is "textbox"
        {
          code: '<input type="text" role="textbox">',
          errors: [{ messageId: 'redundantRole' }],
        },
        // <input> with no type defaults to type="text" → role "textbox"
        {
          code: '<input role="textbox">',
          errors: [{ messageId: 'redundantRole' }],
        },
        // <input type="submit"> implicit role is "button"
        {
          code: '<input type="submit" role="button">',
          errors: [{ messageId: 'redundantRole' }],
        },
        // <input type="image"> implicit role is "button"
        {
          code: '<input type="image" role="button" alt="Go" src="btn.png">',
          errors: [{ messageId: 'redundantRole' }],
        },
        // <input type="range"> implicit role is "slider"
        {
          code: '<input type="range" role="slider">',
          errors: [{ messageId: 'redundantRole' }],
        },
      ],
    });
  });
});
