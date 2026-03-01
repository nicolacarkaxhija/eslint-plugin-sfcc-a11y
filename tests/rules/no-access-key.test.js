import { describe, it } from 'vitest';
import { RuleTester } from 'eslint';
import * as htmlParser from '@html-eslint/parser';
import rule from '../../lib/rules/no-access-key.js';

const ruleTester = new RuleTester({ languageOptions: { parser: htmlParser } });

describe('no-access-key', () => {
  it('disallows the accesskey attribute', () => {
    ruleTester.run('sfcc-a11y/no-access-key', rule, {
      valid: [
        { code: '<button>Click me</button>' },
        { code: '<a href="/home">Home</a>' },
        { code: '<input type="text" name="query">' },
        { code: '<div class="nav">Navigation</div>' },
      ],
      invalid: [
        {
          code: '<button accesskey="s">Save</button>',
          errors: [{ messageId: 'noAccessKey' }],
        },
        {
          code: '<a href="/home" accesskey="h">Home</a>',
          errors: [{ messageId: 'noAccessKey' }],
        },
        {
          code: '<input type="text" accesskey="q">',
          errors: [{ messageId: 'noAccessKey' }],
        },
        // Boolean accesskey (no value)
        {
          code: '<div accesskey>content</div>',
          errors: [{ messageId: 'noAccessKey' }],
        },
      ],
    });
  });
});
