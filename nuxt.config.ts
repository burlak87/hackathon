// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	vite: {
		server: {
			proxy: {
				'/api': {
					target: 'http://localhost:5000',
					changeOrigin: true,
					rewrite: path => path.replace(/^\/api/, ''),
				},
			},
		},
	},
	runtimeConfig: {
		public: {
			apiBaseUrl: '/api', // Базовый путь для API
		},
	},
	css: [
		'./assets/css/reset.css', // Сброс стилей CSS
	],
})

// // https://nuxt.com/docs/api/configuration/nuxt-config
// export default defineNuxtConfig({
// 	// DevTools для отладки (включает инспектор модулей, Pinia, компонентов и т.д.)
// 	devtools: { enabled: true },
// 	// Модули (автоматическая установка и конфигурация)
// 	modules: [
// 		'@nuxt/eslint', // Интеграция ESLint (настройте в .eslintrc.js)
// 		'@nuxt/fonts', // Шрифты
// 		'@nuxt/icon', // Иконки
// 		'@nuxt/image', // Изображения
// 		// '@nuxt/scripts',  // Скрипты (экспериментальный; закомментируйте, если ошибки)
// 		'@nuxtjs/robots', // Robots.txt
// 		'@nuxtjs/sitemap', // Sitemap.xml
// 		'@pinia/nuxt', // Pinia state management
// 		'@vueuse/nuxt', // VueUse composables (автоимпорт useStorage, useFetch и т.д.)
// 		// Нет @unhead/nuxt — используйте встроенные useHead(), useSeoMeta()
// 	],
// 	// Модульные опции (с @ts-ignore, если типы не подхвачены после nuxi prepare)
// 	// @ts-ignore — Опции от @nuxt/fonts (типы динамические)
// 	fonts: {
// 		provider: 'google', // Или 'local' для self-hosting
// 		families: [{ name: 'Inter', provider: 'google' }], // Пример: добавьте шрифты
// 	},
// 	// @ts-ignore — Опции от @nuxt/icon
// 	icon: {
// 		provider: 'heroicons', // Или 'lucide', 'mdi'
// 		collections: ['heroicons'], // Автоимпорт иконок
// 	},
// 	// @ts-ignore — Опции от @nuxt/image
// 	image: {
// 		provider: 'ipx', // Локальный провайдер; или 'cloudinary' для облака
// 		ipx: { modifiers: { format: 'webp', quality: 80 } }, // Оптимизация
// 		domains: ['localhost:5000', 'your-backend-domain.com'], // Разрешённые домены (добавьте ваш backend)
// 		screens: { xs: 320, s: 640, m: 768, l: 1024, xl: 1280, xxl: 1536 }, // Responsive
// 	},
// 	// Если @nuxt/scripts установлен, раскомментируйте (с @ts-ignore):
// 	// @ts-ignore
// 	// scripts: {
// 	//   googleAnalytics: { id: 'GA_MEASUREMENT_ID' },  // Пример: внешний скрипт
// 	//   strategy: 'defer'  // Стратегия загрузки
// 	// },
// 	// @ts-ignore — Опции от @nuxtjs/robots
// 	robots: {
// 		rules: [{ UserAgent: '*', Disallow: '/admin' }], // Правила для роботов
// 		sitemap: true, // Авто-добавление sitemap
// 	},
// 	// @ts-ignore — Опции от @nuxtjs/sitemap
// 	sitemap: {
// 		hostname: 'https://your-site.com', // Замените на ваш домен
// 		routes: ['/about', '/contact'], // Динамические роуты (авто-генерация; добавьте свои)
// 		defaults: { changefreq: 'daily', priority: 1 }, // SEO-настройки
// 	},
// 	// @ts-ignore — Опции от @pinia/nuxt
// 	pinia: {
// 		storesDirs: ['./stores/**'], // Директория для Pinia-сторов
// 		autoImports: ['defineStore', 'acceptHMRUpdate'], // Автоимпорт
// 	},
// 	// Дополнительно для вашего проекта
// 	ssr: true, // SSR включено (по умолчанию)
// 	nitro: {
// 		preset: 'node-server', // Для интеграции с Express backend (улучшает SSR и API-роутинг)
// 	},
// 	// Vite proxy для dev (прокси API-запросов к backend на localhost:5000)
// 	// ИСПРАВЛЕНО: Явная типизация path как string
// 	vite: {
// 		server: {
// 			proxy: {
// 				'/api': {
// 					target: 'http://localhost:5000',
// 					changeOrigin: true,
// 					rewrite: (path: string) => path.replace(/^\/api/, ''), // path: string — фикс TS-ошибки
// 				},
// 			},
// 		},
// 	},
// 	// Runtime config (расширен для API; доступно через useRuntimeConfig())
// 	runtimeConfig: {
// 		public: {
// 			apiBaseUrl: '/api', // Базовый путь для API (в dev проксируется на 5000)
// 			// Добавьте другие публичные переменные, напр.:
// 			// siteName: 'My Nuxt App',
// 			// apiKey: process.env.API_KEY  // Для приватных — в private
// 		},
// 	},
// 	// TypeScript
// 	typescript: { strict: true },
// 	// CSS (объединён: reset + main.scss; используйте SASS, если установлен)
// 	css: [
// 		'~/assets/css/reset.css', // Сброс стилей
// 		'~/assets/css/main.scss', // Основные стили (SASS)
// 	],
// 	// Глобальные head-теги (встроенный Unhead; без hid)
// 	app: {
// 		head: {
// 			title: 'My Nuxt App', // Базовый title (может переопределяться в страницах)
// 			meta: [
// 				{ charset: 'utf-8' }, // Кодировка (всегда первая)
// 				{ name: 'viewport', content: 'width=device-width, initial-scale=1' }, // Responsive
// 				{ name: 'description', content: 'Описание вашего приложения' }, // Описание (Unhead управляет ID автоматически)
// 				// Если нужно Open Graph или другие: добавьте здесь или в useSeoMeta()
// 				// { property: 'og:title', content: 'OG Title' },
// 				// { property: 'og:description', content: 'OG Desc' }
// 			],
// 			link: [
// 				{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }, // Favicon
// 				// Другие: напр. { rel: 'canonical', href: 'https://your-site.com' }
// 			],
// 			// Script (если нужны глобальные, напр. для аналитики)
// 			// script: [
// 			//   { src: 'https://example.com/global.js', defer: true }
// 			// ]
// 		},
// 	},
// })
