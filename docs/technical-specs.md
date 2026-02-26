# Technical Specifications — eslint-plugin-sfcc-a11y

## Architecture Overview

```
eslint-plugin-sfcc-a11y
├── index.js                          Plugin entry point — exports rules, configs
├── lib/
│   ├── preprocessors/
│   │   └── isml-sanitizer.js         ISML → HTML transform (runs before parsing)
│   ├── processors/
│   │   └── xml-content-asset.js      XML → HTML block extractor (ESLint processor)
│   ├── rules/                        15 accessibility rules
│   │   ├── img-alt.js
│   │   ├── label.js
│   │   └── ...
│   └── utils/
│       ├── aria.js                   ARIA role/property helpers (wraps aria-query)
│       ├── dom.js                    AST traversal helpers
│       └── isml.js                   ISML sentinel value constants
└── tests/
    ├── processors/
    ├── preprocessors/
    ├── rules/
    └── utils/
```

## Plugin Entry Point (`index.js`)

Exports a standard ESLint plugin object:

```js
{
  meta: { name, version },
  rules: { 'img-alt': rule, 'label': rule, ... },
  configs: {
    recommended: { ... },         // ESLint v8 legacy config
    'flat/recommended': [ ... ],  // ESLint v9 flat config array
  }
}
```

### Flat config (`flat/recommended`)

An array of three config objects:

1. **ISML config** — applies `@html-eslint/parser` + all rules to `**/*.isml`
2. **XML config** — applies the XML content-asset processor to `**/libraries/**/*.xml`
3. **Rule config** — sets all 15 rules to `"warn"`

### Legacy config (`recommended`)

Standard ESLint v8 config object using `overrides` to apply the parser and processor to the correct file globs.

## ISML Sanitizer (`lib/preprocessors/isml-sanitizer.js`)

The sanitizer runs as a custom preprocessor (not an ESLint `Processor`) — it is called directly in the plugin's ISML flat config entry via `languageOptions.parser` wrapping. The exported `sanitize(text)` function transforms ISML to valid HTML in the following steps:

### Step 1 — Strip ISML comments
```
<%-- comment --%>  →  (removed)
```

### Step 2 — Replace `<isprint>` with sentinel
```
<isprint value="${expr}">  →  __ISML_CONTENT__
```
Prevents false positives: `<a><isprint value="${linkText}"></a>` would otherwise appear as an empty link.

### Step 3 — Replace content-generating ISML tags
```
<ispicture ...>      →  __ISML_CONTENT__
<iscontentasset ...> →  __ISML_CONTENT__
```

### Step 4 — Strip structural ISML tags
```
<isif condition="${x}">   →  (tag removed, content preserved)
<iselse>                  →  (removed)
<iselseif condition="..."> →  (removed)
<isloop ...>              →  (tag removed, content preserved)
<isinclude ...>           →  (removed — no content)
<isscript>...</isscript>  →  (removed including content)
<iscomment>...</iscomment> →  (removed including content)
```

### Step 5 — Replace `${expr}` in attribute values
```
alt="${image.alt}"  →  alt="__ISML_EXPR__"
```
Done via regex on attribute values after structural tags are removed. The sentinel `__ISML_EXPR__` is non-empty, so rules that check for missing attribute values treat it as valid.

### Step 6 — Replace `{{expr}}` (Mustache/Handlebars)
```
alt="{{image.alt}}"     →  alt="__ISML_EXPR__"    (in attribute position)
{{#each items}}...{{/each}} →  spaces              (block helpers)
{{expr}}                →  __ISML_CONTENT__         (in text position)
```

### Sentinel constants (`lib/utils/isml.js`)

```js
export const EXPR_SENTINEL    = '__ISML_EXPR__';
export const CONTENT_SENTINEL = '__ISML_CONTENT__';
```

Rules use `isDynamic(value)` to check if an attribute value is a sentinel (treats it as non-empty).

## XML Content-Asset Processor (`lib/processors/xml-content-asset.js`)

Implements the ESLint `Processor` interface.

### `preprocess(text, filename)`

