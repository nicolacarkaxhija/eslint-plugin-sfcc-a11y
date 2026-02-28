import { describe, it } from 'vitest';
import { RuleTester } from 'eslint';
import * as htmlParser from '@html-eslint/parser';
import rule from '../../lib/rules/button-name.js';

const ruleTester = new RuleTester({ languageOptions: { parser: htmlParser } });

describe('button-name', () => {
  it('requires buttons to have a discernible accessible name', () => {
    ruleTester.run('sfcc-a11y/button-name', rule, {
      valid: [
        { code: '<button>Submit</button>' },
        { code: '<button aria-label="Close dialog">×</button>' },
        { code: '<button aria-labelledby="btn-label">x</button>' },
        // Icon button with nested text
        { code: '<button><span class="icon"></span><span class="sr-only">Search</span></button>' },
        // Dynamic content via isprint sentinel
        { code: '<button>__ISML_CONTENT__</button>' },
        // aria-hidden button is invisible to AT — exempt
        { code: '<button aria-hidden="true"></button>' },
        // Dynamic aria-label
        { code: '<button aria-label="__ISML_EXPR__">x</button>' },
      ],
      invalid: [
        {
          code: '<button></button>',
          errors: [{ messageId: 'missingName' }],
        },
        {
          code: '<button>   </button>',
          errors: [{ messageId: 'missingName' }],
        },
        {
          code: '<button><span></span></button>',
          errors: [{ messageId: 'missingName' }],
        },
      ],
    });
  });
});
