// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  vite: {
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: '/api' // Базовый путь для API
    }
  },
  css: [
    './assets/css/reset.css' // Сброс стилей CSS
  ]
})