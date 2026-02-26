# Functional Specifications — eslint-plugin-sfcc-a11y

## Purpose

`eslint-plugin-sfcc-a11y` brings automated WCAG 2.2 Level A and AA accessibility linting to Salesforce Commerce Cloud (SFCC) projects. It integrates with ESLint to check ISML templates and XML library content assets — the two SFCC-specific formats that no existing accessibility tool covers.

## Target Audience

- Front-end developers building or maintaining SFCC storefronts
- Accessibility engineers auditing SFCC projects
- CI/CD pipelines enforcing a11y standards before deployment

## Supported File Formats

| Format | Extension pattern | How it works |
|--------|------------------|--------------|
| ISML templates | `**/*.isml` | Sanitizer strips ISML-specific syntax, then `@html-eslint/parser` parses the resulting HTML |
| XML content assets | `**/libraries/**/*.xml` | XML processor extracts HTML from `<custom-attribute attribute-id="body">` elements (CDATA and entity-encoded), then `@html-eslint/parser` parses each extracted block |

## Rule Catalogue

All rules are set to `"warn"` in the recommended config. None auto-fix.

---

### `img-alt` — WCAG 1.1.1 (Level A)

Every `<img>` element must have an `alt` attribute with a non-empty value.

**Valid**
```html
<img src="logo.png" alt="Company logo">
<img src="spacer.gif" alt="">           <!-- decorative: empty alt is allowed -->
<img src="hero.jpg" alt="${imageAlt}">  <!-- dynamic value: treated as non-empty -->
<img src="icon.png" role="none">        <!-- presentational role: exempt -->
<img src="icon.png" aria-hidden="true"> <!-- hidden from AT: exempt -->
```

**Invalid**
```html
<img src="logo.png">                    <!-- missing alt -->
<img src="logo.png" alt>               <!-- boolean alt (no value) -->
<img src="logo.png" alt="">            <!-- but only for non-decorative images in context -->
```

---

### `label` — WCAG 1.3.1 (Level A)

Form controls must have an associated label. A control is considered labelled if any of the following is true:
- It is wrapped in a `<label>` element
- A `<label for="id">` matches the control's `id`
- It has a non-empty `aria-label` attribute
- It has an `aria-labelledby` attribute

Applies to: `input` (all types except `hidden`, `button`, `submit`, `reset`, `image`), `select`, `textarea`.

**Valid**
```html
<label>Email <input type="email"></label>
<label for="q">Search</label> <input id="q" type="search">
<input type="email" aria-label="Email address">
<input type="hidden" name="csrf">    <!-- hidden inputs are exempt -->
<input type="submit" value="Send">   <!-- button-type inputs are exempt -->
```

**Invalid**
```html
<input type="email">                 <!-- no label of any kind -->
<input type="text" id="name">        <!-- id present but no matching label -->
```

> **Known limitation:** Label/input association only works within the same file. SFCC projects often split labels and inputs across `<isinclude>` boundaries. Suppress with `<%-- eslint-disable-next-line sfcc-a11y/label --%>`.

---

### `html-has-lang` — WCAG 3.1.1 (Level A)

The `<html>` element must have a non-empty `lang` attribute so screen readers announce the correct language.

**Valid**
```html
<html lang="en">
<html lang="${pageLang}">
```

**Invalid**
```html
<html>
<html lang>
<html lang="">
```

---

### `link-name` — WCAG 2.4.4 (Level A)

`<a>` elements must have discernible text so users understand the link destination.

Accepted sources of discernible text:
- Non-whitespace text content (including nested elements)
- Non-empty `aria-label`
- `aria-labelledby` attribute
- Non-empty `title` attribute

**Valid**
```html
<a href="/products">Shop now</a>
<a href="/cart" aria-label="View cart">🛒</a>
<a href="/help" title="Help center"><img src="help.svg" alt=""></a>
```

**Invalid**
```html
<a href="/products"></a>
<a href="/products">   </a>
<a href="/products"><img src="arrow.svg"></a>   <!-- img has no alt -->
```