Scans the XML source for `<custom-attribute attribute-id="body">` elements using:

```js
const BODY_ATTR_REGEX = /<custom-attribute\s+[^>]*attribute-id="body"[^>]*>([\s\S]*?)<\/custom-attribute>/g;
```

The regex matches both attribute orders:
- `attribute-id="body"` only
- `xml:lang="en-DE" attribute-id="body"` (Business Manager export order)

For each match, it branches on the content format:

**CDATA format:**
```js
const CDATA_INNER_REGEX = /<!\[CDATA\[([\s\S]*?)\]\]>/;
const cdataOffset = match.index + match[0].indexOf('<![CDATA[');
htmlContent = cdataMatch[1];
startLine = lineOf(text, cdataOffset);
```

**Entity-encoded format:**
```js
htmlContent = decodeXmlEntities(rawContent);
startLine = lineOf(text, match.index);   // line of the <custom-attribute> tag
```

Each block is stored as `{ startLine, virtualBlock: { text, filename } }` in a `Map<filename, blocks[]>`.

Returns the array of virtual blocks for ESLint to lint.

### `decodeXmlEntities(str)`

Decodes in order (important: `&amp;` last to avoid double-decoding):
1. `&#xHH;` — hex numeric character references
2. `&#NN;` — decimal numeric character references
3. `&lt;` → `<`
4. `&gt;` → `>`
5. `&quot;` → `"`
6. `&apos;` → `'`
7. `&amp;` → `&`

### `postprocess(messages, filename)`

ESLint calls `postprocess([[msg, ...], [msg, ...]], filename)` with one inner array per virtual block.

For each block `i`, retrieves `blocks[i].startLine` and adds `(startLine - 1)` to each message's `line` and `endLine`.

`lineOf(text, offset)` counts newlines in `text.slice(0, offset)` and returns `1 + count`.

### Line offset correctness (entity-encoded)

Business Manager XML exports wrap each HTML value with `&#13;\n` (CRLF), producing decoded content that starts with `\r\n`. This means:
- Block line 1 = `\r` (carriage return only — blank)
- Block line 2 = first actual HTML tag

The `<custom-attribute>` tag is on XML source line N. `startLine = N`, so block line 1 maps to XML line N, and block line 2 maps to XML line N + 1 — exactly where the first HTML tag appears in the source XML. ✓

## AST Structure (`@html-eslint/parser`)

Rules use ESLint's node selectors on the HTML AST produced by `@html-eslint/parser`.

### Key node types

| Selector | Properties |
|----------|-----------|
| `Tag` | `.name` (string), `.attributes` (Attribute[]), `.children` (Node[]) |
| `Attribute` | `.key.value` (string), `.value` (ValueNode \| undefined) |
| `Text` | `.value` (string) |

### Boolean attributes

When an attribute has no value (e.g. `<input disabled>`), the parser sets `.value` to `undefined`. The `getAttr(node, name)` utility returns `true` for boolean attributes.

### `getAttr(node, attrName)`

```js
// Returns: attribute string value | true (boolean attr) | null (not present)
function getAttr(node, attrName) {
  const attr = node.attributes.find(
    (a) => a.key?.value?.toLowerCase() === attrName
  );
  if (!attr) return null;
  return attr.value ? attr.value.value : true;
}
```

### `getTextContent(node)`

Recursively collects text from `Text` nodes in the subtree. Returns concatenated string. Skips non-Text nodes (tags, comments). Used by `link-name`, `button-name`, `heading-has-content`, `label`.

### `isDynamic(value)`

```js
function isDynamic(value) {
  return typeof value === 'string' && (
    value.includes(EXPR_SENTINEL) || value.includes(CONTENT_SENTINEL)
  );
}
```

Rules skip further validation when `isDynamic(value)` is true.

## ARIA Utilities (`lib/utils/aria.js`)

Thin wrappers over `aria-query` v5.

### `isValidRole(role)`

Returns `true` if `role` is a known, non-abstract ARIA role. Uses `roles.get(role)?.abstract === false`.

