/**
 * ISML-specific helpers for accessibility rules.
 *
 * The ISML sanitizer replaces dynamic constructs with sentinel values before
 * the HTML parser runs. Rules use these helpers to recognise sentinels and
 * avoid false positives on dynamic template code.
 */

/** Sentinel injected by the sanitizer in place of ${...} expressions. */
const EXPR_SENTINEL = '__ISML_EXPR__';

/** Sentinel injected by the sanitizer in place of <isprint> tags. */
const CONTENT_SENTINEL = '__ISML_CONTENT__';

/**
 * Returns true when an attribute value was originally a dynamic ISML expression
 * (e.g. alt="${image.alt}") and should not be validated as a static string.
 * @param {string | null | undefined} value
 * @returns {boolean}
 */
function isDynamic(value) {
  return typeof value === 'string' && value.includes(EXPR_SENTINEL);
}

module.exports = {
  isDynamic,
  EXPR_SENTINEL,
  CONTENT_SENTINEL,
};