---

### `button-name` — WCAG 4.1.2 (Level A)

`<button>` elements must have discernible text so users understand the action.

Accepted sources: text content, `aria-label`, `aria-labelledby`, `title`.

**Valid**
```html
<button>Add to cart</button>
<button aria-label="Close dialog">×</button>
<button title="Delete"><img src="trash.svg" alt=""></button>
```

**Invalid**
```html
<button></button>
<button aria-label="  "></button>
```

---

### `heading-has-content` — WCAG 2.4.6 (Level AA)

`<h1>` through `<h6>` must have non-empty text content so users can navigate by headings.

**Valid**
```html
<h1>Welcome to our store</h1>
<h2><a href="/sale">Sale</a></h2>
<h3>${pageTitle}</h3>
```

**Invalid**
```html
<h2></h2>
<h3>   </h3>
```

---

### `anchor-is-valid` — WCAG 2.4.4 (Level A)

`<a>` elements must serve as navigation links: they must have an `href` attribute with a non-empty, non-`#` value, or a valid URL fragment.

**Valid**
```html
<a href="/products">Products</a>
<a href="#main-content">Skip to content</a>
<a href="${product.url}">View product</a>
```

**Invalid**
```html
<a>Click here</a>           <!-- no href -->
<a href="#">Click here</a>  <!-- href="#" is not navigating -->
<a href="">Click here</a>   <!-- empty href -->
```

---

### `no-distracting-elements` — WCAG 2.2.2 (Level A)

`<marquee>` and `<blink>` cause automatic movement that cannot be paused and are disorienting for users with cognitive disabilities. Both are forbidden.

**Invalid**
```html
<marquee>Free shipping on orders over $50</marquee>
<blink>Sale!</blink>
```

---

### `tabindex-no-positive` — WCAG 2.4.3 (Level AA)

`tabindex` must be `0` or `-1`. Positive `tabindex` values override the natural document tab order and create a confusing experience for keyboard users.

**Valid**
```html
<div role="button" tabindex="0">Press me</div>
<div tabindex="-1">Programmatically focusable</div>
```

**Invalid**
```html
<div tabindex="1">First!</div>
<button tabindex="99">Last!</button>
```

---

### `aria-role` — WCAG 4.1.2 (Level A)

`role` attribute values must be valid, non-abstract ARIA roles from the WAI-ARIA 1.2 specification.

**Valid**
```html
<div role="button">Press me</div>
<nav role="navigation">...</nav>
<div role="button navigation">Multiple roles allowed</div>
```

**Invalid**
```html
<div role="superman">...</div>   <!-- not an ARIA role -->
<div role="command">...</div>    <!-- abstract role — not for authors -->
```

---

### `aria-props` — WCAG 4.1.2 (Level A)

`aria-*` attribute names must be valid ARIA properties from the WAI-ARIA 1.2 specification.

**Valid**
```html
<button aria-expanded="false">Menu</button>
<input aria-required="true">
```

**Invalid**
```html
<div aria-labeledby="title">...</div>   <!-- typo: labeledby → labelledby -->
<div aria-foo="bar">...</div>           <!-- not an ARIA property -->
```

---

### `aria-required-attr` — WCAG 4.1.2 (Level A)

Elements with ARIA roles that have required properties must include those properties.

**Valid**
```html
<div role="checkbox" aria-checked="false">Option</div>
<div role="combobox" aria-expanded="false" aria-controls="listbox1">...</div>
```

**Invalid**
```html
<div role="checkbox">Option</div>         <!-- missing aria-checked -->
<div role="combobox" aria-expanded="false">...</div>  <!-- missing aria-controls -->
```

---

### `aria-proptypes` — WCAG 4.1.2 (Level A)

`aria-*` attribute values must match the expected type for the property.

