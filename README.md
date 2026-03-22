# eslint-plugin-sfcc-a11y

ESLint plugin for WCAG accessibility checks on Salesforce Commerce Cloud (SFCC) ISML templates and library XML content assets.

## Why this plugin?

SFCC projects use ISML (Internet Store Markup Language) — an HTML-like template language — and store rich HTML content in XML library files (Business Manager content assets). No existing ESLint plugin covers both of these formats.

`eslint-plugin-sfcc-a11y` fills that gap by bringing `jsx-a11y`-style WCAG Level A and AA checks to the SFCC world. Drop it into your existing ESLint configuration — no new CI step, no new IDE extension.

## Installation

```sh
npm install --save-dev eslint-plugin-sfcc-a11y @html-eslint/parser
```

**Peer dependencies:** `eslint >= 8`, `@html-eslint/parser >= 0.23`

## Setup

### ESLint v9 (flat config — `eslint.config.js`)

```js
import sfccA11y from 'eslint-plugin-sfcc-a11y';

export default [...sfccA11y.configs['flat/recommended']];
```

### ESLint v8 (legacy config — `.eslintrc.js`)

```js
module.exports = {
  plugins: ['sfcc-a11y'],
  extends: ['plugin:sfcc-a11y/recommended'],
};
```

The `recommended` config automatically:

- Applies `@html-eslint/parser` to `**/*.isml` files
- Applies the XML content-asset processor to `**/libraries/**/*.xml` files
- Sets all rules to `"warn"`

## Rules

All rules implement WCAG 2.2 success criteria at Level A or AA.

| Rule                                                                             | WCAG SC | Level | Description                                                          |
| -------------------------------------------------------------------------------- | ------- | ----- | -------------------------------------------------------------------- |
| [`img-alt`](docs/rules/img-alt.md)                                               | 1.1.1   | A     | `<img>` must have a non-empty `alt` attribute                        |
| [`object-alt`](docs/rules/object-alt.md)                                         | 1.1.1   | A     | `<object>` must have an accessible text alternative                  |
| [`media-has-caption`](docs/rules/media-has-caption.md)                           | 1.2.2   | A     | `<video>` must have a `<track kind="captions">` child                |
| [`label`](docs/rules/label.md)                                                   | 1.3.1   | A     | Form controls must have an associated label                          |
| [`scope-attr-valid`](docs/rules/scope-attr-valid.md)                             | 1.3.1   | A     | `scope` on `<th>` must be `col`, `row`, `colgroup`, or `rowgroup`    |
| [`autocomplete-valid`](docs/rules/autocomplete-valid.md)                         | 1.3.5   | AA    | `autocomplete` attribute must use valid tokens                       |
| [`interactive-supports-focus`](docs/rules/interactive-supports-focus.md)         | 2.1.1   | A     | Elements with interactive ARIA roles must be keyboard-focusable      |
| [`no-noninteractive-tabindex`](docs/rules/no-noninteractive-tabindex.md)         | 2.1.1   | A     | Disallow `tabindex >= 0` on non-interactive elements                 |
| [`no-access-key`](docs/rules/no-access-key.md)                                   | 2.1.4   | A     | Disallow `accesskey` attribute                                       |
| [`no-distracting-elements`](docs/rules/no-distracting-elements.md)               | 2.2.2   | A     | Forbid `<marquee>` and `<blink>`                                     |
| [`no-autofocus`](docs/rules/no-autofocus.md)                                     | 2.4.3   | A     | Disallow `autofocus` attribute                                       |
| [`tabindex-no-positive`](docs/rules/tabindex-no-positive.md)                     | 2.4.3   | AA    | `tabindex` must not be greater than 0                                |
| [`anchor-is-valid`](docs/rules/anchor-is-valid.md)                               | 2.4.4   | A     | `<a>` must have a navigating `href`                                  |
| [`link-name`](docs/rules/link-name.md)                                           | 2.4.4   | A     | `<a>` must have discernible text or `aria-label`                     |
| [`heading-has-content`](docs/rules/heading-has-content.md)                       | 2.4.6   | AA    | `<h1>`–`<h6>` must have non-empty content                            |
| [`html-has-lang`](docs/rules/html-has-lang.md)                                   | 3.1.1   | A     | `<html>` must have a non-empty `lang` attribute                      |
| [`lang-value`](docs/rules/lang-value.md)                                         | 3.1.1   | A     | `lang` attribute must contain a valid BCP 47 language tag            |
| [`aria-hidden-on-focusable`](docs/rules/aria-hidden-on-focusable.md)             | 4.1.2   | A     | Disallow `aria-hidden="true"` on focusable elements                  |
| [`aria-props`](docs/rules/aria-props.md)                                         | 4.1.2   | A     | `aria-*` attribute names must be valid ARIA properties               |
| [`aria-proptypes`](docs/rules/aria-proptypes.md)                                 | 4.1.2   | A     | `aria-*` values must match the expected type                         |
| [`aria-required-attr`](docs/rules/aria-required-attr.md)                         | 4.1.2   | A     | Required ARIA attributes for a role must be present                  |
| [`aria-role`](docs/rules/aria-role.md)                                           | 4.1.2   | A     | `role` value must be a valid, non-abstract ARIA role                 |
| [`button-name`](docs/rules/button-name.md)                                       | 4.1.2   | A     | `<button>` must have discernible text or `aria-label`                |
| [`no-redundant-role`](docs/rules/no-redundant-role.md)                           | 4.1.2   | AA    | Explicit `role` must not duplicate the element's implicit role       |
| [`role-supports-aria-props`](docs/rules/role-supports-aria-props.md)             | 4.1.2   | A     | `aria-*` attributes must be supported by the element's ARIA role     |

