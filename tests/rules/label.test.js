import { describe, it } from 'vitest';
import { RuleTester } from 'eslint';
import * as htmlParser from '@html-eslint/parser';
import rule from '../../lib/rules/label.js';

const ruleTester = new RuleTester({ languageOptions: { parser: htmlParser } });

describe('label', () => {
  it('requires form controls to have an accessible label', () => {
    ruleTester.run('sfcc-a11y/label', rule, {
      valid: [
        // for/id association
        { code: '<label for="email">Email</label><input type="email" id="email">' },
        // Wrapping label
        { code: '<label>Email<input type="email"></label>' },
        // aria-label
        { code: '<input type="text" aria-label="Search">' },
        // aria-labelledby (idref, cannot resolve — trust it)
        { code: '<input type="text" aria-labelledby="lbl">' },
        // Dynamic id — cannot validate association
        { code: '<input type="email" id="__ISML_EXPR__">' },
        // Dynamic aria-label
        { code: '<input type="text" aria-label="__ISML_EXPR__">' },
        // Hidden input — exempt
        { code: '<input type="hidden" name="csrf">' },
        // Submit / reset / button inputs — they label themselves
        { code: '<input type="submit" value="Submit">' },
        { code: '<input type="reset" value="Reset">' },
        { code: '<input type="button" value="Click">' },
        // Select with label
        {
          code: '<label for="country">Country</label><select id="country"><option>US</option></select>',
        },
        // Textarea with label
        { code: '<label for="bio">Bio</label><textarea id="bio"></textarea>' },
      ],
      invalid: [
        // Unlabeled text input
        {
          code: '<input type="text">',
          errors: [{ messageId: 'missingLabel' }],
        },
        // Email input without label
        {
          code: '<input type="email">',
          errors: [{ messageId: 'missingLabel' }],
        },
        // Unlabeled select
        {
          code: '<select><option>Choose</option></select>',
          errors: [{ messageId: 'missingLabel' }],
        },
        // Unlabeled textarea
        {
          code: '<textarea></textarea>',
          errors: [{ messageId: 'missingLabel' }],
        },
        // for/id mismatch — label exists but doesn't match
        {
          code: '<label for="wrong">Name</label><input type="text" id="name">',
          errors: [{ messageId: 'missingLabel' }],
        },
        // Wrapped in a non-label element — does not count as labelled
        // Also exercises: input with no type defaults to 'text' (the || 'text' branch)
        {
          code: '<div><input></div>',
          errors: [{ messageId: 'missingLabel' }],
        },
      ],
    });
  });
});
