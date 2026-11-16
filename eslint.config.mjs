import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Listing photos come from each agency's own host; next/image would proxy them through this server.
    rules: { "@next/next/no-img-element": "off" },
  },
  {
    // Search logic ported unchanged from the previous UI (central_mcp/web). It keeps the latest
    // props in refs for async callbacks; the React Compiler rules reject that pattern.
    files: [
      "src/catalog/use-paged-search.ts",
      "src/components/search/LoadMore.tsx",
      "src/components/search/FilterPanel.tsx",
    ],
    rules: {
      "react-hooks/refs": "off",
      "react-hooks/immutability": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "src/generated/**",
  ]),
]);

export default eslintConfig;
