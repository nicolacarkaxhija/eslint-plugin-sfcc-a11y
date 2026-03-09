import { describe, it } from 'vitest';
import { RuleTester } from 'eslint';
import * as htmlParser from '@html-eslint/parser';
import rule from '../../lib/rules/autocomplete-valid.js';

const ruleTester = new RuleTester({ languageOptions: { parser: htmlParser } });

describe('autocomplete-valid', () => {
  it('requires valid autocomplete tokens on form controls', () => {
    ruleTester.run('sfcc-a11y/autocomplete-valid', rule, {
      valid: [
        // Valid tokens
        { code: '<input autocomplete="email">' },
        { code: '<input autocomplete="given-name">' },
        { code: '<input autocomplete="on">' },
        { code: '<input autocomplete="off">' },
        { code: '<input autocomplete="new-password">' },
        { code: '<select autocomplete="country"></select>' },
        { code: '<textarea autocomplete="street-address"></textarea>' },
        { code: '<form autocomplete="off"></form>' },
        // With section prefix
        { code: '<input autocomplete="section-billing email">' },
        // With address group
        { code: '<input autocomplete="billing given-name">' },
        { code: '<input autocomplete="shipping postal-code">' },
        // With section + address group
        { code: '<input autocomplete="section-home billing email">' },
        // No autocomplete attribute — not checked
        { code: '<input>' },
        { code: '<input type="text">' },
        // Boolean autocomplete — skip
        { code: '<input autocomplete>' },
        // Dynamic autocomplete — skip
        { code: '<input autocomplete="__ISML_EXPR__">' },
        // Skipped input types
        { code: '<input type="hidden" autocomplete="invalidtoken">' },
        { code: '<input type="submit" autocomplete="invalidtoken">' },
        { code: '<input type="reset" autocomplete="invalidtoken">' },
        { code: '<input type="button" autocomplete="invalidtoken">' },
        { code: '<input type="image" autocomplete="invalidtoken">' },
        { code: '<input type="radio" autocomplete="invalidtoken">' },
        { code: '<input type="checkbox" autocomplete="invalidtoken">' },
        { code: '<input type="range" autocomplete="invalidtoken">' },
        { code: '<input type="color" autocomplete="invalidtoken">' },
        { code: '<input type="file" autocomplete="invalidtoken">' },
        // Non-form-control elements — ignored
        { code: '<div autocomplete="invalid"></div>' },
      ],
      invalid: [
        {
          code: '<input autocomplete="badtoken">',
          errors: [{ messageId: 'invalidAutocomplete' }],
        },
        {
          code: '<input autocomplete="firstname">',
          errors: [{ messageId: 'invalidAutocomplete' }],
        },
        {
          code: '<select autocomplete="notvalid"></select>',
          errors: [{ messageId: 'invalidAutocomplete' }],
        },
        {
          code: '<textarea autocomplete="notvalid"></textarea>',
          errors: [{ messageId: 'invalidAutocomplete' }],
        },
        // Valid token but extra garbage after
        {
          code: '<input autocomplete="email extra">',
          errors: [{ messageId: 'invalidAutocomplete' }],
        },
        // address group only — missing field token
        {
          code: '<input autocomplete="billing">',
          errors: [{ messageId: 'invalidAutocomplete' }],
        },
      ],
    });
  });
});
