/**
 * Enforce use of the shared Logo component instead of inline
 * Scissors + Screensplit brand lockups.
 */
const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Require the global Logo component for brand lockups instead of inline Scissors + Screensplit markup.",
    },
    schema: [],
    messages: {
      useGlobalLogo:
        "Use the shared <Logo /> component instead of inline Scissors + Screensplit brand markup.",
    },
  },

  create(context) {
    const sourceCode = context.sourceCode;

    const hasInlineBrandLockup = (node) => {
      const text = sourceCode.getText(node);
      return text.includes("<Scissors") && text.includes("Screensplit");
    };

    const parentAlsoMatches = (node) => {
      const parent = node.parent;
      if (!parent) return false;
      if (parent.type !== "JSXElement" && parent.type !== "JSXFragment") {
        return false;
      }
      return hasInlineBrandLockup(parent);
    };

    return {
      JSXElement(node) {
        if (!hasInlineBrandLockup(node)) return;
        if (parentAlsoMatches(node)) return;

        context.report({
          node: node.openingElement,
          messageId: "useGlobalLogo",
        });
      },
    };
  },
};

export default rule;
