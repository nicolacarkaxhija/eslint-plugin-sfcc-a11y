import { describe, it } from 'vitest';
import { RuleTester } from 'eslint';
import * as htmlParser from '@html-eslint/parser';
import rule from '../../lib/rules/media-has-caption.js';

const ruleTester = new RuleTester({ languageOptions: { parser: htmlParser } });

describe('media-has-caption', () => {
  it('requires video elements to have a track with kind="captions"', () => {
    ruleTester.run('sfcc-a11y/media-has-caption', rule, {
      valid: [
        // Video with captions track
        { code: '<video><track kind="captions" src="en.vtt"><source src="v.mp4"></video>' },
        // Muted video — no captions needed
        { code: '<video muted><source src="v.mp4"></video>' },
        // Muted with explicit value
        { code: '<video muted="muted"><source src="v.mp4"></video>' },
        // Non-video elements are ignored
        { code: '<audio><source src="a.mp3"></audio>' },
        { code: '<img src="x.jpg" alt="photo">' },
        // Dynamic kind — treat as potentially valid
        { code: '<video><track kind="__ISML_EXPR__" src="en.vtt"></video>' },
      ],
      invalid: [
        // Video with no children at all
        {
          code: '<video src="v.mp4"></video>',
          errors: [{ messageId: 'missingCaptions' }],
        },
        // Video with track of wrong kind
        {
          code: '<video><track kind="subtitles" src="en.vtt"><source src="v.mp4"></video>',
          errors: [{ messageId: 'missingCaptions' }],
        },
        // Video with track but no kind attribute
        {
          code: '<video><track src="en.vtt"><source src="v.mp4"></video>',
          errors: [{ messageId: 'missingCaptions' }],
        },
        // Video with only description track
        {
          code: '<video><track kind="descriptions" src="en.vtt"></video>',
          errors: [{ messageId: 'missingCaptions' }],
        },
      ],
    });
  });
});
