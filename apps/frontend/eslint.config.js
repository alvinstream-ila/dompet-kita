import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import pluginSecurity from "eslint-plugin-security";
import globals from "globals";
import tseslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
});

const config = [
	{
		ignores: ["dist", ".next", "node_modules", "next-env.d.ts"],
	},
	js.configs.recommended,
	...tseslint.configs.recommended,
	...compat.extends("next/core-web-vitals"),
	{
		files: ["**/*.{ts,tsx}"],
		plugins: {
			"react-hooks": reactHooks,
			security: pluginSecurity,
		},
		languageOptions: {
			ecmaVersion: 2020,
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
		rules: {
			...reactHooks.configs.recommended.rules,
			"@typescript-eslint/no-explicit-any": "error",
			"security/detect-object-injection": "off",
			"security/detect-possible-timing-attacks": "off",
		},
	},
];

export default config;