| ARIA type | Valid values |
|-----------|-------------|
| `boolean` | `"true"`, `"false"` |
| `tristate` | `"true"`, `"false"`, `"mixed"` |
| `token` | One of the allowed token values |
| `tokenlist` | Space-separated list of allowed token values |
| `integer` | Whole number |
| `number` | Any number |
| `string` | Any string |

**Valid**
```html
<button aria-pressed="true">Bold</button>
<div aria-live="polite">Status</div>
```

**Invalid**
```html
<button aria-pressed="yes">Bold</button>    <!-- not a boolean value -->
<div aria-live="immediately">Status</div>   <!-- not a valid token -->
```

---

### `no-redundant-role` — WCAG 4.1.2 (Level AA)

Explicit `role` values that duplicate the element's implicit (native) ARIA role add noise and can confuse assistive technologies.

**Valid**
```html
<nav role="navigation">...</nav>   <!-- wait: nav's implicit role IS navigation, so this is redundant -->
<div role="navigation">...</div>   <!-- div has no implicit role: this is fine -->
<button role="button">OK</button>  <!-- redundant — flagged -->
```

**Invalid**
```html
<button role="button">OK</button>
<nav role="navigation">...</nav>
<a href="/home" role="link">Home</a>
```

---

### `interactive-supports-focus` — WCAG 2.1.1 (Level A)

Elements with interactive ARIA roles (`button`, `link`, `checkbox`, `menuitem`, etc.) must be keyboard-focusable. An element is focusable if it is a natively focusable element (e.g. `<button>`) or has `tabindex="0"` or `tabindex="-1"`.

**Valid**
```html
<div role="button" tabindex="0">Press me</div>
<div role="button" tabindex="-1">Programmatic only</div>
<button role="button">Native</button>
```

**Invalid**
```html
<div role="button">No tabindex</div>
<span role="link">Not focusable</span>
```

---

## ISML-Specific Behaviour

ISML template files contain syntax that is not valid HTML. The built-in sanitizer transforms the following before parsing:

| ISML syntax | Treatment |
|-------------|-----------|
| `${expr}` in attribute values | Replaced with `__ISML_EXPR__` — treated as non-empty value, never triggers missing-value errors |
| `<isif>`, `<isloop>`, `<iselse>`, `<iselseif>` | Stripped (block structure removed, content preserved) |
| `<isinclude>`, `<isscript>`, `<iscomment>` | Replaced with whitespace |
| `<isprint value="${expr}">` | Replaced with `__ISML_CONTENT__` text node |
| `<ispicture>`, `<iscontentasset>` | Replaced with `__ISML_CONTENT__` text node (prevents false positives on wrapping links/buttons) |
| `{{expr}}` (Mustache/Handlebars) | Attribute values → `__ISML_EXPR__`; text nodes → `__ISML_CONTENT__` |

## XML Content Asset Behaviour

SFCC content library XML files store HTML in two formats:

**CDATA format** (typical in manually edited files):
```xml
<custom-attribute attribute-id="body"><![CDATA[
  <img src="hero.jpg" alt="Summer sale">
]]></custom-attribute>
```

**Entity-encoded format** (Business Manager export format):
```xml
<custom-attribute attribute-id="body" xml:lang="en-DE">
  &lt;img src="hero.jpg" alt="Summer sale"&gt;
</custom-attribute>
```

Both formats are supported. The processor extracts the HTML, runs the linter, and maps error line numbers back to the original XML file.

## Known Limitations

1. **Cross-file label/input association** — `label` can only match `<label for="x">` to `<input id="x">` within the same file. SFCC projects often split labels and inputs across `<isinclude>` boundaries. Suppress with `<%-- eslint-disable-next-line sfcc-a11y/label --%>`.

2. **Dynamic expressions** — Any attribute containing `${...}` is considered non-empty. This prevents false positives but means rules cannot verify what the expression evaluates to at runtime.

3. **ISML template composition** — The sanitizer processes each file independently. Accessibility relationships that span multiple files (e.g. `aria-labelledby` pointing to an element in an included file) cannot be verified.
