/**
 * Rule: interactive-supports-focus
 *
 * Requires elements with interactive ARIA roles (button, link, checkbox, etc.)
 * to be keyboard-focusable. An element with an interactive role but no way to
 * receive focus cannot be operated by keyboard or switch device users.
 *
 * An element is focusable when it is:
 *   - A natively focusable element (a, button, input, etc.), OR
 *   - Has a tabindex attribute (any value, including -1)
 *
 * WCAG 2.1.1 Keyboard (Level A)
 *
 * Inspired by: eslint-plugin-jsx-a11y/interactive-supports-focus
 */

const { getAttr, isNativelyFocusable, isInteractiveRole } = require('../utils/dom.js');
const { isDynamic } = require('../utils/isml.js');

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require elements with interactive ARIA roles to be keyboard-focusable (WCAG 2.1.1)',
      recommended: true,
    },
    messages: {
      notFocusable:
        'Elements with role="{{role}}" must be focusable. Add tabindex="0" or use a natively focusable element.',
    },
    schema: [],
  },

  create(context) {
    return {
      Tag(node) {
        const role = getAttr(node, 'role');
        if (!role || role === true || isDynamic(role)) return;

        const primaryRole = role.trim().split(/\s+/)[0];
        if (!isInteractiveRole(primaryRole)) return;

        // Natively focusable elements are always focusable
        if (isNativelyFocusable(node.name.toLowerCase())) return;

        const tabindex = getAttr(node, 'tabindex');
        // Any tabindex value (including -1) makes the element programmatically focusable
        if (tabindex !== undefined && isDynamic(tabindex !== true ? tabindex : '')) return;
        if (tabindex !== undefined) return;

        context.report({
          node,
          messageId: 'notFocusable',
          data: { role: primaryRole },
        });
      },
    };
  },
};
