// .eslintrc.js
module.exports = {
	root: true,
	env: { browser: true, es2022: true, node: true },
	extends: [
		'eslint:recommended',
		'@vue/eslint-config-typescript',
		'plugin:vue/vue3-essential', // Или 'vue3-recommended' для строгих правил
		'@nuxt/eslint-config', // Nuxt-specific правила
	],
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
		parser: '@typescript-eslint/parser',
	},
	rules: {
		// Ваши правила, напр.:
		'vue/multi-word-component-names': 'off',
		'@typescript-eslint/no-unused-vars': 'warn',
	},
	globals: {
		// Глобальные переменные Nuxt
		defineNuxtConfig: 'readonly',
		definePageMeta: 'readonly',
	},
}
