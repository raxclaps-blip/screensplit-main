import { FlatCompat } from "@eslint/eslintrc";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["app/**/*.{js,jsx,ts,tsx}", "components/**/*.{js,jsx,ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "JSXElement:has(JSXOpeningElement > JSXIdentifier[name='Scissors']):has(JSXText[value=/Screensplit/])",
          message:
            "Use the shared <Logo /> component instead of inline Scissors + Screensplit brand markup.",
        },
      ],
    },
  },
];
