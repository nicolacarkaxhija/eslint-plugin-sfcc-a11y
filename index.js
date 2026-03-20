/**
 * eslint-plugin-sfcc-a11y
 *
 * ESLint plugin for WCAG accessibility checks on SFCC ISML templates and
 * library XML content assets.
 *
 * Supports ESLint v8 (legacy .eslintrc config) and ESLint v9 (flat config).
 *
 * Usage — ESLint v9 flat config (eslint.config.js):
 *   import sfccA11y from 'eslint-plugin-sfcc-a11y';
 *   export default [...sfccA11y.configs['flat/recommended']];
 *
 * Usage — ESLint v8 legacy config (.eslintrc.js):
 *   module.exports = { extends: ['plugin:sfcc-a11y/recommended'] };
 */

const htmlParser = require('@html-eslint/parser');
const xmlProcessor = require('./lib/processors/xml-content-asset.js');
const { sanitize } = require('./lib/preprocessors/isml-sanitizer.js');

const ismlSanitizerProcessor = {
  meta: { name: 'sfcc-a11y/isml-sanitizer', version: '0.1.0' },
  preprocess(text, filename) {
    return [{ text: sanitize(text), filename: filename + '/__sanitized.html' }];
  },
  postprocess(messages) {
    return messages[0];
  },
  supportsAutofix: false,
};

const rules = {
  'img-alt': require('./lib/rules/img-alt.js'),
  label: require('./lib/rules/label.js'),
  'html-has-lang': require('./lib/rules/html-has-lang.js'),
  'link-name': require('./lib/rules/link-name.js'),
  'button-name': require('./lib/rules/button-name.js'),
  'heading-has-content': require('./lib/rules/heading-has-content.js'),
  'anchor-is-valid': require('./lib/rules/anchor-is-valid.js'),
  'no-distracting-elements': require('./lib/rules/no-distracting-elements.js'),
  'tabindex-no-positive': require('./lib/rules/tabindex-no-positive.js'),
  'aria-role': require('./lib/rules/aria-role.js'),
  'aria-props': require('./lib/rules/aria-props.js'),
  'aria-required-attr': require('./lib/rules/aria-required-attr.js'),
  'aria-proptypes': require('./lib/rules/aria-proptypes.js'),
  'no-redundant-role': require('./lib/rules/no-redundant-role.js'),
  'interactive-supports-focus': require('./lib/rules/interactive-supports-focus.js'),
  'media-has-caption': require('./lib/rules/media-has-caption.js'),
  'no-access-key': require('./lib/rules/no-access-key.js'),
  'no-autofocus': require('./lib/rules/no-autofocus.js'),
  'scope-attr-valid': require('./lib/rules/scope-attr-valid.js'),
  'lang-value': require('./lib/rules/lang-value.js'),
  'object-alt': require('./lib/rules/object-alt.js'),
  'aria-hidden-on-focusable': require('./lib/rules/aria-hidden-on-focusable.js'),
  'no-noninteractive-tabindex': require('./lib/rules/no-noninteractive-tabindex.js'),
  'autocomplete-valid': require('./lib/rules/autocomplete-valid.js'),
  'role-supports-aria-props': require('./lib/rules/role-supports-aria-props.js'),
};

/** All recommended rules set to "warn". */
const recommendedRules = Object.fromEntries(
  Object.keys(rules).map((name) => [`sfcc-a11y/${name}`, 'warn']),
);

const plugin = {
  rules,
  processors: {
    '.xml': xmlProcessor,
    'isml-sanitizer': ismlSanitizerProcessor,
  },

  // ─── ESLint v8 legacy config ────────────────────────────────────────────────
  // Virtual file names produced by preprocess() are matched against overrides.
  // ISML sanitizer → '<file>.isml/__sanitized.html'
  // XML processor  → '<file>.xml/block_N.html'
  configs: {
    recommended: {
      plugins: ['sfcc-a11y'],
      overrides: [
        // 1. Apply ISML sanitizer (replaces ${...} with __ISML_EXPR__ before parse)
        { files: ['**/*.isml'], processor: 'sfcc-a11y/isml-sanitizer' },
        // 2. Parse sanitized virtual file with accessibility rules
        { files: ['**/*.isml/__sanitized.html'], parser: '@html-eslint/parser', rules: recommendedRules },
        // 3. Extract HTML blocks from XML content assets
        { files: ['**/libraries/**/*.xml'], processor: 'sfcc-a11y/.xml' },
        // 4. Apply rules to extracted HTML blocks
        { files: ['**/libraries/**/*.xml/block_*.html'], parser: '@html-eslint/parser', rules: recommendedRules },
      ],
    },
  },
};

// ─── ESLint v9 flat config ─────────────────────────────────────────────────
plugin.configs['flat/recommended'] = [
  // 1. Apply ISML sanitizer
  { files: ['**/*.isml'], plugins: { 'sfcc-a11y': plugin }, processor: ismlSanitizerProcessor },
  // 2. Parse sanitized virtual file with rules
  { files: ['**/*.isml/__sanitized.html'], plugins: { 'sfcc-a11y': plugin }, languageOptions: { parser: htmlParser }, rules: recommendedRules },
  // 3. Extract HTML blocks from XML content assets
  { files: ['**/libraries/**/*.xml'], plugins: { 'sfcc-a11y': plugin }, processor: xmlProcessor },
  // 4. Apply rules to extracted HTML blocks
  { files: ['**/libraries/**/*.xml/block_*.html'], plugins: { 'sfcc-a11y': plugin }, languageOptions: { parser: htmlParser }, rules: recommendedRules },
];

module.exports = plugin;