### `getRequiredPropsForRole(role)`

Returns `string[]` of required ARIA property names for the given role. Reads `roles.get(role)?.requiredProps`.

### `isValidAriaProperty(name)`

Returns `true` if `name` (e.g. `aria-label`) is a valid ARIA property. Uses `aria.has(name)`.

### `validateAriaPropertyValue(name, value)`

Returns `true` if `value` is a valid value for the ARIA property `name`. Type dispatch:

| aria-query type | Validation |
|-----------------|-----------|
| `boolean` | `value ∈ { 'true', 'false' }` |
| `tristate` | `value ∈ { 'true', 'false', 'mixed' }` |
| `token` | `value ∈ allowedValues` |
| `tokenlist` | all space-separated tokens ∈ allowedValues |
| `integer` | `/^-?\d+$/.test(value)` |
| `number` | `!isNaN(Number(value))` |
| `string` | always valid |
| `id`, `idlist` | always valid (content not checked) |

### `aria-query` v5 Quirks

- All roles have `requiredProps: {}` at minimum (never `null` or `undefined`). The `?.requiredProps ?? {}` guard is defensive.
- `aria.get(prop)` always returns a value when `aria.has(prop)` is true. The `if (!typeDef) return` guard is similarly defensive.
- v8 coverage maps these impossible branches to surrounding lines — covered with `/* c8 ignore next */` pragmas.

## Coverage Strategy

Tests use **Vitest** with `@vitest/coverage-v8`. Thresholds: 100% on all four metrics (statements, branches, functions, lines).

### `/* c8 ignore */` pragmas

Used sparingly for v8 source-map artifacts — impossible branches that v8 incorrectly attributes to reachable lines:

| Location | Reason |
|----------|--------|
| `aria.js` `getRequiredPropsForRole` | `?.requiredProps ?? {}` — aria-query always populates this |
| `dom.js` `getTextContent` | optional-chain branches from `getAttr` callback mapped to JSDoc lines |
| `aria-props.js` Attribute visitor | `typeof name !== 'string'` — parser always produces string keys |
| `aria-proptypes.js` | `if (!typeDef) return` — `aria.has()` guarantees non-null |
| `xml-content-asset.js` processor object | v8 phantom function/branch entries for object methods |
| `linter.js` (CLI) expandPaths phantom branch | v8 maps JSDoc line as phantom branch |

### Subprocess coverage exclusions

The CLI `bin/sfcc-a11y.js` is excluded from coverage (`/* c8 ignore file */`) because it is an executable entry point that can only be tested via subprocess — not inlined into vitest.

## Rule Implementation Pattern

Each rule follows this skeleton:

```js
export default {
  meta: {
    type: 'problem',
    docs: { description: '...', url: '...' },
    messages: { errorKey: 'Error message text.' },
    schema: [],
  },
  create(context) {
    return {
      Tag(node) {
        if (node.name !== 'targetTag') return;
        // ...validate...
        context.report({ node, messageId: 'errorKey' });
      },
    };
  },
};
```

Rules use only `Tag` and `Attribute` selectors — the HTML AST has no `Program` or `JSXElement` nodes.

## Test Infrastructure

### `RuleTester` setup (`tests/rules/helpers.js`)

```js
import { RuleTester } from 'eslint';
import * as htmlParser from '@html-eslint/parser';

export function createRuleTester() {
  return new RuleTester({
    languageOptions: { parser: htmlParser },
  });
}
```

### Test structure

Each rule test file:
1. Creates a `RuleTester` via `createRuleTester()`
2. Calls `tester.run(ruleName, rule, { valid: [...], invalid: [...] })`
3. Invalid cases include `errors: [{ messageId: '...' }]`

### Processor tests

Processor tests call `preprocess` and `postprocess` directly (unit tests, no ESLint involved). They verify:
- Block count and content
- Virtual filename uniqueness
- Line offset arithmetic for both CDATA and entity-encoded formats

### Sanitizer tests

Sanitizer tests call `sanitize(isml)` directly and check the resulting HTML string for sentinel values and removed tags.
