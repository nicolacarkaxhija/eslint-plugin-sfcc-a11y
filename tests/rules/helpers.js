/**
 * Shared test helpers for rule tests.
 * Uses ESLint's RuleTester with @html-eslint/parser.
 */

import { RuleTester } from 'eslint';
import * as htmlParser from '@html-eslint/parser';

export function createRuleTester() {
  return new RuleTester({
    languageOptions: { parser: htmlParser },
  });
}
