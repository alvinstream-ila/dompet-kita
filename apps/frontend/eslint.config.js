import nextVitals from "eslint-config-next/core-web-vitals";
import reactHooks from "eslint-plugin-react-hooks";
import pluginSecurity from "eslint-plugin-security";
import globals from "globals";
import tseslint from "typescript-eslint";

const config = [
	{
		ignores: ["dist", ".next", "node_modules", "next-env.d.ts"],
	},
	...nextVitals,
	...tseslint.configs.recommended,
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