## ISML Support

ISML files contain syntax that is not valid HTML:

- `${expression}` inside attribute values: `alt="${image.alt}"`
- `<isif>`, `<isloop>`, `<isinclude>` and other `<is*>` tags
- `<isprint value="${expr}">` for inline text output

The plugin's built-in sanitizer handles all of these before parsing.

Dynamic attribute values (e.g. `alt="${image.alt}"`) are considered as non-empty, since what they eventually evaluate to can only be determined at runtime. To avoid false positives, the plugin ignores any attribute value containing a `${...}` expression.

### Known limitation — cross-file label/input association

The `label` rule can only match `<label for="x">` to `<input id="x">` within the same file, but SFCC projects often split labels and inputs across `<isinclude>` files. In that case, suppress the error with an inline comment:

```isml
<input type="email" id="email"> <%-- eslint-disable-next-line sfcc-a11y/label --%>
```

## XML Content Asset Support

SFCC content library XML files contain HTML inside CDATA sections:

```xml
<content-asset content-id="homepage-hero">
  <custom-attributes>
    <custom-attribute attribute-id="body"><![CDATA[
      <img src="hero.jpg" alt="">
    ]]></custom-attribute>
  </custom-attributes>
</content-asset>
```

The plugin's XML processor extracts CDATA blocks, lints the HTML inside them, and maps errors back to the correct line numbers in the original XML file.

Target pattern: `**/libraries/**/*.xml`

## Attribution

This plugin was inspired by the following open-source projects:

| Source                                                                           | What was referred                                                                   |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [`eslint-plugin-jsx-a11y`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y) | Rule names, WCAG SC mappings, dynamic-expression guard pattern, test case structure |
| [`@html-eslint/eslint-plugin`](https://github.com/yeonjuan/html-eslint)          | Parser integration patterns, processor structure                                    |
| [`aria-query`](https://github.com/A11yance/aria-query)                           | All ARIA role/property/type data — used as a runtime dependency                     |

No source code was copied. All rule implementations were written from scratch following the patterns documented in the above projects.

<!-- suggest the use of https://github.com/nicolacarkaxhija/sfcc-a11y -->
## sfcc-a11y
This plugin was developed as part of the [sfcc-a11y](https://github.com/nicolacarkaxhija/sfcc-a11y) project. sfcc-a11y is an open-source accessibility toolkit for Salesforce Commerce Cloud, including:
- `eslint-plugin-sfcc-a11y`: this ESLint plugin for ISML and XML linting
- `sfcc-a11y-cli`: a command-line interface for running accessibility checks on SFCC projects, including an option to run `eslint-plugin-sfcc-a11y` without needing to set up ESLint separately
- `sfcc-a11y-browser-extension`: a browser extension that surfaces accessibility issues directly in the storefront, using the same underlying rules as `eslint-plugin-sfcc-a11y`


## License

MIT
