import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // 允许使用 any 类型（在某些情况下是必要的）
      "@typescript-eslint/no-explicit-any": "off",

      // 允许未使用的变量（在开发阶段很常见）
      "@typescript-eslint/no-unused-vars": "off",

      // 允许使用 require() 导入（某些库需要动态导入）
      "@typescript-eslint/no-require-imports": "off",

      // 关闭 React Hooks 依赖检查
      "react-hooks/exhaustive-deps": "off",

      // 允许在 JSX 中使用未转义的引号
      "react/no-unescaped-entities": "off",

      // 允许在非 React 函数中调用 hooks（某些工具函数需要）
      "react-hooks/rules-of-hooks": "warn",

      // 允许使用 prefer-const 的警告而不是错误
      "prefer-const": "warn"
    }
  }
];

export default eslintConfig;
