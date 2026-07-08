import eslintPluginNext from "eslint-plugin-next";

export default [
  {
    plugins: {
      next: eslintPluginNext,
    },
    rules: {
      "next/core-web-vitals": "warn",
    },
  },
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
];
